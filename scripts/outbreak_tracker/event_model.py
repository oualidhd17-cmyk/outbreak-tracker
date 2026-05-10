from __future__ import annotations

import xml.etree.ElementTree as ET
from typing import Any

from .geo import detect_countries
from .metrics import (
    apply_known_metric_corrections,
    extract_current_metrics,
    extract_risk_level,
    normalize_metrics,
)
from .text_utils import (
    hash_text,
    normalize_space,
    parse_date,
    strip_html,
    text_contains_disease,
)


def make_event(
    *,
    source: str,
    source_id: str,
    event_type: str,
    title: str,
    summary: str,
    url: str,
    published_at: str = "",
    full_text: str = "",
    extra: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    combined = normalize_space(" ".join([title or "", summary or "", full_text or ""]))

    if not text_contains_disease(combined):
        return None

    event: dict[str, Any] = {
        "source": source,
        "source_id": source_id,
        "type": event_type,
        "title": normalize_space(title) or source,
        "summary": normalize_space(summary)[:1400],
        "url": url,
        "published_at": parse_date(published_at),
        "metrics": (
            extract_current_metrics(combined)
            if event_type == "current_outbreak"
            else {}
        ),
        "countries": detect_countries(combined),
        "risk_level": extract_risk_level(combined),
        "raw_hash": hash_text(combined),
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
    }

    if extra:
        event.update(extra)

    return apply_known_metric_corrections(event, combined)


def dedupe_events(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    deduped: list[dict[str, Any]] = []
    seen: set[str] = set()

    for event in events:
        key = str(event.get("url") or event.get("raw_hash") or event.get("title"))

        if key in seen:
            continue

        seen.add(key)

        event["metrics"] = (
            normalize_metrics(event.get("metrics") or {})
            if event.get("type") == "current_outbreak"
            else event.get("metrics", {})
        )

        deduped.append(event)

    return deduped


def parse_rss_items(xml_text: str) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []

    try:
        root = ET.fromstring(xml_text.encode("utf-8"))
    except Exception:
        return items

    for item in root.findall(".//item"):
        get = lambda name: normalize_space(item.findtext(name, default=""))

        title = get("title")
        link = get("link")
        description = strip_html(item.findtext("description", default=""))
        pub_date = get("pubDate")

        if title or link:
            items.append(
                {
                    "title": title,
                    "link": link,
                    "description": description,
                    "published_at": pub_date,
                }
            )

    if items:
        return items

    ns = {"atom": "http://www.w3.org/2005/Atom"}

    for entry in root.findall(".//atom:entry", ns):
        title = normalize_space(entry.findtext("atom:title", default="", namespaces=ns))
        summary = strip_html(entry.findtext("atom:summary", default="", namespaces=ns))
        updated = normalize_space(
            entry.findtext("atom:updated", default="", namespaces=ns)
        )

        link = ""
        link_node = entry.find("atom:link", ns)

        if link_node is not None:
            link = link_node.attrib.get("href", "")

        if title or link:
            items.append(
                {
                    "title": title,
                    "link": link,
                    "description": summary,
                    "published_at": updated,
                }
            )

    return items
