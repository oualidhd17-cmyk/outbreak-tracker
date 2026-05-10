from __future__ import annotations

from typing import Any

import httpx

from ..config import (
    AFRICA_CDC_HOME_URL,
    AFRICA_CDC_OUTBREAKS_URL,
    DISEASE_KEYWORDS,
    MAX_DETAIL_PAGES,
)
from ..event_model import dedupe_events, make_event
from ..http_client import fetch_text
from ..text_utils import extract_links, strip_html, text_contains_disease


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
