from __future__ import annotations

from typing import Any

import httpx

from ..config import CDC_HANTAVIRUS_PAGES, CDC_TRAVEL_NOTICES_URL, DISEASE_KEYWORDS
from ..event_model import dedupe_events, make_event
from ..http_client import fetch_text
from ..metrics import extract_historical_cumulative_cases
from ..text_utils import extract_links, hash_text, strip_html, text_contains_disease


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
