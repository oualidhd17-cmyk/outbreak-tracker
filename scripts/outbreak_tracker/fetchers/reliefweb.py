from __future__ import annotations

from typing import Any
from urllib.parse import urlencode

import httpx

from ..config import (
    DISEASE_KEYWORDS,
    RELIEFWEB_APPNAME,
    RELIEFWEB_ENABLED,
    RELIEFWEB_REPORTS_URL,
)
from ..event_model import dedupe_events, make_event
from ..geo import get_location_registry
from ..http_client import FETCH_LOG, FetchResult
from ..text_utils import strip_html, text_contains_disease


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
            RELIEFWEB_REPORTS_URL,
            params=params,
            headers={"Accept": "application/json"},
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

    registry = get_location_registry()
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
                    coords = registry.get(str(country_name))

                    if coords and not any(
                        row["country"] == coords["country"]
                        for row in event["countries"]
                    ):
                        event["countries"].append(coords)

            events.append(event)

    return dedupe_events(events)
