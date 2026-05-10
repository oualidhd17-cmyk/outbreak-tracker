from __future__ import annotations

import os
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
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

MAX_CURRENT_TOTAL = int(os.getenv("OUTBREAK_MAX_CURRENT_TOTAL", "50"))
MAX_CURRENT_CONFIRMED = int(os.getenv("OUTBREAK_MAX_CURRENT_CONFIRMED", "20"))
MAX_CURRENT_DEATHS = int(os.getenv("OUTBREAK_MAX_CURRENT_DEATHS", "10"))

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

OFFICIAL_CURRENT_OUTBREAK_FALLBACK: dict[str, Any] = {
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
            "country": "Cruise ship travel",
            "region": "Atlantic Ocean / travel-related signal",
            "lat": 23.5,
            "lng": -31.0,
        }
    ],
    "risk_level": "low",
    "raw_hash": "who-official-hantavirus-fallback",
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
    "data_quality": {
        "usable_current_metrics": True,
        "historical_like": False,
        "fallback": True,
    },
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

HISTORICAL_CONTEXT_TERMS = [
    "since 1993",
    "from 1993",
    "between 1993",
    "cumulative",
    "surveillance",
    "reported cases of hantavirus disease",
    "cases of hantavirus disease were reported",
    "annual",
    "historical",
    "data and statistics",
    "data-research",
    "case counts",
    "during 1993",
    "in the united states since",
]

CURRENT_SIGNAL_TERMS = [
    "outbreak",
    "cluster",
    "under investigation",
    "suspected outbreak",
    "confirmed outbreak",
    "health alert",
    "disease outbreak news",
    "travel notice",
    "recent",
    "reported on",
    "investigation",
    "cruise ship",
    "cruise-ship",
    "mv hondius",
    "hondius",
]
