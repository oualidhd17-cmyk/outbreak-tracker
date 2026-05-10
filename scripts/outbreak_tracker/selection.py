from __future__ import annotations

from typing import Any

from .config import DISEASE_NAME, OFFICIAL_CURRENT_OUTBREAK_FALLBACK
from .metrics import (
    metrics_look_too_large_for_current_hantavirus,
    normalize_metrics,
)
from .text_utils import parse_date


def event_metric_score(event: dict[str, Any]) -> int:
    metrics = normalize_metrics(event.get("metrics") or {})
    positive_keys = [
        "total_identified_cases",
        "confirmed_cases",
        "suspected_cases",
        "probable_cases",
        "possible_cases",
        "under_investigation_cases",
        "pending_cases",
        "deaths",
    ]

    return sum(1 for key in positive_keys if metrics.get(key, 0) > 0)


def event_has_usable_current_metrics(event: dict[str, Any]) -> bool:
    if event.get("type") != "current_outbreak":
        return False

    quality = event.get("data_quality") or {}

    if quality.get("historical_like") is True:
        return False

    metrics = normalize_metrics(event.get("metrics") or {})

    has_any_metric = any(
        metrics.get(key, 0) > 0
        for key in [
            "total_identified_cases",
            "confirmed_cases",
            "suspected_cases",
            "probable_cases",
            "possible_cases",
            "under_investigation_cases",
            "pending_cases",
            "deaths",
        ]
    )

    if not has_any_metric:
        return False

    if metrics_look_too_large_for_current_hantavirus(metrics):
        return False

    return True


def choose_primary_current_event(events: list[dict[str, Any]]) -> dict[str, Any] | None:
    current_events = [
        event
        for event in events
        if event.get("type") == "current_outbreak"
        and event_has_usable_current_metrics(event)
    ]

    if not current_events:
        return None

    source_weight = {
        "who": 100,
        "ecdc": 95,
        "cdc": 90,
        "africa_cdc": 88,
        "reliefweb": 75,
    }

    def date_to_score(value: Any) -> int:
        parsed = parse_date(value)

        try:
            return int(parsed.replace("-", ""))
        except Exception:
            return 0

    def metric_completeness_score(metrics: dict[str, int]) -> int:
        score = 0

        confirmed = int(metrics.get("confirmed_cases") or 0)
        suspected = int(metrics.get("suspected_cases") or 0)
        probable = int(metrics.get("probable_cases") or 0)
        possible = int(metrics.get("possible_cases") or 0)
        investigation = int(metrics.get("under_investigation_cases") or 0)
        pending = int(metrics.get("pending_cases") or 0)
        total = int(metrics.get("total_identified_cases") or 0)
        deaths = int(metrics.get("deaths") or 0)

        if confirmed > 0:
            score += 10

        if suspected > 0:
            score += 10

        if total > 0:
            score += 8

        if deaths > 0:
            score += 6

        if probable > 0:
            score += 3

        if possible > 0:
            score += 3

        if investigation > 0:
            score += 3

        if pending > 0:
            score += 3

        calculated_total = (
            confirmed + suspected + probable + possible + investigation + pending
        )

        if total > 0 and calculated_total > 0 and total == calculated_total:
            score += 8

        if confirmed > 0 and suspected > 0 and total > 0 and deaths > 0:
            score += 12

        return score

    def score(event: dict[str, Any]) -> tuple[int, int, int, int, int]:
        metrics = normalize_metrics(event.get("metrics") or {})

        not_fallback = (
            0 if event.get("raw_hash") == "who-official-hantavirus-fallback" else 1
        )

        completeness = metric_completeness_score(metrics)
        date_score = date_to_score(event.get("published_at"))
        source_score = source_weight.get(str(event.get("source_id")), 10)

        return (
            not_fallback,
            completeness,
            date_score,
            source_score,
            event_metric_score(event),
        )

    return sorted(current_events, key=score, reverse=True)[0]


def ensure_current_outbreak_fallback(
    events: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    current_events = [
        event for event in events if event.get("type") == "current_outbreak"
    ]

    if not current_events:
        return [OFFICIAL_CURRENT_OUTBREAK_FALLBACK]

    usable_events = [
        event for event in current_events if event_has_usable_current_metrics(event)
    ]

    if not usable_events:
        cleaned_events = [
            event for event in events if event.get("type") != "current_outbreak"
        ]
        return cleaned_events + [OFFICIAL_CURRENT_OUTBREAK_FALLBACK]

    return events


def merge_current_metrics(primary_event: dict[str, Any] | None) -> dict[str, Any]:
    if primary_event is None:
        empty_metrics = normalize_metrics({})

        return {
            "event_name": f"No current {DISEASE_NAME} outbreak event detected",
            **empty_metrics,
            "risk_level": "unknown",
            "source": None,
            "source_id": None,
            "source_url": None,
            "published_at": None,
        }

    metrics = normalize_metrics(primary_event.get("metrics") or {})

    return {
        "event_name": primary_event.get("title")
        or f"Current {DISEASE_NAME} outbreak event",
        **metrics,
        "risk_level": primary_event.get("risk_level") or "unknown",
        "source": primary_event.get("source"),
        "source_id": primary_event.get("source_id"),
        "source_url": primary_event.get("url"),
        "published_at": primary_event.get("published_at"),
    }
