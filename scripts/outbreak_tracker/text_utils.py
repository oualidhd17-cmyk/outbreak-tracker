from __future__ import annotations

import hashlib
import html
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any

from .config import DISEASE_KEYWORDS


def hash_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8", errors="ignore")).hexdigest()


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def strip_html(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"(?is)<script[\s\S]*?</script>", " ", value)
    value = re.sub(r"(?is)<style[\s\S]*?</style>", " ", value)
    value = re.sub(r"(?is)<noscript[\s\S]*?</noscript>", " ", value)
    value = re.sub(r"(?is)<svg[\s\S]*?</svg>", " ", value)
    value = re.sub(r"<[^>]+>", " ", value)
    return normalize_space(value)


def text_contains_disease(value: str) -> bool:
    lowered = (value or "").lower()
    return any(keyword in lowered for keyword in DISEASE_KEYWORDS)


def parse_date(value: Any) -> str:
    if not value:
        return ""

    raw = str(value).strip()

    if not raw:
        return ""

    for candidate in (raw, raw.replace("Z", "+00:00")):
        try:
            return (
                datetime.fromisoformat(candidate)
                .astimezone(timezone.utc)
                .date()
                .isoformat()
            )
        except Exception:
            pass

    try:
        return parsedate_to_datetime(raw).astimezone(timezone.utc).date().isoformat()
    except Exception:
        pass

    match = re.search(r"(\d{4})[-/](\d{1,2})[-/](\d{1,2})", raw)

    if match:
        year, month, day = match.groups()
        return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"

    return raw[:10]


def extract_links(base_url: str, html_text: str) -> list[str]:
    from urllib.parse import urljoin

    links: list[str] = []

    for match in re.finditer(r"""href=["']([^"']+)["']""", html_text or "", flags=re.I):
        href = html.unescape(match.group(1).strip())

        if (
            not href
            or href.startswith("#")
            or href.startswith("mailto:")
            or href.startswith("tel:")
        ):
            continue

        absolute = urljoin(base_url, href)

        if absolute not in links:
            links.append(absolute)

    return links
