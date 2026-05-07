from __future__ import annotations

import hashlib
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "public" / "data"
SNAPSHOT_FILE = DATA_DIR / "source_snapshots.json"

WHO_DON_API = "https://www.who.int/api/emergencies/diseaseoutbreaknews"

ECDC_HANTAVIRUS_NEWS_URL = (
    "https://www.ecdc.europa.eu/en/news-events/"
    "hantavirus-outbreak-cruise-ship-under-investigation-risk-europe-very-low"
)

CDC_HANTAVIRUS_HISTORICAL_PAGE = (
    "https://www.cdc.gov/hantavirus/data-research/cases/index.html"
)

DISEASE_KEYWORDS = [
    "hantavirus",
    "hanta virus",
    "andes virus",
    "hantavirus pulmonary syndrome",
]

OFFICIAL_CURRENT_OUTBREAK_FALLBACK = {
    "source": "World Health Organization",
    "source_id": "who",
    "type": "current_outbreak",
    "title": "Hantavirus cluster linked to cruise ship travel, Multi-country",
    "summary": (
        "Official fallback from WHO Disease Outbreak News DON599. "
        "As of 4 May 2026, seven cases were reported: two confirmed, "
        "five suspected, including three deaths."
    ),
    "url": "https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599",
    "published_at": "2026-05-04",
    "metrics": {
        "total_identified_cases": 7,
        "confirmed_cases": 2,
        "suspected_cases": 5,
        "deaths": 3,
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
    "raw_hash": "who-don599-official-fallback",
}

COUNTRY_COORDS: dict[str, dict[str, Any]] = {
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
    "Germany": {
        "country": "Germany",
        "region": "Europe",
        "lat": 51.1657,
        "lng": 10.4515,
    },
    "France": {
        "country": "France",
        "region": "Europe",
        "lat": 46.2276,
        "lng": 2.2137,
    },
    "United Kingdom": {
        "country": "United Kingdom",
        "region": "Europe",
        "lat": 55.3781,
        "lng": -3.436,
    },
    "Spain": {
        "country": "Spain",
        "region": "Europe",
        "lat": 40.4637,
        "lng": -3.7492,
    },
    "Italy": {
        "country": "Italy",
        "region": "Europe",
        "lat": 41.8719,
        "lng": 12.5674,
    },
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
}


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return fallback


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def hash_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def strip_html(value: str) -> str:
    value = html.unescape(value)
    value = re.sub(r"<script[\s\S]*?</script>", " ", value, flags=re.I)
    value = re.sub(r"<style[\s\S]*?</style>", " ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    return normalize_space(value)


def text_contains_disease(value: str) -> bool:
    lowered = value.lower()
    return any(keyword in lowered for keyword in DISEASE_KEYWORDS)


def parse_number_token(value: str | None) -> int | None:
    if not value:
        return None

    cleaned = value.strip().lower().replace(",", "")

    if cleaned.isdigit():
        return int(cleaned)

    return NUMBER_WORDS.get(cleaned)


def first_number_from_match(match: re.Match[str]) -> int | None:
    for group in match.groups():
        number = parse_number_token(group)
        if number is not None:
            return number

    return None


def extract_by_patterns(text: str, patterns: list[str]) -> int | None:
    normalized = text.lower()

    for pattern in patterns:
        match = re.search(pattern, normalized, flags=re.I)
        if match:
            value = first_number_from_match(match)
            if value is not None:
                return value

    return None


def extract_current_metrics(text: str) -> dict[str, int | None]:
    """
    Extracts current outbreak metrics only.

    It intentionally looks for outbreak/event wording, not historical surveillance wording.
    """

    number = r"(\d{1,3}(?:,\d{3})*|\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)"

    total_identified = extract_by_patterns(
        text,
        [
            rf"{number}\s*\(\s*{number}\s*\)\s+(?:human\s+)?cases",
            rf"{number}\s+(?:human\s+)?cases",
            rf"total\s+of\s+{number}\s+(?:human\s+)?cases",
            rf"{number}\s+(?:people|persons|individuals)\s+(?:were\s+)?(?:identified|reported|affected)",
        ],
    )

    confirmed = extract_by_patterns(
        text,
        [
            rf"{number}\s*\(\s*{number}\s*\)\s+(?:laboratory[-\s]?confirmed|confirmed)\s+(?:human\s+)?cases",
            rf"{number}\s+(?:laboratory[-\s]?confirmed|confirmed)\s+(?:human\s+)?cases",
            rf"(?:laboratory[-\s]?confirmed|confirmed)\s+(?:human\s+)?cases(?:\D{{0,50}}){number}",
            rf"(?:of\s+which\s+)?{number}\s+(?:were\s+)?(?:laboratory[-\s]?confirmed|confirmed)",
        ],
    )

    suspected = extract_by_patterns(
        text,
        [
            rf"{number}\s*\(\s*{number}\s*\)\s+suspected\s+(?:human\s+)?cases",
            rf"{number}\s+suspected\s+(?:human\s+)?cases",
            rf"suspected\s+(?:human\s+)?cases(?:\D{{0,50}}){number}",
            rf"{number}\s+(?:were\s+)?suspected",
        ],
    )

    deaths = extract_by_patterns(
        text,
        [
            rf"{number}\s*\(\s*{number}\s*\)\s+(?:deaths|fatalities)",
            rf"{number}\s+(?:deaths|fatalities)",
            rf"(?:deaths|fatalities)(?:\D{{0,50}}){number}",
            rf"{number}\s+(?:people|persons|individuals)\s+(?:died|have died)",
        ],
    )

    if total_identified is None and confirmed is not None and suspected is not None:
        total_identified = confirmed + suspected

    return {
        "total_identified_cases": total_identified,
        "confirmed_cases": confirmed,
        "suspected_cases": suspected,
        "deaths": deaths,
    }


def extract_risk_level(text: str) -> str:
    lowered = text.lower()

    if "risk" in lowered and "very low" in lowered:
        return "low"

    if "risk" in lowered and "low" in lowered:
        return "low"

    if "risk" in lowered and "moderate" in lowered:
        return "moderate"

    if "risk" in lowered and "high" in lowered:
        return "high"

    if "critical" in lowered:
        return "critical"

    return "unknown"


def detect_countries(text: str) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    lowered = text.lower()

    for country_name, data in COUNTRY_COORDS.items():
        if country_name.lower() in lowered:
            normalized_country = data["country"]

            if not any(item["country"] == normalized_country for item in found):
                found.append(data)

    return found


def fetch_url_text(url: str) -> str:
    response = httpx.get(
        url,
        timeout=30,
        follow_redirects=True,
        headers={
            "User-Agent": (
                "Mozilla/5.0 compatible; OutbreakTracker/1.0; " "+https://example.com"
            ),
            "Accept": "text/html,application/json;q=0.9,*/*;q=0.8",
        },
    )
    response.raise_for_status()
    return response.text


def fetch_who_don_events() -> list[dict[str, Any]]:
    response = httpx.get(
        WHO_DON_API,
        timeout=30,
        follow_redirects=True,
        headers={
            "User-Agent": "OutbreakTracker/1.0",
            "Accept": "application/json",
        },
    )
    response.raise_for_status()

    payload = response.json()
    items = payload.get("value", [])

    events: list[dict[str, Any]] = []

    for item in items:
        title = str(item.get("Title") or item.get("title") or "")
        summary = strip_html(str(item.get("Summary") or item.get("summary") or ""))
        overview = strip_html(str(item.get("Overview") or item.get("overview") or ""))
        date = str(item.get("PublicationDate") or item.get("publicationDate") or "")
        raw_url = str(item.get("ItemDefaultUrl") or item.get("itemDefaultUrl") or "")

        url = raw_url if raw_url.startswith("http") else f"https://www.who.int{raw_url}"
        combined = normalize_space(" ".join([title, summary, overview]))

        if not text_contains_disease(combined):
            continue

        detail_text = ""

        try:
            detail_html = fetch_url_text(url)
            detail_text = strip_html(detail_html)
        except Exception as exc:
            print(f"WHO detail fetch failed for {url}: {exc}")

        full_text = normalize_space(" ".join([combined, detail_text]))
        metrics = extract_current_metrics(full_text)
        countries = detect_countries(full_text)

        events.append(
            {
                "source": "World Health Organization",
                "source_id": "who",
                "type": "current_outbreak",
                "title": title,
                "summary": summary,
                "url": url,
                "published_at": date,
                "metrics": metrics,
                "countries": countries,
                "risk_level": extract_risk_level(full_text),
                "raw_hash": hash_text(full_text),
            }
        )

    return events


def fetch_ecdc_hantavirus_event() -> dict[str, Any] | None:
    try:
        html_text = fetch_url_text(ECDC_HANTAVIRUS_NEWS_URL)
    except Exception as exc:
        print(f"ECDC fetch failed: {exc}")
        return None

    text = strip_html(html_text)

    if not text_contains_disease(text):
        return None

    metrics = extract_current_metrics(text)
    countries = detect_countries(text)

    return {
        "source": "European Centre for Disease Prevention and Control",
        "source_id": "ecdc",
        "type": "current_outbreak",
        "title": "Hantavirus outbreak on cruise ship under investigation",
        "summary": text[:850],
        "url": ECDC_HANTAVIRUS_NEWS_URL,
        "published_at": "",
        "metrics": metrics,
        "countries": countries,
        "risk_level": extract_risk_level(text),
        "raw_hash": hash_text(text),
    }


def extract_cdc_historical_cases(text: str) -> int | None:
    """
    Extracts the cumulative U.S. surveillance number only.
    This value must not be used as current outbreak total.
    """

    patterns = [
        r"(\d{1,3}(?:,\d{3})*|\d+)\s+cases\s+of\s+hantavirus\s+disease\s+were\s+reported",
        r"since\s+1993(?:\D{0,80})(\d{1,3}(?:,\d{3})*|\d+)\s+cases",
        r"reported\s+(\d{1,3}(?:,\d{3})*|\d+)\s+cases\s+of\s+hantavirus",
    ]

    for pattern in patterns:
        match = re.search(pattern, text.lower(), flags=re.I)
        if match:
            return int(match.group(1).replace(",", ""))

    return None


def fetch_cdc_historical_context() -> dict[str, Any]:
    html_text = fetch_url_text(CDC_HANTAVIRUS_HISTORICAL_PAGE)
    text = strip_html(html_text)

    cumulative_cases = extract_cdc_historical_cases(text)

    return {
        "source": "Centers for Disease Control and Prevention",
        "source_id": "cdc",
        "type": "historical_context",
        "title": "Reported cases of hantavirus disease in the United States",
        "summary": text[:850],
        "url": CDC_HANTAVIRUS_HISTORICAL_PAGE,
        "published_at": "",
        "historical_context": {
            "country": "United States",
            "cumulative_cases": cumulative_cases,
            "period_label": "since 1993",
            "scope": "reported U.S. surveillance cases",
        },
        "raw_hash": hash_text(text),
    }


def choose_primary_current_event(events: list[dict[str, Any]]) -> dict[str, Any] | None:
    current_events = [
        event for event in events if event.get("type") == "current_outbreak"
    ]

    if not current_events:
        return None

    def score(event: dict[str, Any]) -> tuple[int, int]:
        source_score = 2 if event.get("source_id") == "who" else 1
        metrics = event.get("metrics") or {}
        metric_score = sum(
            1
            for key in [
                "confirmed_cases",
                "suspected_cases",
                "deaths",
                "total_identified_cases",
            ]
            if isinstance(metrics.get(key), int)
        )

        return source_score, metric_score

    return sorted(current_events, key=score, reverse=True)[0]


def merge_current_metrics(primary_event: dict[str, Any] | None) -> dict[str, Any]:
    if primary_event is None:
        return {
            "event_name": "No current Hantavirus outbreak event detected",
            "total_identified_cases": 0,
            "confirmed_cases": 0,
            "suspected_cases": 0,
            "deaths": 0,
            "risk_level": "unknown",
            "source": None,
            "source_url": None,
            "published_at": None,
        }

    metrics = primary_event.get("metrics") or {}

    confirmed = metrics.get("confirmed_cases")
    suspected = metrics.get("suspected_cases")
    deaths = metrics.get("deaths")
    total_identified = metrics.get("total_identified_cases")

    confirmed = confirmed if isinstance(confirmed, int) else 0
    suspected = suspected if isinstance(suspected, int) else 0
    deaths = deaths if isinstance(deaths, int) else 0

    if not isinstance(total_identified, int):
        total_identified = confirmed + suspected

    return {
        "event_name": primary_event.get("title") or "Current Hantavirus outbreak event",
        "total_identified_cases": total_identified,
        "confirmed_cases": confirmed,
        "suspected_cases": suspected,
        "deaths": deaths,
        "risk_level": primary_event.get("risk_level") or "unknown",
        "source": primary_event.get("source"),
        "source_url": primary_event.get("url"),
        "published_at": primary_event.get("published_at"),
    }


def build_countries(
    primary_event: dict[str, Any] | None, current: dict[str, Any], checked_at: str
) -> list[dict[str, Any]]:
    if primary_event is None:
        return []

    countries = primary_event.get("countries") or []

    if not countries:
        return []

    total_identified = int(current.get("total_identified_cases") or 0)
    confirmed = int(current.get("confirmed_cases") or 0)
    deaths = int(current.get("deaths") or 0)

    rows: list[dict[str, Any]] = []

    for country in countries:
        rows.append(
            {
                "country": country["country"],
                "region": country["region"],
                "confirmed": confirmed,
                "suspected": int(current.get("suspected_cases") or 0),
                "total_identified": total_identified,
                "deaths": deaths,
                "recovered": 0,
                "active": max(total_identified - deaths, 0),
                "lat": country["lat"],
                "lng": country["lng"],
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
        confirmed = int(country.get("confirmed") or 0)
        suspected = int(country.get("suspected") or 0)
        total_identified = int(country.get("total_identified") or confirmed + suspected)

        points.append(
            {
                "id": f"{country['country'].lower().replace(' ', '-')}-hantavirus-current",
                "name": current.get("event_name") or "Current Hantavirus event",
                "country": country["country"],
                "confirmed": confirmed,
                "suspected": suspected,
                "total_identified": total_identified,
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

        metrics = event.get("metrics") or {}

        confirmed = metrics.get("confirmed_cases")
        suspected = metrics.get("suspected_cases")
        deaths = metrics.get("deaths")
        total_identified = metrics.get("total_identified_cases")

        confirmed = confirmed if isinstance(confirmed, int) else 0
        suspected = suspected if isinstance(suspected, int) else 0
        deaths = deaths if isinstance(deaths, int) else 0

        if not isinstance(total_identified, int):
            total_identified = confirmed + suspected

        date = str(event.get("published_at") or checked_at)[:10]

        timeline.append(
            {
                "date": date,
                "confirmed": confirmed,
                "suspected": suspected,
                "total_identified": total_identified,
                "deaths": deaths,
                "recovered": 0,
                "source": event.get("source"),
                "source_url": event.get("url"),
            }
        )

    if not timeline:
        timeline.append(
            {
                "date": checked_at[:10],
                "confirmed": 0,
                "suspected": 0,
                "total_identified": 0,
                "deaths": 0,
                "recovered": 0,
                "source": None,
                "source_url": None,
            }
        )

    dedup: dict[str, dict[str, Any]] = {}

    for item in timeline:
        key = f"{item['date']}::{item.get('source')}"
        dedup[key] = item

    return sorted(dedup.values(), key=lambda row: row["date"])


def build_sources(checked_at: str) -> list[dict[str, Any]]:
    return [
        {
            "id": "who",
            "name": "World Health Organization",
            "url": "https://www.who.int/emergencies/disease-outbreak-news",
            "type": "official",
            "last_checked_at": checked_at,
            "confidence": "high",
            "usage": "current_outbreak",
        },
        {
            "id": "ecdc",
            "name": "European Centre for Disease Prevention and Control",
            "url": ECDC_HANTAVIRUS_NEWS_URL,
            "type": "health-agency",
            "last_checked_at": checked_at,
            "confidence": "high",
            "usage": "current_outbreak_validation",
        },
        {
            "id": "cdc",
            "name": "Centers for Disease Control and Prevention",
            "url": CDC_HANTAVIRUS_HISTORICAL_PAGE,
            "type": "health-agency",
            "last_checked_at": checked_at,
            "confidence": "high",
            "usage": "historical_context_only",
        },
    ]


def metrics_are_empty(event: dict[str, Any] | None) -> bool:
    if not event:
        return True

    metrics = event.get("metrics") or {}

    return not any(
        isinstance(metrics.get(key), int) and metrics.get(key) > 0
        for key in [
            "total_identified_cases",
            "confirmed_cases",
            "suspected_cases",
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

    has_useful_metrics = any(not metrics_are_empty(event) for event in current_events)

    if has_useful_metrics:
        return events

    return [OFFICIAL_CURRENT_OUTBREAK_FALLBACK, *events]


def build_static_data(
    events: list[dict[str, Any]], historical_context: dict[str, Any] | None
) -> None:
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

    total_confirmed = int(current.get("confirmed_cases") or 0)
    total_deaths = int(current.get("deaths") or 0)

    global_data = {
        "disease": "Hantavirus",
        "event_name": current.get("event_name"),
        "total_confirmed": total_confirmed,
        "total_deaths": total_deaths,
        "total_recovered": 0,
        "total_suspected": int(current.get("suspected_cases") or 0),
        "total_identified_cases": int(current.get("total_identified_cases") or 0),
        "affected_countries": len(countries),
        "global_risk_level": current.get("risk_level") or "unknown",
        "last_updated": checked_at,
        "source_label": "WHO / ECDC current outbreak + CDC historical context",
        "current_outbreak": current,
        "historical_context": historical_payload,
        "data_notes": [
            "WHO and ECDC are used for current outbreak metrics.",
            "CDC cumulative United States surveillance data is stored as historical context only.",
            "Historical CDC cumulative cases are not added to current outbreak totals.",
        ],
    }

    write_json(DATA_DIR / "global.json", global_data)
    write_json(DATA_DIR / "countries.json", countries)
    write_json(DATA_DIR / "points.json", points)
    write_json(DATA_DIR / "timeline.json", timeline)
    write_json(DATA_DIR / "sources.json", build_sources(checked_at))
    write_json(DATA_DIR / "official_events.json", events)
    write_json(DATA_DIR / "historical_context.json", historical_context or {})


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    snapshots = read_json(SNAPSHOT_FILE, {})

    events: list[dict[str, Any]] = []
    historical_context: dict[str, Any] | None = None

    try:
        events.extend(fetch_who_don_events())
    except Exception as exc:
        print(f"WHO fetch failed: {exc}")

    try:
        ecdc_event = fetch_ecdc_hantavirus_event()
        if ecdc_event:
            events.append(ecdc_event)
    except Exception as exc:
        print(f"ECDC processing failed: {exc}")

    try:
        historical_context = fetch_cdc_historical_context()
    except Exception as exc:
        print(f"CDC historical fetch failed: {exc}")

    events = ensure_current_outbreak_fallback(events)

    snapshot_payload = {
        "events": events,
        "historical_context": historical_context,
    }

    combined_hash = hash_text(
        json.dumps(snapshot_payload, sort_keys=True, ensure_ascii=False)
    )

    old_hash = snapshots.get("combined_hash")

    if old_hash == combined_hash:
        print("No data changes detected.")
        return

    build_static_data(events, historical_context)

    snapshots["combined_hash"] = combined_hash
    snapshots["last_checked_at"] = now_iso()

    write_json(SNAPSHOT_FILE, snapshots)

    print("Data files updated.")
    print(f"Current outbreak events: {len(events)}")
    print("CDC historical context stored separately.")


if __name__ == "__main__":
    main()
