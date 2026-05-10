from __future__ import annotations

import json
from typing import Any

from .builder import build_static_data
from .config import DATA_DIR, DISEASE_KEYWORDS, DISEASE_NAME, SNAPSHOT_FILE
from .event_model import dedupe_events
from .fetchers.africa_cdc import fetch_africa_cdc_events
from .fetchers.cdc import fetch_cdc_context
from .fetchers.ecdc import fetch_ecdc_events
from .fetchers.reliefweb import fetch_reliefweb_events
from .fetchers.who import fetch_who_don_events
from .http_client import FETCH_LOG, http_client
from .metrics import normalize_metrics
from .selection import ensure_current_outbreak_fallback
from .storage import now_iso, read_json, write_json
from .text_utils import hash_text


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


def print_events_debug(events: list[dict[str, Any]]) -> None:
    print("\n================ EVENTS DEBUG ================")

    for index, event in enumerate(events, start=1):
        metrics = normalize_metrics(event.get("metrics") or {})
        quality = event.get("data_quality") or {}

        countries = event.get("countries") or []
        country_labels = ", ".join(
            str(country.get("country"))
            for country in countries
            if isinstance(country, dict)
        )

        print(f"[{index}] source={event.get('source_id')}")
        print(f"    date={event.get('published_at')}")
        print(f"    title={event.get('title')}")
        print(f"    url={event.get('url')}")
        print(f"    countries={country_labels or '-'}")
        print(
            "    metrics="
            f"confirmed={metrics.get('confirmed_cases')}, "
            f"suspected={metrics.get('suspected_cases')}, "
            f"probable={metrics.get('probable_cases')}, "
            f"possible={metrics.get('possible_cases')}, "
            f"investigation={metrics.get('under_investigation_cases')}, "
            f"pending={metrics.get('pending_cases')}, "
            f"total={metrics.get('total_identified_cases')}, "
            f"deaths={metrics.get('deaths')}"
        )
        print(
            "    quality="
            f"usable={quality.get('usable_current_metrics')}, "
            f"historical_like={quality.get('historical_like')}, "
            f"fallback={quality.get('fallback')}"
        )

        if event.get("data_correction"):
            print(f"    correction={event.get('data_correction')}")

    print("==============================================\n")


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    snapshots = read_json(SNAPSHOT_FILE, {})
    events, historical_context = collect_all_events()

    events = ensure_current_outbreak_fallback(events)
    events = dedupe_events(events)

    print_events_debug(events)

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
    global_data = build_static_data(events, historical_context)

    snapshots["combined_hash"] = combined_hash
    snapshots["last_checked_at"] = now_iso()
    snapshots["last_run_status"] = (
        "unchanged_rewritten" if old_hash == combined_hash else "updated"
    )
    snapshots["current_event_name"] = global_data.get("event_name")
    snapshots["events_count"] = len(events)
    snapshots["fetch_log_size"] = len(FETCH_LOG)

    write_json(SNAPSHOT_FILE, snapshots)

    if old_hash == combined_hash:
        print("No data changes detected. JSON files were still refreshed.")
    else:
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
    print(f"Tracked countries: {global_data.get('tracked_countries')}")
    print(f"Affected locations: {global_data.get('affected_countries')}")
    print(f"Output directory: {DATA_DIR}")
