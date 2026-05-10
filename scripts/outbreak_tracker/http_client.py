from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx

from .config import HTTP_TIMEOUT


@dataclass(slots=True)
class FetchResult:
    ok: bool
    source_id: str
    url: str
    status_code: int | None = None
    error: str | None = None


FETCH_LOG: list[FetchResult] = []


def http_client() -> httpx.Client:
    return httpx.Client(
        timeout=httpx.Timeout(HTTP_TIMEOUT, connect=min(20.0, HTTP_TIMEOUT)),
        follow_redirects=True,
        headers={
            "User-Agent": (
                "OutbreakTracker/5.0 "
                "(+https://hantamap.online; public health dashboard)"
            ),
            "Accept": (
                "text/html,application/xhtml+xml,application/xml,"
                "application/json;q=0.9,*/*;q=0.8"
            ),
        },
    )


def fetch_text(client: httpx.Client, url: str, source_id: str) -> str:
    try:
        response = client.get(url)
        FETCH_LOG.append(
            FetchResult(True, source_id, str(response.url), response.status_code)
        )
        response.raise_for_status()
        return response.text
    except Exception as exc:
        status = (
            exc.response.status_code
            if isinstance(exc, httpx.HTTPStatusError) and exc.response
            else None
        )
        FETCH_LOG.append(FetchResult(False, source_id, url, status, str(exc)))
        raise


def fetch_json(
    client: httpx.Client,
    url: str,
    source_id: str,
    params: dict[str, Any] | None = None,
) -> Any:
    try:
        response = client.get(url, params=params)
        FETCH_LOG.append(
            FetchResult(True, source_id, str(response.url), response.status_code)
        )
        response.raise_for_status()
        return response.json()
    except Exception as exc:
        status = (
            exc.response.status_code
            if isinstance(exc, httpx.HTTPStatusError) and exc.response
            else None
        )
        FETCH_LOG.append(FetchResult(False, source_id, url, status, str(exc)))
        raise
