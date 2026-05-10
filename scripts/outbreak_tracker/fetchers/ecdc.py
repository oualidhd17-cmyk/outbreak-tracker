from __future__ import annotations

import re
import time
from typing import Any

import httpx

from ..config import (
    DISEASE_KEYWORDS,
    ECDC_MEDIA_CENTRE_URL,
    ECDC_RSS_INDEX_URL,
    MAX_DETAIL_PAGES,
)
from ..event_model import dedupe_events, make_event, parse_rss_items
from ..http_client import fetch_text
from ..text_utils import (
    extract_links,
    normalize_space,
    strip_html,
    text_contains_disease,
)


def discover_ecdc_rss_urls(client: httpx.Client) -> list[str]:
    candidates = [
        "https://www.ecdc.europa.eu/en/rss-feeds",
        "https://www.ecdc.europa.eu/en/news-events/rss.xml",
        "https://www.ecdc.europa.eu/en/news-events/rss",
        "https://www.ecdc.europa.eu/en/news-events/rss.xml?field_ct_publication_type_tid=All",
    ]

    try:
        page = fetch_text(client, ECDC_RSS_INDEX_URL, "ecdc")

        for link in extract_links(ECDC_RSS_INDEX_URL, page):
            lowered = link.lower()

            if "rss" in lowered or "feed" in lowered:
                candidates.append(link)
    except Exception as exc:
        print(f"[ECDC] RSS discovery failed: {exc}")

    deduped: list[str] = []

    for url in candidates:
        if url not in deduped:
            deduped.append(url)

    return deduped


def fetch_ecdc_events(client: httpx.Client) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []

    for rss_url in discover_ecdc_rss_urls(client):
        try:
            xml_text = fetch_text(client, rss_url, "ecdc")
        except Exception:
            continue

        for item in parse_rss_items(xml_text):
            combined = " ".join([item.get("title", ""), item.get("description", "")])

            if not text_contains_disease(combined):
                continue

            link = item.get("link") or rss_url
            detail_text = ""

            if link.startswith("http"):
                try:
                    detail_text = strip_html(fetch_text(client, link, "ecdc"))
                    time.sleep(0.2)
                except Exception as exc:
                    print(f"[ECDC] detail fetch failed: {link}: {exc}")

            full_text_for_metrics = normalize_space(
                " ".join(
                    [
                        item.get("title", ""),
                        item.get("description", ""),
                        detail_text,
                    ]
                )
            )

            event = make_event(
                source="European Centre for Disease Prevention and Control",
                source_id="ecdc",
                event_type="current_outbreak",
                title=item.get("title", ""),
                summary=item.get("description", ""),
                url=link,
                published_at=item.get("published_at", ""),
                full_text=full_text_for_metrics,
            )

            if event:
                events.append(event)

    try:
        media_html = fetch_text(client, ECDC_MEDIA_CENTRE_URL, "ecdc")

        for link in extract_links(ECDC_MEDIA_CENTRE_URL, media_html):
            if len(events) >= MAX_DETAIL_PAGES:
                break

            candidate_label = link.lower()

            if not any(
                keyword.replace(" ", "-") in candidate_label
                or keyword.replace(" ", "%20") in candidate_label
                for keyword in DISEASE_KEYWORDS
            ):
                continue

            try:
                detail_html = fetch_text(client, link, "ecdc")
                detail_text = strip_html(detail_html)
            except Exception:
                continue

            if not text_contains_disease(detail_text):
                continue

            h1 = re.search(r"(?is)<h1[^>]*>(.*?)</h1>", detail_html)
            title = strip_html(h1.group(1)) if h1 else "ECDC disease outbreak update"

            event = make_event(
                source="European Centre for Disease Prevention and Control",
                source_id="ecdc",
                event_type="current_outbreak",
                title=title,
                summary=detail_text[:1000],
                url=link,
                published_at="",
                full_text=detail_text,
            )

            if event:
                events.append(event)

    except Exception as exc:
        print(f"[ECDC] media centre fetch failed: {exc}")

    return dedupe_events(events)
