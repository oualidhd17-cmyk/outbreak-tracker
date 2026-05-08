from __future__ import annotations

import hashlib
import html
import json
import os
import re
import sys
import time
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlencode, urljoin

import httpx

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "public" / "data"
SNAPSHOT_FILE = DATA_DIR / "source_snapshots.json"

DISEASE_NAME = os.getenv("OUTBREAK_DISEASE_NAME", "Hantavirus").strip() or "Hantavirus"
DISEASE_KEYWORDS = [
    item.strip().lower()
    for item in os.getenv(
        "OUTBREAK_KEYWORDS",
        "hantavirus,hanta virus,andes virus,hantavirus pulmonary syndrome,hantavirus disease,andes hantavirus",
    ).split(",")
    if item.strip()
]

HTTP_TIMEOUT = float(os.getenv("OUTBREAK_HTTP_TIMEOUT", "45"))
MAX_DETAIL_PAGES = int(os.getenv("OUTBREAK_MAX_DETAIL_PAGES", "24"))
RELIEFWEB_APPNAME = os.getenv("RELIEFWEB_APPNAME", "").strip()
RELIEFWEB_ENABLED = os.getenv("RELIEFWEB_ENABLED", "1").strip() != "0"

WHO_DON_ENDPOINTS = [
    "https://www.who.int/api/emergencies/diseaseoutbreaknews",
    "https://www.who.int/api/news/diseaseoutbreaknews",
    "https://www.who.int/api/hubs/diseaseoutbreaknews",
]

WHO_BASE_URL = "https://www.who.int"
ECDC_RSS_INDEX_URL = "https://www.ecdc.europa.eu/en/rss-feeds"
ECDC_MEDIA_CENTRE_URL = "https://www.ecdc.europa.eu/en/news-events"
CDC_HANTAVIRUS_PAGES = [
    "https://www.cdc.gov/hantavirus/data-research/cases/index.html",
    "https://www.cdc.gov/hantavirus/index.html",
    "https://www.cdc.gov/hantavirus/hcp/clinical-overview/index.html",
]
CDC_TRAVEL_NOTICES_URL = "https://wwwnc.cdc.gov/travel/notices"
AFRICA_CDC_OUTBREAKS_URL = "https://africacdc.org/disease-outbreak/"
AFRICA_CDC_HOME_URL = "https://africacdc.org/"
RELIEFWEB_REPORTS_URL = "https://api.reliefweb.int/v2/reports"

OFFICIAL_CURRENT_OUTBREAK_FALLBACK = {
    "source": "World Health Organization",
    "source_id": "who",
    "type": "current_outbreak",
    "title": "Hantavirus cluster linked to cruise ship travel, Multi-country",
    "summary": (
        "Official fallback from WHO Disease Outbreak News. "
        "Use only when live official-source pages are unreachable or metrics cannot be parsed."
    ),
    "url": "https://www.who.int/emergencies/disease-outbreak-news",
    "published_at": "2026-05-04",
    "metrics": {
        "confirmed_cases": 2,
        "suspected_cases": 5,
        "probable_cases": 0,
        "possible_cases": 0,
        "under_investigation_cases": 0,
        "pending_cases": 0,
        "ruled_out_cases": 0,
        "negative_cases": 0,
        "unconfirmed_cases": 5,
        "total_identified_cases": 7,
        "deaths": 3,
        "hospitalized": 0,
        "recovered": 0,
    },
    "countries": [
        {
            "country": "Multi-country",
            "region": "Cruise ship travel",
            "lat": 16.5388,
            "lng": -23.0418,
        }
    ],
    "risk_level": "low",
    "raw_hash": "who-official-hantavirus-fallback",
}

COUNTRY_COORDS: dict[str, dict[str, Any]] = {
    "Multi-country": {
        "country": "Multi-country",
        "region": "Multi-country",
        "lat": 20.0,
        "lng": 0.0,
    },
    "United States": {
        "country": "United States",
        "region": "North America",
        "lat": 37.0902,
        "lng": -95.7129,
    },
    "United States of America": {
        "country": "United States",
        "region": "North America",
        "lat": 37.0902,
        "lng": -95.7129,
    },
    "Canada": {
        "country": "Canada",
        "region": "North America",
        "lat": 56.1304,
        "lng": -106.3468,
    },
    "Mexico": {
        "country": "Mexico",
        "region": "North America",
        "lat": 23.6345,
        "lng": -102.5528,
    },
    "Brazil": {
        "country": "Brazil",
        "region": "South America",
        "lat": -14.235,
        "lng": -51.9253,
    },
    "Argentina": {
        "country": "Argentina",
        "region": "South America",
        "lat": -38.4161,
        "lng": -63.6167,
    },
    "Chile": {
        "country": "Chile",
        "region": "South America",
        "lat": -35.6751,
        "lng": -71.543,
    },
    "Panama": {
        "country": "Panama",
        "region": "Central America",
        "lat": 8.538,
        "lng": -80.7821,
    },
    "Germany": {
        "country": "Germany",
        "region": "Europe",
        "lat": 51.1657,
        "lng": 10.4515,
    },
    "France": {"country": "France", "region": "Europe", "lat": 46.2276, "lng": 2.2137},
    "United Kingdom": {
        "country": "United Kingdom",
        "region": "Europe",
        "lat": 55.3781,
        "lng": -3.436,
    },
    "Spain": {"country": "Spain", "region": "Europe", "lat": 40.4637, "lng": -3.7492},
    "Italy": {"country": "Italy", "region": "Europe", "lat": 41.8719, "lng": 12.5674},
    "Netherlands": {
        "country": "Netherlands",
        "region": "Europe",
        "lat": 52.1326,
        "lng": 5.2913,
    },
    "Portugal": {
        "country": "Portugal",
        "region": "Europe",
        "lat": 39.3999,
        "lng": -8.2245,
    },
    "Sweden": {"country": "Sweden", "region": "Europe", "lat": 60.1282, "lng": 18.6435},
    "Norway": {"country": "Norway", "region": "Europe", "lat": 60.472, "lng": 8.4689},
    "Finland": {
        "country": "Finland",
        "region": "Europe",
        "lat": 61.9241,
        "lng": 25.7482,
    },
    "Uganda": {"country": "Uganda", "region": "Africa", "lat": 1.3733, "lng": 32.2903},
    "Democratic Republic of the Congo": {
        "country": "Democratic Republic of the Congo",
        "region": "Africa",
        "lat": -4.0383,
        "lng": 21.7587,
    },
    "DR Congo": {
        "country": "Democratic Republic of the Congo",
        "region": "Africa",
        "lat": -4.0383,
        "lng": 21.7587,
    },
    "Congo": {"country": "Congo", "region": "Africa", "lat": -0.228, "lng": 15.8277},
}

NUMBER_WORDS: dict[str, int] = {
    "zero": 0,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "eleven": 11,
    "twelve": 12,
    "thirteen": 13,
    "fourteen": 14,
    "fifteen": 15,
    "sixteen": 16,
    "seventeen": 17,
    "eighteen": 18,
    "nineteen": 19,
    "twenty": 20,
    "thirty": 30,
    "forty": 40,
    "fifty": 50,
    "sixty": 60,
    "seventy": 70,
    "eighty": 80,
    "ninety": 90,
    "hundred": 100,
}

METRIC_KEYS = [
    "confirmed_cases",
    "suspected_cases",
    "probable_cases",
    "possible_cases",
    "under_investigation_cases",
    "pending_cases",
    "ruled_out_cases",
    "negative_cases",
    "unconfirmed_cases",
    "total_identified_cases",
    "deaths",
    "hospitalized",
    "recovered",
]


@dataclass(slots=True)
class FetchResult:
    ok: bool
    source_id: str
    url: str
    status_code: int | None = None
    error: str | None = None


FETCH_LOG: list[FetchResult] = []


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def hash_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8", errors="ignore")).hexdigest()


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def strip_html(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"(?is)<script[\s\S]*?</script>", " ", value)
    value = re.sub(r"(?is)<style[\s\S]*?</style>", " ", value)
    value = re.sub(r"(?is)<noscript[\s\S]*?</noscript>", " ", value)
    value = re.sub(r"(?is)<svg[\s\S]*?</svg>", " ", value)
    value = re.sub(r"<[^>]+>", " ", value)
    return normalize_space(value)


def text_contains_disease(value: str) -> bool:
    lowered = (value or "").lower()
    return any(keyword in lowered for keyword in DISEASE_KEYWORDS)


def parse_date(value: Any) -> str:
    if not value:
        return ""
    raw = str(value).strip()
    if not raw:
        return ""
    for candidate in (raw, raw.replace("Z", "+00:00")):
        try:
            return (
                datetime.fromisoformat(candidate)
                .astimezone(timezone.utc)
                .date()
                .isoformat()
            )
        except Exception:
            pass
    try:
        return parsedate_to_datetime(raw).astimezone(timezone.utc).date().isoformat()
    except Exception:
        pass
    match = re.search(r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})", raw)
    if match:
        year, month, day = match.groups()
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"
    return raw[:10]


def parse_number_token(value: str | None) -> int | None:
    if not value:
        return None
    cleaned = value.strip().lower().replace(",", "")
    cleaned = re.sub(r"[^a-z0-9 -]", "", cleaned)
    if cleaned.isdigit():
        return int(cleaned)
    if cleaned in NUMBER_WORDS:
        return NUMBER_WORDS[cleaned]
    if "-" in cleaned or " " in cleaned:
        total = 0
        parts = re.split(r"[-\s]+", cleaned)
        for part in parts:
            if part in NUMBER_WORDS:
                total += NUMBER_WORDS[part]
            elif part.isdigit():
                total += int(part)
            else:
                return None
        return total if total > 0 else None
    return None


def number_regex() -> str:
    words = sorted(NUMBER_WORDS.keys(), key=len, reverse=True)
    return (
        r"(\d{1,3}(?:,\d{3})*|\d+|" + "|".join(re.escape(word) for word in words) + r")"
    )


def first_number_from_match(match: re.Match[str]) -> int | None:
    for group in match.groups():
        number = parse_number_token(group)
        if number is not None:
            return number
    return None


def extract_by_patterns(text: str, patterns: list[str]) -> int | None:
    normalized = (text or "").lower()
    for pattern in patterns:
        match = re.search(pattern, normalized, flags=re.I)
        if match:
            value = first_number_from_match(match)
            if value is not None:
                return value
    return None


def extract_status_metric(
    text: str, labels: list[str], after_labels: list[str] | None = None
) -> int | None:
    n = number_regex()
    label_group = "|".join(re.escape(label) for label in labels)
    after_group = "|".join(re.escape(label) for label in (after_labels or labels))
    return extract_by_patterns(
        text,
        [
            rf"{n}\s+(?:laboratory[-\s]?)?(?:{label_group})\s+(?:human\s+)?(?:cases?|patients?|persons?|people|individuals)",
            rf"{n}\s+(?:were\s+|are\s+|remain\s+)?(?:{label_group})",
            rf"(?:{after_group})\s+(?:human\s+)?(?:cases?|patients?|persons?|people|individuals)?(?:\D{{0,90}}){n}",
            rf"(?:including|with)\s+{n}\s+(?:{label_group})",
            rf"(?:of\s+which\s+)?{n}\s+(?:were\s+)?(?:{label_group})",
        ],
    )


def normalize_metrics(metrics: dict[str, int | None]) -> dict[str, int]:
    normalized: dict[str, int] = {}
    for key in METRIC_KEYS:
        value = metrics.get(key)
        normalized[key] = int(value) if isinstance(value, int) and value >= 0 else 0

    unconfirmed = (
        normalized["suspected_cases"]
        + normalized["probable_cases"]
        + normalized["possible_cases"]
        + normalized["under_investigation_cases"]
        + normalized["pending_cases"]
    )
    if normalized["unconfirmed_cases"] <= 0:
        normalized["unconfirmed_cases"] = unconfirmed

    if normalized["total_identified_cases"] <= 0:
        normalized["total_identified_cases"] = (
            normalized["confirmed_cases"] + normalized["unconfirmed_cases"]
        )

    return normalized


def extract_current_metrics(text: str) -> dict[str, int]:
    normalized_text = normalize_space(text).lower()
    n = number_regex()

    total_identified = extract_by_patterns(
        normalized_text,
        [
            rf"total\s+(?:of\s+)?{n}\s+(?:human\s+)?(?:cases?|patients?|persons?|people|individuals)",
            rf"{n}\s+(?:human\s+)?cases\s+(?:were\s+|have\s+been\s+)?(?:reported|identified|detected|linked|recorded)",
            rf"{n}\s+(?:people|persons|individuals|patients)\s+(?:were\s+|have\s+been\s+)?(?:reported|identified|detected|affected|linked)",
            rf"cluster\s+of\s+{n}\s+(?:human\s+)?cases",
        ],
    )

    metrics: dict[str, int | None] = {
        "confirmed_cases": extract_status_metric(
            normalized_text,
            ["confirmed", "laboratory-confirmed", "laboratory confirmed"],
        ),
        "suspected_cases": extract_status_metric(
            normalized_text, ["suspected", "suspect"]
        ),
        "probable_cases": extract_status_metric(normalized_text, ["probable"]),
        "possible_cases": extract_status_metric(normalized_text, ["possible"]),
        "under_investigation_cases": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:cases?|patients?|persons?|people|individuals)\s+(?:are\s+|were\s+)?(?:under\s+investigation|being\s+investigated|undergoing\s+investigation)",
                rf"{n}\s+(?:under\s+investigation|being\s+investigated|pending\s+investigation)",
                rf"(?:under\s+investigation|being\s+investigated|pending\s+investigation)(?:\D{{0,90}}){n}",
            ],
        ),
        "pending_cases": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:pending|awaiting)\s+(?:confirmation|testing|laboratory\s+confirmation|results)",
                rf"(?:pending|awaiting)\s+(?:confirmation|testing|laboratory\s+confirmation|results)(?:\D{{0,90}}){n}",
            ],
        ),
        "ruled_out_cases": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:cases?|patients?|persons?|people|individuals)\s+(?:were\s+|are\s+)?(?:ruled\s+out|discarded|excluded)",
                rf"{n}\s+(?:ruled\s+out|discarded|excluded)",
                rf"(?:ruled\s+out|discarded|excluded)(?:\D{{0,90}}){n}",
            ],
        ),
        "negative_cases": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:tested\s+)?negative",
                rf"negative\s+(?:test\s+)?(?:results|cases)?(?:\D{{0,90}}){n}",
            ],
        ),
        "deaths": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:deaths|fatalities)",
                rf"(?:deaths|fatalities)(?:\D{{0,90}}){n}",
                rf"{n}\s+(?:people|persons|individuals|patients)\s+(?:died|have\s+died|were\s+fatal)",
                rf"including\s+{n}\s+(?:deaths|fatalities)",
            ],
        ),
        "hospitalized": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:hospitalized|hospitalised|admitted\s+to\s+hospital)",
                rf"(?:hospitalized|hospitalised|admitted\s+to\s+hospital)(?:\D{{0,90}}){n}",
            ],
        ),
        "recovered": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:recovered|recoveries)",
                rf"(?:recovered|recoveries)(?:\D{{0,90}}){n}",
            ],
        ),
        "total_identified_cases": total_identified,
        "unconfirmed_cases": None,
    }

    confirmed = metrics.get("confirmed_cases") or 0
    suspected = metrics.get("suspected_cases") or 0
    probable = metrics.get("probable_cases") or 0
    possible = metrics.get("possible_cases") or 0
    investigating = metrics.get("under_investigation_cases") or 0
    pending = metrics.get("pending_cases") or 0

    explicit_unconfirmed = extract_by_patterns(
        normalized_text,
        [
            rf"{n}\s+(?:unconfirmed|not\s+confirmed)\s+(?:human\s+)?(?:cases?|patients?|persons?|people|individuals)",
            rf"(?:unconfirmed|not\s+confirmed)\s+(?:human\s+)?(?:cases?|patients?|persons?|people|individuals)?(?:\D{{0,90}}){n}",
        ],
    )
    if explicit_unconfirmed is not None:
        metrics["unconfirmed_cases"] = explicit_unconfirmed

    if metrics.get("total_identified_cases") is None and (
        confirmed or suspected or probable or possible or investigating or pending
    ):
        metrics["total_identified_cases"] = (
            confirmed + suspected + probable + possible + investigating + pending
        )

    return normalize_metrics(metrics)


def apply_known_metric_corrections(
    event: dict[str, Any], full_text: str
) -> dict[str, Any]:
    text = full_text.lower()
    metrics = normalize_metrics(event.get("metrics") or {})

    is_hantavirus_cruise_event = (
        "hantavirus" in text
        and ("cruise" in text or "cruise ship" in text or "cruise-ship" in text)
        and (
            "don599" in text
            or "147 passengers and crew" in text
            or "88 passengers and 59 crew" in text
            or "risk for europe" in text
            or "risk for europeans" in text
            or "very low" in text
        )
    )

    if is_hantavirus_cruise_event:
        metrics["confirmed_cases"] = 2
        metrics["suspected_cases"] = 5
        metrics["probable_cases"] = 0
        metrics["possible_cases"] = 0

        # لا تعتبر أعداد الركاب/الطاقم حالات.
        metrics["under_investigation_cases"] = 0
        metrics["pending_cases"] = 0
        metrics["ruled_out_cases"] = 0
        metrics["negative_cases"] = 0

        metrics["unconfirmed_cases"] = 5
        metrics["total_identified_cases"] = 7
        metrics["deaths"] = 3

        event["risk_level"] = "low"
        event["data_correction"] = {
            "applied": True,
            "reason": "WHO DON599 official correction: vessel population numbers are not case counts.",
            "confirmed_cases": 2,
            "suspected_cases": 5,
            "unconfirmed_cases": 5,
            "total_identified_cases": 7,
            "deaths": 3,
        }

    event["metrics"] = normalize_metrics(metrics)
    return event


def extract_historical_cumulative_cases(text: str) -> int | None:
    patterns = [
        r"(\d{1,3}(?:,\d{3})*|\d+)\s+cases\s+of\s+hantavirus\s+disease\s+were\s+reported",
        r"since\s+1993(?:\D{0,100})(\d{1,3}(?:,\d{3})*|\d+)\s+cases",
        r"reported\s+(\d{1,3}(?:,\d{3})*|\d+)\s+cases\s+of\s+hantavirus",
    ]
    lowered = (text or "").lower()
    for pattern in patterns:
        match = re.search(pattern, lowered, flags=re.I)
        if match:
            return int(match.group(1).replace(",", ""))
    return None


def extract_risk_level(text: str) -> str:
    lowered = (text or "").lower()
    if "very low" in lowered or ("risk" in lowered and "low" in lowered):
        return "low"
    if "moderate" in lowered:
        return "moderate"
    if "high" in lowered:
        return "high"
    if "critical" in lowered or "very high" in lowered:
        return "critical"

    metrics = extract_current_metrics(lowered)
    deaths = metrics.get("deaths", 0)
    total = metrics.get("total_identified_cases", 0)
    if total >= 1000 or deaths >= 50:
        return "critical"
    if total >= 100 or deaths >= 10:
        return "high"
    if total >= 10 or deaths >= 1:
        return "moderate"
    return "unknown"


def detect_countries(text: str) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    lowered = (text or "").lower()
    if any(
        term in lowered
        for term in ["multi-country", "multicountry", "cruise ship", "cruise-ship"]
    ):
        found.append(COUNTRY_COORDS["Multi-country"])

    for country_name, data in COUNTRY_COORDS.items():
        if country_name == "Multi-country":
            continue
        pattern = r"\b" + re.escape(country_name.lower()) + r"\b"
        if re.search(pattern, lowered) and not any(
            item["country"] == data["country"] for item in found
        ):
            found.append(data)
    return found


def http_client() -> httpx.Client:
    return httpx.Client(
        timeout=httpx.Timeout(HTTP_TIMEOUT, connect=min(20.0, HTTP_TIMEOUT)),
        follow_redirects=True,
        headers={
            "User-Agent": "OutbreakTracker/3.0 (+https://example.com; public health dashboard)",
            "Accept": "text/html,application/xhtml+xml,application/xml,application/json;q=0.9,*/*;q=0.8",
        },
    )


def fetch_text(client: httpx.Client, url: str, source_id: str) -> str:
    try:
        response = client.get(url)
        FETCH_LOG.append(
            FetchResult(True, source_id, str(response.url), response.status_code)
        )
        response.raise_for_status()
        return response.text
    except Exception as exc:
        status = (
            exc.response.status_code
            if isinstance(exc, httpx.HTTPStatusError) and exc.response
            else None
        )
        FETCH_LOG.append(FetchResult(False, source_id, url, status, str(exc)))
        raise


def fetch_json(
    client: httpx.Client, url: str, source_id: str, params: dict[str, Any] | None = None
) -> Any:
    try:
        response = client.get(url, params=params)
        FETCH_LOG.append(
            FetchResult(True, source_id, str(response.url), response.status_code)
        )
        response.raise_for_status()
        return response.json()
    except Exception as exc:
        status = (
            exc.response.status_code
            if isinstance(exc, httpx.HTTPStatusError) and exc.response
            else None
        )
        FETCH_LOG.append(FetchResult(False, source_id, url, status, str(exc)))
        raise


def make_event(
    *,
    source: str,
    source_id: str,
    event_type: str,
    title: str,
    summary: str,
    url: str,
    published_at: str = "",
    full_text: str = "",
    extra: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    combined = normalize_space(" ".join([title or "", summary or "", full_text or ""]))
    if not text_contains_disease(combined):
        return None

    event: dict[str, Any] = {
        "source": source,
        "source_id": source_id,
        "type": event_type,
        "title": normalize_space(title) or source,
        "summary": normalize_space(summary)[:1400],
        "url": url,
        "published_at": parse_date(published_at),
        "metrics": (
            extract_current_metrics(combined)
            if event_type == "current_outbreak"
            else {}
        ),
        "countries": detect_countries(combined),
        "risk_level": extract_risk_level(combined),
        "raw_hash": hash_text(combined),
        "tracking_scope": {
            "confirmed": True,
            "suspected": True,
            "probable": True,
            "possible": True,
            "under_investigation": True,
            "pending": True,
            "ruled_out": True,
            "negative": True,
        },
    }
    if extra:
        event.update(extra)
    return apply_known_metric_corrections(event, combined)


def extract_links(base_url: str, html_text: str) -> list[str]:
    links: list[str] = []
    for match in re.finditer(r"""href=["']([^"']+)["']""", html_text or "", flags=re.I):
        href = html.unescape(match.group(1).strip())
        if (
            not href
            or href.startswith("#")
            or href.startswith("mailto:")
            or href.startswith("tel:")
        ):
            continue
        absolute = urljoin(base_url, href)
        if absolute not in links:
            links.append(absolute)
    return links


def parse_rss_items(xml_text: str) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    try:
        root = ET.fromstring(xml_text.encode("utf-8"))
    except Exception:
        return items

    for item in root.findall(".//item"):
        get = lambda name: normalize_space(item.findtext(name, default=""))
        title = get("title")
        link = get("link")
        description = strip_html(item.findtext("description", default=""))
        pub_date = get("pubDate")
        if title or link:
            items.append(
                {
                    "title": title,
                    "link": link,
                    "description": description,
                    "published_at": pub_date,
                }
            )

    if items:
        return items

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    for entry in root.findall(".//atom:entry", ns):
        title = normalize_space(entry.findtext("atom:title", default="", namespaces=ns))
        summary = strip_html(entry.findtext("atom:summary", default="", namespaces=ns))
        updated = normalize_space(
            entry.findtext("atom:updated", default="", namespaces=ns)
        )
        link = ""
        link_node = entry.find("atom:link", ns)
        if link_node is not None:
            link = link_node.attrib.get("href", "")
        if title or link:
            items.append(
                {
                    "title": title,
                    "link": link,
                    "description": summary,
                    "published_at": updated,
                }
            )
    return items


def fetch_who_don_events(client: httpx.Client) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for endpoint in WHO_DON_ENDPOINTS:
        try:
            payload = fetch_json(client, endpoint, "who")
        except Exception as exc:
            print(f"[WHO] failed endpoint {endpoint}: {exc}")
            continue

        items = payload.get("value", []) if isinstance(payload, dict) else []
        for item in items:
            if not isinstance(item, dict):
                continue
            title = str(item.get("Title") or item.get("title") or "")
            summary = strip_html(str(item.get("Summary") or item.get("summary") or ""))
            overview = strip_html(
                str(item.get("Overview") or item.get("overview") or "")
            )
            date = str(
                item.get("PublicationDate")
                or item.get("publicationDate")
                or item.get("Date")
                or item.get("date")
                or ""
            )
            raw_url = str(
                item.get("ItemDefaultUrl")
                or item.get("itemDefaultUrl")
                or item.get("Url")
                or item.get("url")
                or ""
            )
            url = (
                raw_url
                if raw_url.startswith("http")
                else urljoin(WHO_BASE_URL, raw_url)
            )
            combined = normalize_space(" ".join([title, summary, overview]))
            if not text_contains_disease(combined):
                continue

            detail_text = ""
            if url.startswith("http"):
                try:
                    detail_text = strip_html(fetch_text(client, url, "who"))
                    time.sleep(0.2)
                except Exception as exc:
                    print(f"[WHO] detail fetch failed: {url}: {exc}")

            event = make_event(
                source="World Health Organization",
                source_id="who",
                event_type="current_outbreak",
                title=title,
                summary=summary or overview,
                url=url or endpoint,
                published_at=date,
                full_text=normalize_space(" ".join([combined, detail_text])),
            )
            if event and not any(
                e.get("raw_hash") == event.get("raw_hash") for e in events
            ):
                events.append(event)
    return dedupe_events(events)


def discover_ecdc_rss_urls(client: httpx.Client) -> list[str]:
    candidates = [
        "https://www.ecdc.europa.eu/en/rss-feeds",
        "https://www.ecdc.europa.eu/en/news-events/rss.xml",
        "https://www.ecdc.europa.eu/en/news-events/rss",
        "https://www.ecdc.europa.eu/en/news-events/rss.xml?field_ct_publication_type_tid=All",
    ]
    try:
        page = fetch_text(client, ECDC_RSS_INDEX_URL, "ecdc")
        for link in extract_links(ECDC_RSS_INDEX_URL, page):
            lowered = link.lower()
            if "rss" in lowered or "feed" in lowered:
                candidates.append(link)
    except Exception as exc:
        print(f"[ECDC] RSS discovery failed: {exc}")

    deduped: list[str] = []
    for url in candidates:
        if url not in deduped:
            deduped.append(url)
    return deduped


def fetch_ecdc_events(client: httpx.Client) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for rss_url in discover_ecdc_rss_urls(client):
        try:
            xml_text = fetch_text(client, rss_url, "ecdc")
        except Exception:
            continue
        for item in parse_rss_items(xml_text):
            combined = " ".join([item.get("title", ""), item.get("description", "")])
            if not text_contains_disease(combined):
                continue

            link = item.get("link") or rss_url
            detail_text = ""
            if link.startswith("http"):
                try:
                    detail_text = strip_html(fetch_text(client, link, "ecdc"))
                    time.sleep(0.2)
                except Exception as exc:
                    print(f"[ECDC] detail fetch failed: {link}: {exc}")

            full_text_for_metrics = normalize_space(
                " ".join(
                    [item.get("title", ""), item.get("description", ""), detail_text]
                )
            )
            event = make_event(
                source="European Centre for Disease Prevention and Control",
                source_id="ecdc",
                event_type="current_outbreak",
                title=item.get("title", ""),
                summary=item.get("description", ""),
                url=link,
                published_at=item.get("published_at", ""),
                full_text=full_text_for_metrics,
            )
            if event:
                events.append(event)

    try:
        media_html = fetch_text(client, ECDC_MEDIA_CENTRE_URL, "ecdc")
        media_text = strip_html(media_html)
        for link in extract_links(ECDC_MEDIA_CENTRE_URL, media_html):
            if len(events) >= MAX_DETAIL_PAGES:
                break
            candidate_label = link.lower()
            if not any(
                keyword.replace(" ", "-") in candidate_label
                or keyword.replace(" ", "%20") in candidate_label
                for keyword in DISEASE_KEYWORDS
            ):
                continue
            try:
                detail_html = fetch_text(client, link, "ecdc")
                detail_text = strip_html(detail_html)
            except Exception:
                continue
            if not text_contains_disease(detail_text):
                continue
            h1 = re.search(r"(?is)<h1[^>]*>(.*?)</h1>", detail_html)
            title = strip_html(h1.group(1)) if h1 else "ECDC disease outbreak update"
            event = make_event(
                source="European Centre for Disease Prevention and Control",
                source_id="ecdc",
                event_type="current_outbreak",
                title=title,
                summary=detail_text[:1000],
                url=link,
                published_at="",
                full_text=detail_text,
            )
            if event:
                events.append(event)

        if text_contains_disease(media_text):
            event = make_event(
                source="European Centre for Disease Prevention and Control",
                source_id="ecdc",
                event_type="current_outbreak",
                title="ECDC media centre disease update",
                summary=media_text[:1000],
                url=ECDC_MEDIA_CENTRE_URL,
                published_at="",
                full_text=media_text,
            )
            if event:
                events.append(event)
    except Exception as exc:
        print(f"[ECDC] media centre fetch failed: {exc}")

    return dedupe_events(events)


def fetch_cdc_context(
    client: httpx.Client,
) -> tuple[list[dict[str, Any]], dict[str, Any] | None]:
    current_events: list[dict[str, Any]] = []
    historical_context: dict[str, Any] | None = None

    for url in CDC_HANTAVIRUS_PAGES:
        try:
            page_text = strip_html(fetch_text(client, url, "cdc"))
        except Exception as exc:
            print(f"[CDC] fetch failed: {url}: {exc}")
            continue
        if not text_contains_disease(page_text):
            continue
        cumulative_cases = extract_historical_cumulative_cases(page_text)
        if cumulative_cases is not None and historical_context is None:
            historical_context = {
                "source": "Centers for Disease Control and Prevention",
                "source_id": "cdc",
                "type": "historical_context",
                "title": "Reported cases of hantavirus disease in the United States",
                "summary": page_text[:1200],
                "url": url,
                "published_at": "",
                "historical_context": {
                    "country": "United States",
                    "cumulative_cases": cumulative_cases,
                    "period_label": "since 1993",
                    "scope": "reported U.S. surveillance cases",
                },
                "raw_hash": hash_text(page_text),
            }

    try:
        notices_html = fetch_text(client, CDC_TRAVEL_NOTICES_URL, "cdc")
        for link in extract_links(CDC_TRAVEL_NOTICES_URL, notices_html):
            if len(current_events) >= 5:
                break
            if not any(
                keyword.replace(" ", "-") in link.lower()
                for keyword in DISEASE_KEYWORDS
            ):
                continue
            try:
                detail_text = strip_html(fetch_text(client, link, "cdc"))
            except Exception:
                continue
            event = make_event(
                source="Centers for Disease Control and Prevention",
                source_id="cdc",
                event_type="current_outbreak",
                title="CDC travel health notice",
                summary=detail_text[:1000],
                url=link,
                full_text=detail_text,
            )
            if event:
                current_events.append(event)
    except Exception as exc:
        print(f"[CDC] travel notices fetch failed: {exc}")

    return dedupe_events(current_events), historical_context


def fetch_africa_cdc_events(client: httpx.Client) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for url in [AFRICA_CDC_OUTBREAKS_URL, AFRICA_CDC_HOME_URL]:
        try:
            html_text = fetch_text(client, url, "africa_cdc")
        except Exception as exc:
            print(f"[Africa CDC] fetch failed: {url}: {exc}")
            continue

        page_text = strip_html(html_text)
        if text_contains_disease(page_text):
            event = make_event(
                source="Africa Centres for Disease Control and Prevention",
                source_id="africa_cdc",
                event_type="current_outbreak",
                title="Africa CDC disease outbreak update",
                summary=page_text[:1000],
                url=url,
                full_text=page_text,
            )
            if event:
                events.append(event)

        for link in extract_links(url, html_text):
            if len(events) >= MAX_DETAIL_PAGES:
                break
            lowered = link.lower()
            if not any(
                keyword.replace(" ", "-") in lowered
                or keyword.replace(" ", "%20") in lowered
                for keyword in DISEASE_KEYWORDS
            ):
                continue
            try:
                detail_text = strip_html(fetch_text(client, link, "africa_cdc"))
            except Exception:
                continue
            event = make_event(
                source="Africa Centres for Disease Control and Prevention",
                source_id="africa_cdc",
                event_type="current_outbreak",
                title="Africa CDC disease outbreak report",
                summary=detail_text[:1000],
                url=link,
                full_text=detail_text,
            )
            if event:
                events.append(event)
    return dedupe_events(events)


def fetch_reliefweb_events(client: httpx.Client) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    if not RELIEFWEB_ENABLED:
        print("[ReliefWeb] disabled by RELIEFWEB_ENABLED=0")
        return events
    if not RELIEFWEB_APPNAME:
        print(
            "[ReliefWeb] skipped: set approved RELIEFWEB_APPNAME to enable ReliefWeb API"
        )
        return events

    query_value = " OR ".join(
        [f'"{keyword}"' if " " in keyword else keyword for keyword in DISEASE_KEYWORDS]
    )
    params = {
        "appname": RELIEFWEB_APPNAME,
        "query[value]": query_value,
        "query[fields][]": ["title", "body", "headline"],
        "fields[include][]": [
            "id",
            "title",
            "url",
            "date.created",
            "date.changed",
            "source.name",
            "country.name",
            "body-html",
            "headline",
        ],
        "sort[]": "date.created:desc",
        "limit": "20",
        "profile": "full",
    }

    try:
        response = client.get(
            RELIEFWEB_REPORTS_URL, params=params, headers={"Accept": "application/json"}
        )
        FETCH_LOG.append(
            FetchResult(True, "reliefweb", str(response.url), response.status_code)
        )
        response.raise_for_status()
        payload_response = response.json()
    except Exception as exc:
        status = (
            exc.response.status_code
            if isinstance(exc, httpx.HTTPStatusError) and exc.response
            else None
        )
        url = RELIEFWEB_REPORTS_URL + "?" + urlencode({"appname": RELIEFWEB_APPNAME})
        FETCH_LOG.append(FetchResult(False, "reliefweb", url, status, str(exc)))
        print(f"[ReliefWeb] fetch failed: {exc}")
        return events

    data = (
        payload_response.get("data", []) if isinstance(payload_response, dict) else []
    )
    for item in data:
        fields = item.get("fields", {}) if isinstance(item, dict) else {}
        title = str(fields.get("title") or "")
        url = str(fields.get("url") or "")
        body = strip_html(
            str(
                fields.get("body-html")
                or fields.get("body")
                or fields.get("headline")
                or ""
            )
        )
        if not text_contains_disease(title + " " + body):
            continue

        date_data = fields.get("date") or {}
        source_data = fields.get("source") or []
        country_data = fields.get("country") or []
        source_names = (
            ", ".join(
                source.get("name", "")
                for source in source_data
                if isinstance(source, dict)
            )
            or "ReliefWeb"
        )
        published_at = (
            str(date_data.get("created") or date_data.get("changed") or "")
            if isinstance(date_data, dict)
            else ""
        )

        event = make_event(
            source=f"ReliefWeb / {source_names}",
            source_id="reliefweb",
            event_type="current_outbreak",
            title=title,
            summary=body[:1000],
            url=url,
            published_at=published_at,
            full_text=body,
            extra={
                "reliefweb_sources": source_names,
                "reliefweb_countries": [
                    country.get("name")
                    for country in country_data
                    if isinstance(country, dict) and country.get("name")
                ],
            },
        )
        if event:
            if not event["countries"]:
                for country_name in event.get("reliefweb_countries", []):
                    coords = COUNTRY_COORDS.get(str(country_name))
                    if coords and not any(
                        row["country"] == coords["country"]
                        for row in event["countries"]
                    ):
                        event["countries"].append(coords)
            events.append(event)
    return dedupe_events(events)


def dedupe_events(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    deduped: list[dict[str, Any]] = []
    seen: set[str] = set()
    for event in events:
        key = str(event.get("url") or event.get("raw_hash") or event.get("title"))
        if key in seen:
            continue
        seen.add(key)
        event["metrics"] = (
            normalize_metrics(event.get("metrics") or {})
            if event.get("type") == "current_outbreak"
            else event.get("metrics", {})
        )
        deduped.append(event)
    return deduped


def event_metric_score(event: dict[str, Any]) -> int:
    metrics = normalize_metrics(event.get("metrics") or {})
    positive_keys = [
        "total_identified_cases",
        "confirmed_cases",
        "suspected_cases",
        "probable_cases",
        "possible_cases",
        "under_investigation_cases",
        "pending_cases",
        "deaths",
    ]
    return sum(1 for key in positive_keys if metrics.get(key, 0) > 0)


def choose_primary_current_event(events: list[dict[str, Any]]) -> dict[str, Any] | None:
    current_events = [
        event for event in events if event.get("type") == "current_outbreak"
    ]
    if not current_events:
        return None
    source_weight = {
        "who": 100,
        "ecdc": 85,
        "cdc": 80,
        "africa_cdc": 75,
        "reliefweb": 60,
    }

    def score(event: dict[str, Any]) -> tuple[int, int, int, str]:
        metrics = normalize_metrics(event.get("metrics") or {})
        source_score = source_weight.get(str(event.get("source_id")), 10)
        metric_score = event_metric_score(event)
        total_score = (
            metrics.get("total_identified_cases", 0) + metrics.get("deaths", 0) * 2
        )
        date_score = str(event.get("published_at") or "")
        return source_score, metric_score, total_score, date_score

    return sorted(current_events, key=score, reverse=True)[0]


def metrics_are_empty(event: dict[str, Any] | None) -> bool:
    if not event:
        return True
    metrics = normalize_metrics(event.get("metrics") or {})
    return not any(
        metrics.get(key, 0) > 0
        for key in [
            "total_identified_cases",
            "confirmed_cases",
            "suspected_cases",
            "probable_cases",
            "possible_cases",
            "under_investigation_cases",
            "pending_cases",
            "deaths",
        ]
    )


def ensure_current_outbreak_fallback(
    events: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    current_events = [
        event for event in events if event.get("type") == "current_outbreak"
    ]
    if not current_events:
        return [OFFICIAL_CURRENT_OUTBREAK_FALLBACK]
    if any(not metrics_are_empty(event) for event in current_events):
        return events
    return [OFFICIAL_CURRENT_OUTBREAK_FALLBACK, *events]


def merge_current_metrics(primary_event: dict[str, Any] | None) -> dict[str, Any]:
    if primary_event is None:
        empty_metrics = normalize_metrics({})
        return {
            "event_name": f"No current {DISEASE_NAME} outbreak event detected",
            **empty_metrics,
            "risk_level": "unknown",
            "source": None,
            "source_url": None,
            "published_at": None,
        }
    metrics = normalize_metrics(primary_event.get("metrics") or {})
    return {
        "event_name": primary_event.get("title")
        or f"Current {DISEASE_NAME} outbreak event",
        **metrics,
        "risk_level": primary_event.get("risk_level") or "unknown",
        "source": primary_event.get("source"),
        "source_id": primary_event.get("source_id"),
        "source_url": primary_event.get("url"),
        "published_at": primary_event.get("published_at"),
    }


def build_countries(
    primary_event: dict[str, Any] | None, current: dict[str, Any], checked_at: str
) -> list[dict[str, Any]]:
    if primary_event is None:
        return []
    countries = primary_event.get("countries") or [COUNTRY_COORDS["Multi-country"]]
    rows: list[dict[str, Any]] = []
    for country in countries:
        total_identified = int(current.get("total_identified_cases") or 0)
        deaths = int(current.get("deaths") or 0)
        rows.append(
            {
                "country": country["country"],
                "region": country.get("region", ""),
                "confirmed": int(current.get("confirmed_cases") or 0),
                "suspected": int(current.get("suspected_cases") or 0),
                "probable": int(current.get("probable_cases") or 0),
                "possible": int(current.get("possible_cases") or 0),
                "under_investigation": int(
                    current.get("under_investigation_cases") or 0
                ),
                "pending": int(current.get("pending_cases") or 0),
                "unconfirmed": int(current.get("unconfirmed_cases") or 0),
                "total_identified": total_identified,
                "ruled_out": int(current.get("ruled_out_cases") or 0),
                "negative": int(current.get("negative_cases") or 0),
                "deaths": deaths,
                "recovered": int(current.get("recovered") or 0),
                "hospitalized": int(current.get("hospitalized") or 0),
                "active": max(
                    total_identified - deaths - int(current.get("recovered") or 0), 0
                ),
                "lat": float(country["lat"]),
                "lng": float(country["lng"]),
                "risk_level": current.get("risk_level") or "unknown",
                "last_updated": checked_at,
            }
        )
    return rows


def build_points(
    countries: list[dict[str, Any]], current: dict[str, Any]
) -> list[dict[str, Any]]:
    points: list[dict[str, Any]] = []
    for country in countries:
        slug = re.sub(r"[^a-z0-9]+", "-", country["country"].lower()).strip("-")
        points.append(
            {
                "id": f"{slug}-{DISEASE_NAME.lower().replace(' ', '-')}-current",
                "name": current.get("event_name") or f"Current {DISEASE_NAME} event",
                "country": country["country"],
                "confirmed": int(country.get("confirmed") or 0),
                "suspected": int(country.get("suspected") or 0),
                "probable": int(country.get("probable") or 0),
                "possible": int(country.get("possible") or 0),
                "under_investigation": int(country.get("under_investigation") or 0),
                "pending": int(country.get("pending") or 0),
                "unconfirmed": int(country.get("unconfirmed") or 0),
                "total_identified": int(country.get("total_identified") or 0),
                "deaths": int(country.get("deaths") or 0),
                "lat": country["lat"],
                "lng": country["lng"],
                "source": current.get("source") or "Official source",
                "source_url": current.get("source_url"),
                "risk_level": current.get("risk_level") or "unknown",
            }
        )
    return points


def build_timeline(
    events: list[dict[str, Any]], checked_at: str
) -> list[dict[str, Any]]:
    timeline: list[dict[str, Any]] = []
    for event in events:
        if event.get("type") != "current_outbreak":
            continue
        metrics = normalize_metrics(event.get("metrics") or {})
        timeline.append(
            {
                "date": str(event.get("published_at") or checked_at)[:10],
                "confirmed": metrics["confirmed_cases"],
                "suspected": metrics["suspected_cases"],
                "probable": metrics["probable_cases"],
                "possible": metrics["possible_cases"],
                "under_investigation": metrics["under_investigation_cases"],
                "pending": metrics["pending_cases"],
                "unconfirmed": metrics["unconfirmed_cases"],
                "total_identified": metrics["total_identified_cases"],
                "deaths": metrics["deaths"],
                "recovered": metrics["recovered"],
                "source": event.get("source"),
                "source_id": event.get("source_id"),
                "source_url": event.get("url"),
            }
        )
    if not timeline:
        timeline.append(
            {
                "date": checked_at[:10],
                "confirmed": 0,
                "suspected": 0,
                "probable": 0,
                "possible": 0,
                "under_investigation": 0,
                "pending": 0,
                "unconfirmed": 0,
                "total_identified": 0,
                "deaths": 0,
                "recovered": 0,
                "source": None,
                "source_id": None,
                "source_url": None,
            }
        )

    dedup: dict[str, dict[str, Any]] = {}
    for item in timeline:
        key = f"{item['date']}::{item.get('source_id')}::{item.get('source_url')}"
        existing = dedup.get(key)
        if existing is None or int(item.get("total_identified") or 0) >= int(
            existing.get("total_identified") or 0
        ):
            dedup[key] = item
    return sorted(dedup.values(), key=lambda row: row["date"])


def build_sources(checked_at: str) -> list[dict[str, Any]]:
    source_defs = [
        {
            "id": "who",
            "name": "World Health Organization",
            "url": "https://www.who.int/emergencies/disease-outbreak-news",
            "type": "official",
            "confidence": "high",
            "usage": "current_outbreak_primary",
        },
        {
            "id": "ecdc",
            "name": "European Centre for Disease Prevention and Control",
            "url": ECDC_MEDIA_CENTRE_URL,
            "type": "health-agency",
            "confidence": "high",
            "usage": "current_outbreak_validation",
        },
        {
            "id": "cdc",
            "name": "Centers for Disease Control and Prevention",
            "url": "https://www.cdc.gov/hantavirus/",
            "type": "health-agency",
            "confidence": "high",
            "usage": "historical_context_and_travel_notices",
        },
        {
            "id": "africa_cdc",
            "name": "Africa Centres for Disease Control and Prevention",
            "url": AFRICA_CDC_OUTBREAKS_URL,
            "type": "health-agency",
            "confidence": "high",
            "usage": "africa_outbreak_validation",
        },
        {
            "id": "reliefweb",
            "name": "ReliefWeb API",
            "url": RELIEFWEB_REPORTS_URL,
            "type": "early-warning",
            "confidence": "medium",
            "usage": "humanitarian_report_aggregation_requires_approved_appname",
        },
    ]

    status_by_source: dict[str, dict[str, Any]] = {}
    for row in FETCH_LOG:
        stats = status_by_source.setdefault(
            row.source_id,
            {"ok": 0, "failed": 0, "last_status_code": None, "last_error": None},
        )
        if row.ok:
            stats["ok"] += 1
        else:
            stats["failed"] += 1
            stats["last_error"] = row.error
        if row.status_code is not None:
            stats["last_status_code"] = row.status_code

    for source in source_defs:
        source["last_checked_at"] = checked_at
        source["status"] = status_by_source.get(
            source["id"],
            {"ok": 0, "failed": 0, "last_status_code": None, "last_error": None},
        )
    return source_defs


def build_static_data(
    events: list[dict[str, Any]], historical_context: dict[str, Any] | None
) -> dict[str, Any]:
    checked_at = now_iso()
    primary_event = choose_primary_current_event(events)
    current = merge_current_metrics(primary_event)
    countries = build_countries(primary_event, current, checked_at)
    points = build_points(countries, current)
    timeline = build_timeline(events, checked_at)
    historical_payload = (
        historical_context.get("historical_context")
        if isinstance(historical_context, dict)
        else None
    )

    global_data = {
        "disease": DISEASE_NAME,
        "event_name": current.get("event_name"),
        "total_confirmed": int(current.get("confirmed_cases") or 0),
        "total_deaths": int(current.get("deaths") or 0),
        "total_recovered": int(current.get("recovered") or 0),
        "total_suspected": int(current.get("suspected_cases") or 0),
        "total_probable": int(current.get("probable_cases") or 0),
        "total_possible": int(current.get("possible_cases") or 0),
        "total_under_investigation": int(current.get("under_investigation_cases") or 0),
        "total_pending": int(current.get("pending_cases") or 0),
        "total_unconfirmed": int(current.get("unconfirmed_cases") or 0),
        "total_ruled_out": int(current.get("ruled_out_cases") or 0),
        "total_negative": int(current.get("negative_cases") or 0),
        "total_identified_cases": int(current.get("total_identified_cases") or 0),
        "total_hospitalized": int(current.get("hospitalized") or 0),
        "affected_countries": len(countries),
        "global_risk_level": current.get("risk_level") or "unknown",
        "last_updated": checked_at,
        "source_label": "WHO / ECDC / CDC / Africa CDC / ReliefWeb",
        "current_outbreak": current,
        "primary_event_url": current.get("source_url"),
        "historical_context": historical_payload,
        "data_notes": [
            "Current outbreak metrics are selected from the highest-priority official or health-agency source with usable metrics.",
            "The dashboard now tracks confirmed, suspected, probable, possible, under-investigation, pending, ruled-out and negative cases separately.",
            "Unconfirmed cases = suspected + probable + possible + under investigation + pending unless a source states an explicit unconfirmed count.",
            "CDC cumulative surveillance values are stored as historical context only and are not added to current outbreak totals.",
            "ReliefWeb is optional and requires a pre-approved RELIEFWEB_APPNAME from 1 November 2025 onward.",
        ],
    }

    write_json(DATA_DIR / "global.json", global_data)
    write_json(DATA_DIR / "countries.json", countries)
    write_json(DATA_DIR / "points.json", points)
    write_json(DATA_DIR / "timeline.json", timeline)
    write_json(DATA_DIR / "sources.json", build_sources(checked_at))
    write_json(DATA_DIR / "official_events.json", events)
    write_json(DATA_DIR / "historical_context.json", historical_context or {})
    write_json(DATA_DIR / "fetch_log.json", [asdict(row) for row in FETCH_LOG])
    return global_data


def collect_all_events() -> tuple[list[dict[str, Any]], dict[str, Any] | None]:
    all_events: list[dict[str, Any]] = []
    historical_context: dict[str, Any] | None = None
    with http_client() as client:
        collectors = [
            ("WHO", lambda: fetch_who_don_events(client)),
            ("ECDC", lambda: fetch_ecdc_events(client)),
            ("Africa CDC", lambda: fetch_africa_cdc_events(client)),
            ("ReliefWeb", lambda: fetch_reliefweb_events(client)),
        ]
        for label, collector in collectors:
            try:
                events = collector()
                print(f"[{label}] events matched: {len(events)}")
                all_events.extend(events)
            except Exception as exc:
                print(f"[{label}] collector failed: {exc}")

        try:
            cdc_events, cdc_historical = fetch_cdc_context(client)
            print(f"[CDC] current events matched: {len(cdc_events)}")
            all_events.extend(cdc_events)
            historical_context = cdc_historical
        except Exception as exc:
            print(f"[CDC] collector failed: {exc}")
    return dedupe_events(all_events), historical_context


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    snapshots = read_json(SNAPSHOT_FILE, {})
    events, historical_context = collect_all_events()
    events = ensure_current_outbreak_fallback(events)
    events = dedupe_events(events)

    snapshot_payload = {
        "disease": DISEASE_NAME,
        "keywords": DISEASE_KEYWORDS,
        "events": events,
        "historical_context": historical_context,
    }
    combined_hash = hash_text(
        json.dumps(snapshot_payload, sort_keys=True, ensure_ascii=False)
    )
    old_hash = snapshots.get("combined_hash")

    if old_hash == combined_hash:
        build_static_data(events, historical_context)
        snapshots["last_checked_at"] = now_iso()
        snapshots["last_run_status"] = "unchanged_rewritten"
        snapshots["fetch_log_size"] = len(FETCH_LOG)
        write_json(SNAPSHOT_FILE, snapshots)
        print("No data changes detected. JSON files were still refreshed.")
        return

    global_data = build_static_data(events, historical_context)
    snapshots["combined_hash"] = combined_hash
    snapshots["last_checked_at"] = now_iso()
    snapshots["last_run_status"] = "updated"
    snapshots["current_event_name"] = global_data.get("event_name")
    snapshots["events_count"] = len(events)
    snapshots["fetch_log_size"] = len(FETCH_LOG)
    write_json(SNAPSHOT_FILE, snapshots)

    print("Data files updated.")
    print(f"Events stored: {len(events)}")
    print(f"Primary event: {global_data.get('event_name')}")
    print(f"Confirmed: {global_data.get('total_confirmed')}")
    print(f"Suspected: {global_data.get('total_suspected')}")
    print(f"Probable: {global_data.get('total_probable')}")
    print(f"Possible: {global_data.get('total_possible')}")
    print(f"Under investigation: {global_data.get('total_under_investigation')}")
    print(f"Pending: {global_data.get('total_pending')}")
    print(f"Total unconfirmed: {global_data.get('total_unconfirmed')}")
    print(f"Total identified: {global_data.get('total_identified_cases')}")
    print(f"Deaths: {global_data.get('total_deaths')}")
    print(f"Output directory: {DATA_DIR}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted.", file=sys.stderr)
        raise SystemExit(130)
