from __future__ import annotations

import time
from typing import Any
from urllib.parse import urljoin

import httpx

from ..config import WHO_BASE_URL, WHO_DON_ENDPOINTS
from ..event_model import dedupe_events, make_event
from ..http_client import fetch_json, fetch_text
from ..text_utils import normalize_space, strip_html, text_contains_disease


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
