from __future__ import annotations

from dataclasses import asdict
from typing import Any

from .config import (
    AFRICA_CDC_OUTBREAKS_URL,
    DATA_DIR,
    DISEASE_NAME,
    ECDC_MEDIA_CENTRE_URL,
    RELIEFWEB_REPORTS_URL,
)
from .geo import get_location_registry, list_all_countries
from .http_client import FETCH_LOG
from .selection import (
    choose_primary_current_event,
    event_has_usable_current_metrics,
    merge_current_metrics,
)
from .storage import now_iso, write_json
from .metrics import normalize_metrics


def build_countries(
    primary_event: dict[str, Any] | None,
    current: dict[str, Any],
    checked_at: str,
) -> list[dict[str, Any]]:
    if primary_event is None:
        return []

    registry = get_location_registry()
    countries = primary_event.get("countries") or [registry["Multi-country"]]
    rows: list[dict[str, Any]] = []

    # قراءة جميع الدول المذكورة في الحدث وإعطاؤها أرقام الحدث لتظهر على الخريطة
    for country in countries:
        total_identified = int(current.get("total_identified_cases") or 0)
        deaths = int(current.get("deaths") or 0)
        recovered = int(current.get("recovered") or 0)

        rows.append(
            {
                "country": country["country"],
                "region": country.get("region", ""),
                "is_country": bool(country.get("is_country", False)),
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
                "recovered": recovered,
                "hospitalized": int(current.get("hospitalized") or 0),
                "active": max(total_identified - deaths - recovered, 0),
                "lat": float(country["lat"]),
                "lng": float(country["lng"]),
                "risk_level": current.get("risk_level") or "unknown",
                "last_updated": checked_at,
            }
        )

    return rows


def build_points(
    countries: list[dict[str, Any]],
    current: dict[str, Any],
) -> list[dict[str, Any]]:
    import re

    points: list[dict[str, Any]] = []

    for country in countries:
        slug = re.sub(r"[^a-z0-9]+", "-", country["country"].lower()).strip("-")

        points.append(
            {
                "id": f"{slug}-{DISEASE_NAME.lower().replace(' ', '-')}-current",
                "name": current.get("event_name") or f"Current {DISEASE_NAME} event",
                "country": country["country"],
                "region": country.get("region", ""),
                "is_country": bool(country.get("is_country", False)),
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
    events: list[dict[str, Any]],
    checked_at: str,
) -> list[dict[str, Any]]:
    timeline: list[dict[str, Any]] = []

    for event in events:
        if event.get("type") != "current_outbreak":
            continue

        if not event_has_usable_current_metrics(event):
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
            {
                "ok": 0,
                "failed": 0,
                "last_status_code": None,
                "last_error": None,
            },
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
            {
                "ok": 0,
                "failed": 0,
                "last_status_code": None,
                "last_error": None,
            },
        )

    return source_defs


def build_static_data(
    events: list[dict[str, Any]],
    historical_context: dict[str, Any] | None,
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

    all_countries = list_all_countries()

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
        "tracked_countries": len(all_countries),
        "global_risk_level": current.get("risk_level") or "unknown",
        "last_updated": checked_at,
        "source_label": "WHO / ECDC / CDC / Africa CDC / ReliefWeb",
        "current_outbreak": current,
        "primary_event_url": current.get("source_url"),
        "historical_context": historical_payload,
        "data_notes": [
            "all_countries.json contains the world country registry for search, SEO, filters and future pages.",
            "countries.json contains only affected countries or affected non-country locations.",
            "points.json contains only outbreak map markers, not all countries.",
            "Current outbreak metrics are selected only from usable current-outbreak signals.",
            "Large historical or cumulative surveillance values are removed from dashboard totals.",
            "CDC cumulative surveillance values are stored as historical context only and are not added to current outbreak totals.",
            "Unconfirmed cases = suspected + probable + possible + under investigation + pending unless a source states an explicit unconfirmed count.",
            "For known cruise-related hantavirus pages, suspicious passenger/crew counts are ignored and safe fallback metrics may be used.",
            "ReliefWeb is optional and requires a pre-approved RELIEFWEB_APPNAME.",
        ],
    }

    write_json(DATA_DIR / "global.json", global_data)
    write_json(DATA_DIR / "all_countries.json", all_countries)
    write_json(DATA_DIR / "countries.json", countries)
    write_json(DATA_DIR / "points.json", points)
    write_json(DATA_DIR / "timeline.json", timeline)
    write_json(DATA_DIR / "sources.json", build_sources(checked_at))
    write_json(DATA_DIR / "official_events.json", events)
    write_json(DATA_DIR / "historical_context.json", historical_context or {})
    write_json(DATA_DIR / "fetch_log.json", [asdict(row) for row in FETCH_LOG])

    return global_data
