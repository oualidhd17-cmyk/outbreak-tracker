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
from urllib.parse import quote_plus

import httpx

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "public" / "data"
TRENDS_FILE = DATA_DIR / "trends.json"
TREND_SNAPSHOTS_FILE = DATA_DIR / "trend_snapshots.json"

SITE_URL = os.getenv("NEXT_PUBLIC_SITE_URL", "https://hantamap.online").rstrip("/")
HTTP_TIMEOUT = float(os.getenv("TRENDS_HTTP_TIMEOUT", "35"))
MAX_TRENDS = int(os.getenv("TRENDS_MAX_ITEMS", "120"))
MAX_NEWS_PER_TREND = int(os.getenv("TRENDS_MAX_NEWS_PER_ITEM", "4"))

TREND_GEOS = [
    item.strip().upper()
    for item in os.getenv(
        "TRENDS_GEOS",
        "US,IN,ID,BR,GB,DE,FR,ES,IT,CA,AU,JP,KR,MX,TR,SA,AE,EG,DZ,MA,NL,SE,NO,DK,CH,BE,AT,PL,ZA,NG",
    ).split(",")
    if item.strip()
]

DISEASE_KEYWORDS = [
    item.strip().lower()
    for item in os.getenv(
        "OUTBREAK_KEYWORDS",
        (
            "hantavirus,hanta virus,andes virus,andes hantavirus,"
            "hantavirus pulmonary syndrome,hantavirus disease,"
            "rodent-borne,rodent borne,zoonotic disease,"
            "virus outbreak,disease outbreak,health alert,"
            "cdc hantavirus,who hantavirus,hantavirus symptoms"
        ),
    ).split(",")
    if item.strip()
]

STRICT_HEALTH_MODE = os.getenv("TRENDS_STRICT_HEALTH_MODE", "1").strip() != "0"

GOOGLE_TRENDS_RSS = "https://trends.google.com/trending/rss"
GOOGLE_NEWS_RSS = "https://news.google.com/rss/search"

STRONG_HEALTH_TERMS = [
    "hantavirus",
    "hanta virus",
    "andes virus",
    "andes hantavirus",
    "hantavirus pulmonary syndrome",
    "hantavirus disease",
    "cdc hantavirus",
    "who hantavirus",
    "rodent-borne",
    "rodent borne",
    "zoonotic disease",
    "virus outbreak",
    "disease outbreak",
    "health alert",
    "hantavirus symptoms",
]

GENERAL_HEALTH_TERMS = [
    "outbreak",
    "virus",
    "disease",
    "infection",
    "epidemic",
    "pandemic",
    "symptoms",
    "public health",
    "health agency",
    "health alert",
    "cdc",
    "who",
    "ecdc",
    "fever",
    "pneumonia",
    "respiratory illness",
    "hospitalized",
    "fatalities",
    "confirmed cases",
    "suspected cases",
]

NON_HEALTH_BLOCKLIST = [
    "boxing",
    "fighter",
    "football",
    "soccer",
    "basketball",
    "nba",
    "nfl",
    "ufc",
    "tennis",
    "baseball",
    "match",
    "game",
    "movie",
    "film",
    "actor",
    "actress",
    "singer",
    "music",
    "album",
    "concert",
    "fitbit",
    "google fitbit",
    "watch",
    "smartwatch",
    "pixel watch",
    "iphone",
    "android",
    "election",
    "president",
    "minister",
    "crypto",
    "bitcoin",
    "stock",
    "weather",
]

COUNTRY_FOCUS = {
    "united states": {
        "label": "United States",
        "lat": 37.0902,
        "lng": -95.7129,
        "zoom": 4,
    },
    "usa": {
        "label": "United States",
        "lat": 37.0902,
        "lng": -95.7129,
        "zoom": 4,
    },
    "germany": {
        "label": "Germany",
        "lat": 51.1657,
        "lng": 10.4515,
        "zoom": 5,
    },
    "france": {
        "label": "France",
        "lat": 46.2276,
        "lng": 2.2137,
        "zoom": 5,
    },
    "spain": {
        "label": "Spain",
        "lat": 40.4637,
        "lng": -3.7492,
        "zoom": 5,
    },
    "italy": {
        "label": "Italy",
        "lat": 41.8719,
        "lng": 12.5674,
        "zoom": 5,
    },
    "uk": {
        "label": "United Kingdom",
        "lat": 55.3781,
        "lng": -3.436,
        "zoom": 5,
    },
    "united kingdom": {
        "label": "United Kingdom",
        "lat": 55.3781,
        "lng": -3.436,
        "zoom": 5,
    },
    "argentina": {
        "label": "Argentina",
        "lat": -38.4161,
        "lng": -63.6167,
        "zoom": 4,
    },
    "chile": {
        "label": "Chile",
        "lat": -35.6751,
        "lng": -71.543,
        "zoom": 4,
    },
    "canada": {
        "label": "Canada",
        "lat": 56.1304,
        "lng": -106.3468,
        "zoom": 4,
    },
    "mexico": {
        "label": "Mexico",
        "lat": 23.6345,
        "lng": -102.5528,
        "zoom": 4,
    },
    "brazil": {
        "label": "Brazil",
        "lat": -14.235,
        "lng": -51.9253,
        "zoom": 4,
    },
    "saudi arabia": {
        "label": "Saudi Arabia",
        "lat": 23.8859,
        "lng": 45.0792,
        "zoom": 5,
    },
    "egypt": {
        "label": "Egypt",
        "lat": 26.8206,
        "lng": 30.8025,
        "zoom": 5,
    },
    "algeria": {
        "label": "Algeria",
        "lat": 28.0339,
        "lng": 1.6596,
        "zoom": 5,
    },
    "morocco": {
        "label": "Morocco",
        "lat": 31.7917,
        "lng": -7.0926,
        "zoom": 5,
    },
    "cruise": {
        "label": "Multi-country / cruise travel",
        "lat": 16.5388,
        "lng": -23.0418,
        "zoom": 3,
    },
    "cruise ship": {
        "label": "Multi-country / cruise travel",
        "lat": 16.5388,
        "lng": -23.0418,
        "zoom": 3,
    },
    "multi-country": {
        "label": "Multi-country",
        "lat": 20.0,
        "lng": 0.0,
        "zoom": 2,
    },
}


@dataclass(slots=True)
class TrendSource:
    title: str
    url: str
    source: str
    published_at: str
    summary: str


@dataclass(slots=True)
class TrendItem:
    id: str
    slug: str
    keyword: str
    title: str
    description: str
    category: str
    geo: str
    search_volume: str
    traffic_label: str
    published_at: str
    updated_at: str
    score: int
    source_url: str
    sources: list[TrendSource]
    related_queries: list[str]
    map_focus: dict[str, Any]
    seo: dict[str, Any]


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def parse_date(value: str | None) -> str:
    if not value:
        return ""

    raw = str(value).strip()

    if not raw:
        return ""

    try:
        return parsedate_to_datetime(raw).astimezone(timezone.utc).isoformat()
    except Exception:
        pass

    for candidate in (raw, raw.replace("Z", "+00:00")):
        try:
            return (
                datetime.fromisoformat(candidate).astimezone(timezone.utc).isoformat()
            )
        except Exception:
            pass

    return raw[:10]


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def strip_html(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"(?is)<script[\s\S]*?</script>", " ", value)
    value = re.sub(r"(?is)<style[\s\S]*?</style>", " ", value)
    value = re.sub(r"(?is)<noscript[\s\S]*?</noscript>", " ", value)
    value = re.sub(r"<[^>]+>", " ", value)
    return normalize_space(value)


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = value.replace("&", " and ")
    value = re.sub(r"['’]", "", value)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")[:90] or "trend"


def stable_id(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8", errors="ignore")).hexdigest()[:18]


def contains_any_term(text: str, terms: list[str]) -> bool:
    lowered = f" {text.lower()} "
    return any(term in lowered for term in terms if term)


def count_terms(text: str, terms: list[str]) -> int:
    lowered = f" {text.lower()} "
    return sum(1 for term in terms if term and term in lowered)


def text_contains_health_signal(value: str) -> bool:
    text = value.lower()
    return (
        count_terms(text, DISEASE_KEYWORDS) > 0
        or count_terms(text, STRONG_HEALTH_TERMS) > 0
        or count_terms(text, GENERAL_HEALTH_TERMS) >= 2
    )


def keyword_is_direct_health_keyword(keyword: str) -> bool:
    keyword_text = keyword.lower().strip()

    if not keyword_text:
        return False

    if count_terms(keyword_text, STRONG_HEALTH_TERMS) > 0:
        return True

    words = re.findall(r"[a-z0-9]+", keyword_text)
    if len(words) <= 1:
        return False

    return count_terms(keyword_text, GENERAL_HEALTH_TERMS) >= 2


def keyword_is_obviously_non_health(keyword: str, news_text: str = "") -> bool:
    keyword_text = keyword.lower().strip()
    combined = f"{keyword_text} {news_text.lower()}"

    if keyword_is_direct_health_keyword(keyword_text):
        return False

    if contains_any_term(keyword_text, NON_HEALTH_BLOCKLIST):
        return True

    if len(keyword_text) <= 3 and not keyword_is_direct_health_keyword(keyword_text):
        return True

    non_health_hits = count_terms(combined, NON_HEALTH_BLOCKLIST)
    health_hits = count_terms(combined, STRONG_HEALTH_TERMS) + count_terms(
        combined, GENERAL_HEALTH_TERMS
    )

    return non_health_hits >= 2 and health_hits < 2


def source_is_health_related(source: TrendSource) -> bool:
    text = f"{source.title} {source.summary} {source.source}".lower()

    if count_terms(text, STRONG_HEALTH_TERMS) > 0:
        return True

    return count_terms(text, GENERAL_HEALTH_TERMS) >= 2


def count_health_related_sources(sources: list[TrendSource]) -> int:
    return sum(1 for source in sources if source_is_health_related(source))


def should_keep_trend(keyword: str, sources: list[TrendSource]) -> bool:
    """
    فلترة صارمة:
    - نقبل الترند إذا كانت الكلمة نفسها صحية مباشرة.
    - أو إذا كان عندنا مصدران على الأقل من الأخبار مرتبطان بالصحة بوضوح.
    - نرفض الكلمات القصيرة والعشوائية والكلمات الرياضية/الترفيهية/التقنية.
    """
    news_text = " ".join(
        f"{source.title} {source.summary} {source.source}" for source in sources
    )

    if keyword_is_direct_health_keyword(keyword):
        return True

    if keyword_is_obviously_non_health(keyword, news_text):
        return False

    health_sources_count = count_health_related_sources(sources)

    if health_sources_count >= 2:
        return True

    combined = f"{keyword} {news_text}".lower()

    if count_terms(combined, STRONG_HEALTH_TERMS) >= 1 and health_sources_count >= 1:
        return True

    return False


def classify_keyword(keyword: str, news_text: str = "") -> str:
    text = f"{keyword} {news_text}".lower()

    if keyword_is_direct_health_keyword(keyword):
        return "public-health"

    if (
        count_terms(text, STRONG_HEALTH_TERMS) >= 1
        and count_terms(text, GENERAL_HEALTH_TERMS) >= 1
    ):
        return "public-health"

    if count_terms(text, GENERAL_HEALTH_TERMS) >= 3:
        return "public-health"

    if any(term in text for term in ["earthquake", "storm", "flood", "wildfire"]):
        return "emergency"

    if any(
        term in text
        for term in [
            "football",
            "soccer",
            "nba",
            "nfl",
            "ufc",
            "tennis",
            "match",
            "boxing",
            "fighter",
            "baseball",
        ]
    ):
        return "sports"

    if any(term in text for term in ["election", "president", "minister"]):
        return "politics"

    return "news"


def infer_map_focus(keyword: str, news_text: str = "") -> dict[str, Any]:
    text = f"{keyword} {news_text}".lower()

    for key, data in COUNTRY_FOCUS.items():
        if key in text:
            return data

    return {"label": "Global", "lat": 20.0, "lng": 0.0, "zoom": 2}


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def http_client() -> httpx.Client:
    return httpx.Client(
        timeout=httpx.Timeout(HTTP_TIMEOUT, connect=min(15.0, HTTP_TIMEOUT)),
        follow_redirects=True,
        headers={
            "User-Agent": "HantaUpdatesTrendBot/1.1 (+public health trend pages)",
            "Accept": "application/rss+xml,application/xml,text/xml,text/html,application/json;q=0.9,*/*;q=0.8",
        },
    )


def parse_rss_items(xml_text: str) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []

    try:
        root = ET.fromstring(xml_text.encode("utf-8"))
    except Exception:
        return items

    namespaces = {
        "ht": "https://trends.google.com/trending/rss",
        "media": "http://search.yahoo.com/mrss/",
    }

    for item in root.findall(".//item"):
        title = normalize_space(item.findtext("title", default=""))
        link = normalize_space(item.findtext("link", default=""))
        description = strip_html(item.findtext("description", default=""))
        pub_date = normalize_space(item.findtext("pubDate", default=""))

        traffic = ""
        traffic_node = item.find("ht:approx_traffic", namespaces)
        if traffic_node is not None and traffic_node.text:
            traffic = normalize_space(traffic_node.text)

        related_queries: list[str] = []
        for query_node in item.findall("ht:news_item/ht:news_item_title", namespaces):
            if query_node.text:
                related_queries.append(normalize_space(query_node.text))

        if title:
            items.append(
                {
                    "title": title,
                    "link": link,
                    "description": description,
                    "published_at": pub_date,
                    "traffic": traffic,
                    "related_queries": json.dumps(
                        related_queries[:8], ensure_ascii=False
                    ),
                }
            )

    return items


def fetch_google_trends(client: httpx.Client, geo: str) -> list[dict[str, str]]:
    response = client.get(GOOGLE_TRENDS_RSS, params={"geo": geo})
    response.raise_for_status()
    return parse_rss_items(response.text)


def fetch_google_news_sources(client: httpx.Client, keyword: str) -> list[TrendSource]:
    query = f'"{keyword}"'
    params = {
        "q": query,
        "hl": "en-US",
        "gl": "US",
        "ceid": "US:en",
    }

    try:
        response = client.get(GOOGLE_NEWS_RSS, params=params)
        response.raise_for_status()
    except Exception:
        return []

    rows = parse_rss_items(response.text)
    sources: list[TrendSource] = []

    for row in rows[:MAX_NEWS_PER_TREND]:
        title = row.get("title", "")
        url = row.get("link", "")
        summary = row.get("description", "")

        source_name = "Google News"
        if " - " in title:
            parts = title.rsplit(" - ", 1)
            title = parts[0].strip()
            source_name = parts[1].strip() or source_name

        sources.append(
            TrendSource(
                title=normalize_space(title),
                url=url,
                source=normalize_space(source_name),
                published_at=parse_date(row.get("published_at", "")),
                summary=normalize_space(summary[:600]),
            )
        )

    return sources


def parse_traffic_score(label: str) -> int:
    if not label:
        return 0

    raw = label.lower().replace("+", "").replace(",", "").strip()
    match = re.search(r"(\d+)", raw)

    if not match:
        return 0

    number = int(match.group(1))

    if "m" in raw:
        return number * 1_000_000

    if "k" in raw:
        return number * 1_000

    return number


def make_description(keyword: str, category: str, sources: list[TrendSource]) -> str:
    if category == "public-health":
        if sources:
            first = sources[0]
            return (
                f"{keyword} is currently appearing in public-health related search and news signals. "
                f"This page summarizes context, related updates, and source links without providing medical advice. "
                f"Latest visible source: {first.source}."
            )

        return (
            f"{keyword} is being tracked as a public-health related search trend. "
            "This page provides source links, context, and a calm summary for awareness only."
        )

    return (
        f"{keyword} is being tracked as a live search trend. "
        "This page summarizes public signals and related source links."
    )


def build_seo_keywords(keyword: str, category: str) -> list[str]:
    base = [
        keyword,
        f"{keyword} tracker",
        f"{keyword} updates",
        f"{keyword} live updates",
    ]

    if category == "public-health":
        base.extend(
            [
                f"{keyword} outbreak",
                f"{keyword} symptoms",
                f"{keyword} public health",
                f"{keyword} source links",
            ]
        )

    return base


def build_trend_item(
    raw: dict[str, str], geo: str, sources: list[TrendSource]
) -> TrendItem | None:
    keyword = normalize_space(raw.get("title", ""))

    if not keyword:
        return None

    news_text = " ".join(f"{source.title} {source.summary}" for source in sources)
    category = classify_keyword(keyword, news_text)

    if STRICT_HEALTH_MODE and not should_keep_trend(keyword, sources):
        return None

    if STRICT_HEALTH_MODE:
        category = "public-health"

    slug = slugify(keyword)
    published_at = parse_date(raw.get("published_at", "")) or now_iso()
    updated_at = now_iso()
    source_url = (
        raw.get("link", "")
        or f"https://trends.google.com/trends/explore?q={quote_plus(keyword)}"
    )
    traffic_label = raw.get("traffic", "")
    score = parse_traffic_score(traffic_label)

    related_queries: list[str] = []
    try:
        parsed_related = json.loads(raw.get("related_queries", "[]"))
        if isinstance(parsed_related, list):
            related_queries = [
                normalize_space(str(item))
                for item in parsed_related
                if normalize_space(str(item))
            ][:8]
    except Exception:
        related_queries = []

    description = make_description(keyword, category, sources)
    map_focus = infer_map_focus(keyword, news_text)

    title = f"{keyword} trend tracker"

    seo = {
        "title": f"{keyword} Live Trend Tracker | HantaUpdates",
        "description": description[:155],
        "canonical": f"{SITE_URL}/trend/{slug}",
        "keywords": build_seo_keywords(keyword, category),
    }

    return TrendItem(
        id=stable_id(f"{geo}:{keyword}"),
        slug=slug,
        keyword=keyword,
        title=title,
        description=description,
        category=category,
        geo=geo,
        search_volume=traffic_label,
        traffic_label=traffic_label,
        published_at=published_at,
        updated_at=updated_at,
        score=score,
        source_url=source_url,
        sources=sources,
        related_queries=related_queries,
        map_focus=map_focus,
        seo=seo,
    )


def merge_with_existing(new_items: list[TrendItem]) -> list[dict[str, Any]]:
    existing = read_json(TRENDS_FILE, [])
    by_slug: dict[str, dict[str, Any]] = {}

    for item in existing:
        if not isinstance(item, dict):
            continue

        slug = str(item.get("slug") or "")
        keyword = str(item.get("keyword") or "")

        if not slug or not keyword:
            continue

        sources_payload = item.get("sources") or []
        sources: list[TrendSource] = []

        if isinstance(sources_payload, list):
            for source in sources_payload:
                if not isinstance(source, dict):
                    continue

                sources.append(
                    TrendSource(
                        title=str(source.get("title") or ""),
                        url=str(source.get("url") or ""),
                        source=str(source.get("source") or ""),
                        published_at=str(source.get("published_at") or ""),
                        summary=str(source.get("summary") or ""),
                    )
                )

        if STRICT_HEALTH_MODE and not should_keep_trend(keyword, sources):
            continue

        by_slug[slug] = item

    for item in new_items:
        payload = asdict(item)
        old = by_slug.get(item.slug)

        if old:
            payload["first_seen_at"] = (
                old.get("first_seen_at") or old.get("updated_at") or item.updated_at
            )
            payload["views_hint"] = old.get("views_hint", 0)
        else:
            payload["first_seen_at"] = item.updated_at
            payload["views_hint"] = 0

        by_slug[item.slug] = payload

    rows = list(by_slug.values())

    rows.sort(
        key=lambda row: (
            int(row.get("score") or 0),
            str(row.get("updated_at") or ""),
        ),
        reverse=True,
    )

    return rows[:MAX_TRENDS]


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    collected: list[TrendItem] = []
    scanned_count = 0
    rejected_count = 0
    rejected_examples: list[str] = []

    with http_client() as client:
        for geo in TREND_GEOS:
            try:
                trend_rows = fetch_google_trends(client, geo)
                print(f"[Google Trends] {geo}: {len(trend_rows)} rows")
            except Exception as exc:
                print(f"[Google Trends] {geo} failed: {exc}")
                continue

            for raw in trend_rows:
                keyword = normalize_space(raw.get("title", ""))
                scanned_count += 1

                if not keyword:
                    rejected_count += 1
                    continue

                try:
                    sources = fetch_google_news_sources(client, keyword)
                    item = build_trend_item(raw, geo, sources)

                    if item:
                        collected.append(item)
                    else:
                        rejected_count += 1
                        if len(rejected_examples) < 20:
                            rejected_examples.append(keyword)

                    time.sleep(0.15)
                except Exception as exc:
                    rejected_count += 1
                    print(f"[Trend item] failed for {keyword}: {exc}")

    deduped: dict[str, TrendItem] = {}

    for item in collected:
        existing = deduped.get(item.slug)
        if existing is None or item.score > existing.score:
            deduped[item.slug] = item

    merged = merge_with_existing(list(deduped.values()))

    write_json(TRENDS_FILE, merged)

    snapshot = {
        "last_checked_at": now_iso(),
        "geos": TREND_GEOS,
        "strict_health_mode": STRICT_HEALTH_MODE,
        "max_trends": MAX_TRENDS,
        "max_news_per_trend": MAX_NEWS_PER_TREND,
        "scanned_raw_trends": scanned_count,
        "items_collected": len(collected),
        "items_written": len(merged),
        "items_rejected": rejected_count,
        "rejected_examples": rejected_examples,
        "keywords": [item.get("keyword") for item in merged[:30]],
    }

    write_json(TREND_SNAPSHOTS_FILE, snapshot)

    print("Trend data updated.")
    print(f"Scanned raw trends: {scanned_count}")
    print(f"Collected: {len(collected)}")
    print(f"Written: {len(merged)}")
    print(f"Rejected: {rejected_count}")
    print(f"Output: {TRENDS_FILE}")

    if rejected_examples:
        print("Rejected examples:")
        for keyword in rejected_examples[:10]:
            print(f" - {keyword}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted.", file=sys.stderr)
        raise SystemExit(130)
