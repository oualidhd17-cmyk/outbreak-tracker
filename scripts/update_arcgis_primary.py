from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "public" / "data"

DASHBOARD_ITEM_ID = "5c68442d2afc42d7ba2696e4cd393729"
DASHBOARD_URL = f"https://www.arcgis.com/apps/dashboards/{DASHBOARD_ITEM_ID}"
ARCGIS_ITEM_DATA_URL = (
    f"https://www.arcgis.com/sharing/rest/content/items/{DASHBOARD_ITEM_ID}/data"
)

RAW_OUTPUT = DATA_DIR / "arcgis_dashboard_raw.json"
NORMALIZED_OUTPUT = DATA_DIR / "arcgis_dashboard_normalized.json"
FRONTEND_ARCGIS_OUTPUT = DATA_DIR / "arcgis_dashboard.json"


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def safe_int(value: Any) -> int:
    try:
        if value is None:
            return 0

        if isinstance(value, bool):
            return int(value)

        if isinstance(value, (int, float)):
            return int(value)

        raw = str(value).strip().replace(",", "")
        match = re.search(r"-?\d+", raw)

        if not match:
            return 0

        return int(match.group(0))
    except Exception:
        return 0


def safe_float(value: Any) -> float | None:
    try:
        if value is None:
            return None

        number = float(value)

        if -180 <= number <= 180:
            return number

        return None
    except Exception:
        return None


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = value.replace("&", " and ")
    value = re.sub(r"['’]", "", value)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "item"


def http_client() -> httpx.Client:
    return httpx.Client(
        timeout=httpx.Timeout(60, connect=25),
        follow_redirects=True,
        headers={
            "User-Agent": "HantaMapArcGISPrimary/3.0 (+https://hantamap.online)",
            "Accept": "application/json,text/plain,*/*",
        },
    )


def fetch_json(
    client: httpx.Client,
    url: str,
    params: dict[str, Any] | None = None,
) -> Any:
    response = client.get(url, params=params)
    response.raise_for_status()
    return response.json()


def find_service_urls(payload: Any) -> list[str]:
    found: set[str] = set()

    def walk(value: Any) -> None:
        if isinstance(value, dict):
            for item in value.values():
                walk(item)
            return

        if isinstance(value, list):
            for item in value:
                walk(item)
            return

        if not isinstance(value, str):
            return

        text = value.replace("\\/", "/")

        for match in re.finditer(
            r"https://[^\"'\s<>]+/(?:FeatureServer|MapServer)(?:/\d+)?",
            text,
            flags=re.I,
        ):
            url = match.group(0).rstrip("),];}")
            found.add(url)

    walk(payload)
    return sorted(found)


def find_arcgis_item_ids(payload: Any) -> list[str]:
    found: set[str] = set()

    item_id_keys = {
        "itemid",
        "item_id",
        "portalitemid",
        "portal_item_id",
        "webmap",
        "webmapid",
        "mapid",
        "layeritemid",
        "layer_item_id",
    }

    def maybe_add(value: Any) -> None:
        if not isinstance(value, str):
            return

        raw = value.strip()

        if re.fullmatch(r"[a-fA-F0-9]{32}", raw):
            found.add(raw)

    def walk(value: Any) -> None:
        if isinstance(value, dict):
            for key, item in value.items():
                key_lower = str(key).lower().strip()

                if key_lower in item_id_keys or "itemid" in key_lower:
                    maybe_add(item)

                walk(item)

            return

        if isinstance(value, list):
            for item in value:
                walk(item)

            return

        if isinstance(value, str):
            for match in re.finditer(r"\b[a-fA-F0-9]{32}\b", value):
                found.add(match.group(0))

    walk(payload)

    return sorted(item_id for item_id in found if item_id != DASHBOARD_ITEM_ID)


def fetch_item_json(client: httpx.Client, item_id: str) -> dict[str, Any] | None:
    try:
        payload = fetch_json(
            client,
            f"https://www.arcgis.com/sharing/rest/content/items/{item_id}",
            {"f": "json"},
        )

        if isinstance(payload, dict) and not payload.get("error"):
            return payload

        return None
    except Exception as exc:
        print(f"[ArcGIS] Cannot read item {item_id}: {exc}")
        return None


def fetch_item_data_json(client: httpx.Client, item_id: str) -> Any | None:
    try:
        return fetch_json(
            client,
            f"https://www.arcgis.com/sharing/rest/content/items/{item_id}/data",
            {"f": "json"},
        )
    except Exception:
        return None


def discover_service_urls_from_item_ids(
    client: httpx.Client,
    item_ids: list[str],
) -> list[str]:
    service_urls: set[str] = set()

    for item_id in item_ids:
        item = fetch_item_json(client, item_id)

        if not item:
            continue

        item_title = item.get("title") or item_id
        item_type = item.get("type") or ""
        item_url = str(item.get("url") or "").strip()

        print(f"[ArcGIS] Linked item: {item_title} | type={item_type}")

        if re.search(r"/(?:FeatureServer|MapServer)(?:/\d+)?$", item_url, flags=re.I):
            service_urls.add(item_url)

        data_payload = fetch_item_data_json(client, item_id)

        if data_payload is not None:
            for url in find_service_urls(data_payload):
                service_urls.add(url)

            nested_item_ids = find_arcgis_item_ids(data_payload)

            for nested_item_id in nested_item_ids:
                if nested_item_id in [item_id, DASHBOARD_ITEM_ID]:
                    continue

                nested_item = fetch_item_json(client, nested_item_id)

                if not nested_item:
                    continue

                nested_url = str(nested_item.get("url") or "").strip()

                if re.search(
                    r"/(?:FeatureServer|MapServer)(?:/\d+)?$",
                    nested_url,
                    flags=re.I,
                ):
                    print(
                        f"[ArcGIS] Nested service item: {nested_item.get('title') or nested_item_id}"
                    )
                    service_urls.add(nested_url)

    return sorted(service_urls)


def get_service_root_and_layer(url: str) -> tuple[str, int | None]:
    clean = url.rstrip("/")
    match = re.search(r"/(FeatureServer|MapServer)/(\d+)$", clean, flags=re.I)

    if match:
        layer_id = int(match.group(2))
        root = clean[: clean.rfind("/")]
        return root, layer_id

    return clean, None


def discover_layer_urls(client: httpx.Client, service_url: str) -> list[str]:
    root, layer_id = get_service_root_and_layer(service_url)

    if layer_id is not None:
        return [f"{root}/{layer_id}"]

    try:
        service_info = fetch_json(client, root, {"f": "json"})
    except Exception as exc:
        print(f"[ArcGIS] Cannot read service info: {root}: {exc}")
        return []

    urls: list[str] = []

    for key in ["layers", "tables"]:
        for layer in service_info.get(key, []) or []:
            if not isinstance(layer, dict):
                continue

            current_id = layer.get("id")

            if current_id is None:
                continue

            urls.append(f"{root}/{current_id}")

    return urls


def query_layer_features(client: httpx.Client, layer_url: str) -> dict[str, Any]:
    layer_info = fetch_json(client, layer_url, {"f": "json"})

    max_record_count = safe_int(layer_info.get("maxRecordCount")) or 2000
    object_id_field = (
        layer_info.get("objectIdField")
        or layer_info.get("objectIdFieldName")
        or "OBJECTID"
    )

    all_features: list[dict[str, Any]] = []
    offset = 0

    while True:
        params = {
            "f": "json",
            "where": "1=1",
            "outFields": "*",
            "returnGeometry": "true",
            "outSR": "4326",
            "orderByFields": object_id_field,
            "resultOffset": offset,
            "resultRecordCount": max_record_count,
        }

        payload = fetch_json(client, f"{layer_url}/query", params)

        if payload.get("error"):
            raise RuntimeError(payload["error"])

        features = payload.get("features", []) or []

        if not features:
            break

        all_features.extend(features)

        exceeded = bool(payload.get("exceededTransferLimit"))

        if not exceeded and len(features) < max_record_count:
            break

        offset += max_record_count

    return {
        "layer_url": layer_url,
        "layer_name": layer_info.get("name") or layer_info.get("title") or layer_url,
        "geometry_type": layer_info.get("geometryType"),
        "object_id_field": object_id_field,
        "fields": layer_info.get("fields", []),
        "features_count": len(all_features),
        "features": all_features,
    }


def pick_attr(attrs: dict[str, Any], candidates: list[str], default: Any = None) -> Any:
    lowered = {str(key).lower().strip(): str(key) for key in attrs.keys()}

    for candidate in candidates:
        direct_key = lowered.get(candidate.lower())

        if direct_key is not None:
            value = attrs.get(direct_key)

            if value not in [None, ""]:
                return value

    for key in attrs.keys():
        key_lower = str(key).lower().strip()

        for candidate in candidates:
            if candidate.lower() in key_lower:
                value = attrs.get(key)

                if value not in [None, ""]:
                    return value

    return default


def normalize_status(value: Any) -> str:
    raw = str(value or "").strip().lower()

    if not raw:
        return "unknown"

    if "deceased" in raw or "death" in raw or "dead" in raw or "fatal" in raw:
        return "deceased"

    if "confirm" in raw or "positive" in raw:
        return "confirmed"

    if "suspect" in raw:
        return "suspected"

    if "monitor" in raw or "quarantine" in raw or "isolation" in raw or "watch" in raw:
        return "monitoring"

    if "pending" in raw or "await" in raw or "test" in raw:
        return "suspected"

    return "unknown"


def status_to_risk(status: str) -> str:
    if status == "deceased":
        return "high"

    if status == "confirmed":
        return "moderate"

    if status in ["suspected", "monitoring"]:
        return "low"

    return "unknown"


def get_geometry_lat_lng(feature: dict[str, Any]) -> tuple[float | None, float | None]:
    geometry = feature.get("geometry") or {}

    x = safe_float(geometry.get("x"))
    y = safe_float(geometry.get("y"))

    if x is not None and y is not None and -90 <= y <= 90 and -180 <= x <= 180:
        return y, x

    lng = safe_float(geometry.get("longitude"))
    lat = safe_float(geometry.get("latitude"))

    if lat is not None and lng is not None:
        return lat, lng

    return None, None


def normalize_location_name(value: Any) -> str:
    raw = str(value or "").strip()

    if not raw:
        return "Unknown"

    return re.sub(r"\s+", " ", raw).strip()


def normalize_country_from_attrs(attrs: dict[str, Any]) -> str:
    value = pick_attr(
        attrs,
        [
            "country",
            "country_name",
            "last_location",
            "last location",
            "location",
            "place",
            "state",
            "region",
            "port",
            "city",
            "name",
        ],
        "Unknown",
    )

    country = normalize_location_name(value)

    if country.lower() in ["mv hondius", "hondius", "ship", "cruise ship"]:
        return "MV Hondius"

    if country.lower() in ["tristan da cunha", "tristan da cunha island"]:
        return "Tristan da Cunha"

    if country.upper() in ["USA", "US", "UNITED STATES OF AMERICA"]:
        return "United States"

    if country.upper() in ["UK", "GB", "GREAT BRITAIN"]:
        return "United Kingdom"

    return country


def normalize_case_title(attrs: dict[str, Any], fallback_country: str) -> str:
    value = pick_attr(
        attrs,
        [
            "title",
            "case",
            "case_name",
            "name",
            "description",
            "details",
            "notes",
            "status",
        ],
        fallback_country,
    )

    title = normalize_location_name(value)

    if title == "Unknown":
        return fallback_country

    return title


def normalize_case_details(attrs: dict[str, Any]) -> str:
    value = pick_attr(
        attrs,
        [
            "details",
            "detail",
            "description",
            "notes",
            "note",
            "summary",
            "comments",
            "comment",
            "information",
            "info",
        ],
        "",
    )

    return normalize_location_name(value)


def normalize_source_url(attrs: dict[str, Any]) -> str:
    value = pick_attr(
        attrs,
        [
            "source_url",
            "source url",
            "url",
            "link",
            "reference",
            "citation",
            "source",
            "website",
        ],
        "",
    )

    raw = str(value or "").strip()

    if raw.startswith("http://") or raw.startswith("https://"):
        return raw

    return ""


def normalize_exposure_date(attrs: dict[str, Any]) -> str:
    value = pick_attr(
        attrs,
        [
            "date",
            "reported",
            "reported_date",
            "report_date",
            "exposed",
            "exposure",
            "last_exposed",
            "created_date",
            "updated",
            "editdate",
        ],
        "",
    )

    if value in [None, ""]:
        return ""

    if isinstance(value, (int, float)):
        try:
            timestamp = float(value)

            if timestamp > 10_000_000_000:
                timestamp = timestamp / 1000

            return datetime.fromtimestamp(timestamp, timezone.utc).date().isoformat()
        except Exception:
            return ""

    raw = str(value).strip()

    if not raw:
        return ""

    match = re.search(r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})", raw)

    if match:
        year, month, day = match.groups()
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"

    return raw[:10]


def normalize_features(raw_layers: list[dict[str, Any]]) -> dict[str, Any]:
    cases: list[dict[str, Any]] = []

    for layer in raw_layers:
        layer_name = str(layer.get("layer_name") or "ArcGIS layer")
        features = layer.get("features") or []

        for index, feature in enumerate(features, start=1):
            attrs = feature.get("attributes") or {}

            if not isinstance(attrs, dict):
                continue

            lat, lng = get_geometry_lat_lng(feature)

            if lat is None or lng is None:
                continue

            raw_status = pick_attr(
                attrs,
                [
                    "status",
                    "case_status",
                    "classification",
                    "type",
                    "case_type",
                    "category",
                    "group",
                    "case_group",
                ],
                "",
            )

            status = normalize_status(raw_status)
            country = normalize_country_from_attrs(attrs)
            title = normalize_case_title(attrs, country)
            details = normalize_case_details(attrs)
            source_url = normalize_source_url(attrs)
            exposed_at = normalize_exposure_date(attrs)

            object_id = str(
                pick_attr(
                    attrs,
                    [
                        "objectid",
                        "object_id",
                        "fid",
                        "id",
                        "globalid",
                        "global_id",
                        "case_id",
                    ],
                    f"{layer_name}-{index}",
                )
            )

            case_id = slugify(f"{layer_name}-{object_id}-{country}-{status}")

            cases.append(
                {
                    "id": case_id,
                    "layer": layer_name,
                    "status": status,
                    "raw_status": str(raw_status or ""),
                    "title": title,
                    "details": details,
                    "last_location": country,
                    "country": country,
                    "lat": lat,
                    "lng": lng,
                    "source_url": source_url,
                    "exposed_at": exposed_at,
                    "raw_attributes": attrs,
                }
            )

    countries_by_name: dict[str, dict[str, Any]] = {}

    for case in cases:
        country_name = case["country"]
        status = case["status"]

        row = countries_by_name.setdefault(
            country_name,
            {
                "country": country_name,
                "region": "",
                "is_country": False,
                "confirmed": 0,
                "suspected": 0,
                "probable": 0,
                "possible": 0,
                "under_investigation": 0,
                "pending": 0,
                "unconfirmed": 0,
                "total_identified": 0,
                "ruled_out": 0,
                "negative": 0,
                "deaths": 0,
                "recovered": 0,
                "hospitalized": 0,
                "active": 0,
                "lat": case["lat"],
                "lng": case["lng"],
                "risk_level": "unknown",
                "last_updated": "",
                "items": [],
            },
        )

        if status == "confirmed":
            row["confirmed"] += 1
        elif status == "deceased":
            row["deaths"] += 1
        elif status == "suspected":
            row["suspected"] += 1
        elif status == "monitoring":
            row["under_investigation"] += 1
        else:
            row["unconfirmed"] += 1

        row["items"].append(case)

    checked_at = now_iso()
    countries: list[dict[str, Any]] = []

    for row in countries_by_name.values():
        row["total_identified"] = (
            row["confirmed"]
            + row["suspected"]
            + row["under_investigation"]
            + row["pending"]
            + row["unconfirmed"]
            + row["deaths"]
        )

        row["active"] = max(row["total_identified"] - row["deaths"], 0)
        row["last_updated"] = checked_at

        if row["deaths"] > 0:
            row["risk_level"] = "high"
        elif row["confirmed"] > 0:
            row["risk_level"] = "moderate"
        elif row["suspected"] > 0 or row["under_investigation"] > 0:
            row["risk_level"] = "low"
        else:
            row["risk_level"] = "unknown"

        countries.append(row)

    countries.sort(
        key=lambda item: (
            int(item.get("total_identified") or 0),
            int(item.get("confirmed") or 0),
            int(item.get("deaths") or 0),
        ),
        reverse=True,
    )

    return {
        "checked_at": checked_at,
        "source": "ArcGIS independent research dashboard",
        "dashboard_url": DASHBOARD_URL,
        "dashboard_item_id": DASHBOARD_ITEM_ID,
        "note": (
            "Independent ArcGIS research map. Used as primary tracking signal for this dashboard. "
            "Official WHO / CDC / ECDC sources remain available as fallback context."
        ),
        "cases": cases,
        "countries": countries,
    }


def build_global_data(normalized: dict[str, Any]) -> dict[str, Any]:
    countries = normalized["countries"]
    cases = normalized["cases"]
    checked_at = normalized["checked_at"]

    total_confirmed = sum(1 for item in cases if item["status"] == "confirmed")
    total_deaths = sum(1 for item in cases if item["status"] == "deceased")
    total_suspected = sum(1 for item in cases if item["status"] == "suspected")
    total_monitoring = sum(1 for item in cases if item["status"] == "monitoring")
    total_unknown = sum(1 for item in cases if item["status"] == "unknown")

    total_identified = (
        total_confirmed
        + total_deaths
        + total_suspected
        + total_monitoring
        + total_unknown
    )

    if total_deaths > 0:
        risk_level = "high"
    elif total_confirmed > 0:
        risk_level = "moderate"
    elif total_suspected > 0 or total_monitoring > 0:
        risk_level = "low"
    else:
        risk_level = "unknown"

    return {
        "disease": "Hantavirus",
        "event_name": "ANDV Hantavirus 2026 Live Tracker",
        "tracked_countries": len(countries),
        "total_confirmed": total_confirmed,
        "total_deaths": total_deaths,
        "total_recovered": 0,
        "total_suspected": total_suspected,
        "total_probable": 0,
        "total_possible": 0,
        "total_under_investigation": total_monitoring,
        "total_pending": 0,
        "total_unconfirmed": total_suspected + total_monitoring + total_unknown,
        "total_ruled_out": 0,
        "total_negative": 0,
        "total_identified_cases": total_identified,
        "total_hospitalized": 0,
        "affected_countries": len(countries),
        "global_risk_level": risk_level,
        "last_updated": checked_at,
        "source_label": "ArcGIS independent research dashboard",
        "primary_event_url": DASHBOARD_URL,
        "current_outbreak": {
            "event_name": "ANDV Hantavirus 2026 Live Tracker",
            "confirmed_cases": total_confirmed,
            "suspected_cases": total_suspected,
            "probable_cases": 0,
            "possible_cases": 0,
            "under_investigation_cases": total_monitoring,
            "pending_cases": 0,
            "ruled_out_cases": 0,
            "negative_cases": 0,
            "unconfirmed_cases": total_suspected + total_monitoring + total_unknown,
            "total_identified_cases": total_identified,
            "deaths": total_deaths,
            "hospitalized": 0,
            "recovered": 0,
            "risk_level": risk_level,
            "source": "ArcGIS independent research dashboard",
            "source_id": "arcgis_independent_dashboard",
            "source_url": DASHBOARD_URL,
            "published_at": checked_at[:10],
        },
        "historical_context": None,
        "data_notes": [
            "ArcGIS independent research dashboard is used as the primary tracking source.",
            "WHO / CDC / ECDC / Africa CDC updater remains available as fallback if ArcGIS fails.",
            "Case counts are tentative and derived from public ArcGIS dashboard layer data.",
            "Confirmed means tested positive where the ArcGIS item is categorized as confirmed.",
            "Deceased means suspected or confirmed hantavirus death according to the ArcGIS item category.",
            "Suspected means symptomatic or awaiting test results according to the ArcGIS item category.",
            "Monitoring means people under isolation, quarantine, or observation according to the ArcGIS item category.",
            "This site is an independent tracker and does not provide medical advice.",
        ],
    }


def build_points(normalized: dict[str, Any]) -> list[dict[str, Any]]:
    points: list[dict[str, Any]] = []

    for case in normalized["cases"]:
        status = case["status"]

        confirmed = 1 if status == "confirmed" else 0
        deaths = 1 if status == "deceased" else 0
        suspected = 1 if status == "suspected" else 0
        monitoring = 1 if status == "monitoring" else 0
        unknown = 1 if status == "unknown" else 0
        total_identified = confirmed + deaths + suspected + monitoring + unknown

        points.append(
            {
                "id": case["id"],
                "name": case["title"],
                "country": case["country"],
                "region": case.get("last_location") or case["country"],
                "is_country": False,
                "confirmed": confirmed,
                "suspected": suspected,
                "probable": 0,
                "possible": 0,
                "under_investigation": monitoring,
                "pending": 0,
                "unconfirmed": suspected + monitoring + unknown,
                "total_identified": total_identified,
                "deaths": deaths,
                "lat": case["lat"],
                "lng": case["lng"],
                "source": "ArcGIS independent research dashboard",
                "source_url": case.get("source_url") or DASHBOARD_URL,
                "risk_level": status_to_risk(status),
            }
        )

    return points


def build_timeline(global_data: dict[str, Any]) -> list[dict[str, Any]]:
    date = str(global_data.get("last_updated") or now_iso())[:10]

    return [
        {
            "date": date,
            "confirmed": global_data["total_confirmed"],
            "suspected": global_data["total_suspected"],
            "probable": 0,
            "possible": 0,
            "under_investigation": global_data["total_under_investigation"],
            "pending": 0,
            "unconfirmed": global_data["total_unconfirmed"],
            "total_identified": global_data["total_identified_cases"],
            "deaths": global_data["total_deaths"],
            "recovered": 0,
            "source": "ArcGIS independent research dashboard",
            "source_id": "arcgis_independent_dashboard",
            "source_url": DASHBOARD_URL,
        }
    ]


def build_sources(checked_at: str) -> list[dict[str, Any]]:
    return [
        {
            "id": "arcgis_independent_dashboard",
            "name": "ANDV Hantavirus 2026 ArcGIS independent research dashboard",
            "url": DASHBOARD_URL,
            "type": "early-warning",
            "confidence": "medium",
            "usage": "primary_tracking_source",
            "last_checked_at": checked_at,
            "status": {
                "ok": 1,
                "failed": 0,
                "last_status_code": 200,
                "last_error": None,
            },
        },
        {
            "id": "who",
            "name": "World Health Organization",
            "url": "https://www.who.int/emergencies/disease-outbreak-news",
            "type": "official",
            "confidence": "high",
            "usage": "fallback_official_context",
            "last_checked_at": checked_at,
            "status": {
                "ok": 0,
                "failed": 0,
                "last_status_code": None,
                "last_error": None,
            },
        },
        {
            "id": "cdc",
            "name": "Centers for Disease Control and Prevention",
            "url": "https://www.cdc.gov/hantavirus/",
            "type": "health-agency",
            "confidence": "high",
            "usage": "fallback_official_context",
            "last_checked_at": checked_at,
            "status": {
                "ok": 0,
                "failed": 0,
                "last_status_code": None,
                "last_error": None,
            },
        },
        {
            "id": "ecdc",
            "name": "European Centre for Disease Prevention and Control",
            "url": "https://www.ecdc.europa.eu/en/news-events",
            "type": "health-agency",
            "confidence": "high",
            "usage": "fallback_official_context",
            "last_checked_at": checked_at,
            "status": {
                "ok": 0,
                "failed": 0,
                "last_status_code": None,
                "last_error": None,
            },
        },
    ]


def write_site_data(normalized: dict[str, Any]) -> dict[str, Any]:
    checked_at = normalized["checked_at"]
    global_data = build_global_data(normalized)

    countries = []

    for item in normalized["countries"]:
        copied = dict(item)
        copied.pop("items", None)
        countries.append(copied)

    points = build_points(normalized)
    timeline = build_timeline(global_data)
    sources = build_sources(checked_at)

    all_countries = [
        {
            "country": item["country"],
            "region": item.get("region") or "",
            "lat": item["lat"],
            "lng": item["lng"],
            "is_country": bool(item.get("is_country", False)),
        }
        for item in countries
    ]

    official_events = [
        {
            "source": "ArcGIS independent research dashboard",
            "source_id": "arcgis_independent_dashboard",
            "type": "current_outbreak",
            "title": global_data["event_name"],
            "summary": "Case data imported from the public ArcGIS independent research dashboard.",
            "url": DASHBOARD_URL,
            "published_at": checked_at[:10],
            "metrics": {
                "confirmed_cases": global_data["total_confirmed"],
                "suspected_cases": global_data["total_suspected"],
                "probable_cases": 0,
                "possible_cases": 0,
                "under_investigation_cases": global_data["total_under_investigation"],
                "pending_cases": 0,
                "ruled_out_cases": 0,
                "negative_cases": 0,
                "unconfirmed_cases": global_data["total_unconfirmed"],
                "total_identified_cases": global_data["total_identified_cases"],
                "deaths": global_data["total_deaths"],
                "hospitalized": 0,
                "recovered": 0,
            },
            "countries": countries,
            "risk_level": global_data["global_risk_level"],
            "raw_hash": f"arcgis-{checked_at}",
        }
    ]

    latest_articles = []

    for case in normalized["cases"]:
        status_label = str(case["status"]).replace("_", " ").title()
        country = case["country"]
        slug = slugify(f"{status_label} hantavirus case {country} {case['id']}")

        latest_articles.append(
            {
                "id": slug,
                "slug": slug,
                "title": f"{status_label} Hantavirus signal reported in {country}",
                "description": (
                    f"Latest ANDV Hantavirus 2026 tracker update for {country}. "
                    f"Status: {status_label}. Independent tracking signal based on public map data."
                ),
                "country": country,
                "status": case["status"],
                "case_id": case["id"],
                "published_at": checked_at,
                "updated_at": checked_at,
                "source_url": case.get("source_url") or DASHBOARD_URL,
            }
        )

    write_json(DATA_DIR / "global.json", global_data)
    write_json(DATA_DIR / "countries.json", countries)
    write_json(DATA_DIR / "points.json", points)
    write_json(DATA_DIR / "timeline.json", timeline)
    write_json(DATA_DIR / "sources.json", sources)
    write_json(DATA_DIR / "official_events.json", official_events)
    write_json(DATA_DIR / "historical_context.json", {})
    write_json(DATA_DIR / "fetch_log.json", [])
    write_json(DATA_DIR / "all_countries.json", all_countries)
    write_json(DATA_DIR / "latest_articles.json", latest_articles[:100])

    return global_data


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    with http_client() as client:
        print("[ArcGIS] Reading dashboard item data...")
        dashboard_data = fetch_json(client, ARCGIS_ITEM_DATA_URL)

        service_urls = find_service_urls(dashboard_data)
        print(f"[ArcGIS] Direct services found: {len(service_urls)}")

        dashboard_item_ids = find_arcgis_item_ids(dashboard_data)
        print(f"[ArcGIS] Linked item ids found: {len(dashboard_item_ids)}")

        if dashboard_item_ids:
            linked_service_urls = discover_service_urls_from_item_ids(
                client,
                dashboard_item_ids,
            )

            for service_url in linked_service_urls:
                if service_url not in service_urls:
                    service_urls.append(service_url)

        print(f"[ArcGIS] Total services found: {len(service_urls)}")

        if not service_urls:
            debug_path = DATA_DIR / "arcgis_dashboard_debug_data.json"
            write_json(debug_path, dashboard_data)

            raise RuntimeError(
                "No ArcGIS FeatureServer/MapServer URLs found. "
                f"Dashboard debug data saved to {debug_path}."
            )

        layer_urls: list[str] = []

        for service_url in service_urls:
            discovered = discover_layer_urls(client, service_url)

            for layer_url in discovered:
                if layer_url not in layer_urls:
                    layer_urls.append(layer_url)

        print(f"[ArcGIS] Layers found: {len(layer_urls)}")

        if not layer_urls:
            raise RuntimeError("No ArcGIS layers discovered.")

        raw_layers: list[dict[str, Any]] = []

        for layer_url in layer_urls:
            try:
                print(f"[ArcGIS] Query layer: {layer_url}")
                layer_payload = query_layer_features(client, layer_url)
                print(
                    f"[ArcGIS] Layer features: {layer_payload.get('features_count', 0)}"
                )
                raw_layers.append(layer_payload)
            except Exception as exc:
                print(f"[ArcGIS] Failed layer: {layer_url}: {exc}")

    raw_payload = {
        "checked_at": now_iso(),
        "dashboard_item_id": DASHBOARD_ITEM_ID,
        "dashboard_url": DASHBOARD_URL,
        "service_urls": service_urls,
        "layer_urls": layer_urls,
        "layers": raw_layers,
    }

    normalized = normalize_features(raw_layers)

    if len(normalized["cases"]) == 0:
        raise RuntimeError("ArcGIS returned zero usable case features.")

    global_data = write_site_data(normalized)

    write_json(RAW_OUTPUT, raw_payload)
    write_json(NORMALIZED_OUTPUT, normalized)
    write_json(FRONTEND_ARCGIS_OUTPUT, normalized)

    print("[ArcGIS] Primary data update completed.")
    print(f"Cases: {len(normalized['cases'])}")
    print(f"Locations: {len(normalized['countries'])}")
    print(f"Confirmed: {global_data['total_confirmed']}")
    print(f"Suspected: {global_data['total_suspected']}")
    print(f"Monitoring: {global_data['total_under_investigation']}")
    print(f"Deaths: {global_data['total_deaths']}")
    print(f"Total identified: {global_data['total_identified_cases']}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("Interrupted.", file=sys.stderr)
        raise SystemExit(130)
    except Exception as exc:
        print(f"[ArcGIS] Primary update failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
