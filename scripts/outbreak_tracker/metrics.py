from __future__ import annotations

import re
from typing import Any

from .config import (
    CURRENT_SIGNAL_TERMS,
    HISTORICAL_CONTEXT_TERMS,
    MAX_CURRENT_CONFIRMED,
    MAX_CURRENT_DEATHS,
    MAX_CURRENT_TOTAL,
    METRIC_KEYS,
    OFFICIAL_CURRENT_OUTBREAK_FALLBACK,
)
from .text_utils import normalize_space

NUMBER_WORDS: dict[str, int] = {
    "zero": 0,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "eleven": 11,
    "twelve": 12,
    "thirteen": 13,
    "fourteen": 14,
    "fifteen": 15,
    "sixteen": 16,
    "seventeen": 17,
    "eighteen": 18,
    "nineteen": 19,
    "twenty": 20,
    "thirty": 30,
    "forty": 40,
    "fifty": 50,
    "sixty": 60,
    "seventy": 70,
    "eighty": 80,
    "ninety": 90,
    "hundred": 100,
}


def text_has_historical_context(text: str) -> bool:
    lowered = (text or "").lower()
    return any(term in lowered for term in HISTORICAL_CONTEXT_TERMS)


def text_has_current_signal_context(text: str) -> bool:
    lowered = (text or "").lower()
    return any(term in lowered for term in CURRENT_SIGNAL_TERMS)


def is_known_cruise_hantavirus_event(text: str) -> bool:
    lowered = (text or "").lower()
    return "hantavirus" in lowered and (
        "cruise ship" in lowered
        or "cruise-ship" in lowered
        or "cruise" in lowered
        or "mv hondius" in lowered
        or "hondius" in lowered
    )


def parse_number_token(value: str | None) -> int | None:
    if not value:
        return None

    cleaned = value.strip().lower().replace(",", "")
    cleaned = re.sub(r"[^a-z0-9 -]", "", cleaned)

    if cleaned.isdigit():
        return int(cleaned)

    if cleaned in NUMBER_WORDS:
        return NUMBER_WORDS[cleaned]

    if "-" in cleaned or " " in cleaned:
        total = 0
        parts = re.split(r"[-\s]+", cleaned)

        for part in parts:
            if part in NUMBER_WORDS:
                total += NUMBER_WORDS[part]
            elif part.isdigit():
                total += int(part)
            else:
                return None

        return total if total > 0 else None

    return None


def number_regex() -> str:
    words = sorted(NUMBER_WORDS.keys(), key=len, reverse=True)

    return (
        r"(\d{1,3}(?:,\d{3})*|\d+|" + "|".join(re.escape(word) for word in words) + r")"
    )


def first_number_from_match(match: re.Match[str]) -> int | None:
    for group in match.groups():
        number = parse_number_token(group)

        if number is not None:
            return number

    return None


def extract_by_patterns(text: str, patterns: list[str]) -> int | None:
    normalized = (text or "").lower()

    for pattern in patterns:
        match = re.search(pattern, normalized, flags=re.I)

        if match:
            value = first_number_from_match(match)

            if value is not None:
                return value

    return None


def extract_status_metric(
    text: str,
    labels: list[str],
    after_labels: list[str] | None = None,
) -> int | None:
    n = number_regex()
    label_group = "|".join(re.escape(label) for label in labels)
    after_group = "|".join(re.escape(label) for label in (after_labels or labels))

    return extract_by_patterns(
        text,
        [
            rf"{n}\s+(?:laboratory[-\s]?)?(?:{label_group})\s+(?:human\s+)?(?:cases?|patients?|persons?|people|individuals)",
            rf"{n}\s+(?:were\s+|are\s+|remain\s+)?(?:{label_group})",
            rf"(?:{after_group})\s+(?:human\s+)?(?:cases?|patients?|persons?|people|individuals)?(?:\D{{0,90}}){n}",
            rf"(?:including|with)\s+{n}\s+(?:{label_group})",
            rf"(?:of\s+which\s+)?{n}\s+(?:were\s+)?(?:{label_group})",
        ],
    )


def normalize_metrics(metrics: dict[str, int | None]) -> dict[str, int]:
    normalized: dict[str, int] = {}

    for key in METRIC_KEYS:
        value = metrics.get(key)
        normalized[key] = int(value) if isinstance(value, int) and value >= 0 else 0

    unconfirmed = (
        normalized["suspected_cases"]
        + normalized["probable_cases"]
        + normalized["possible_cases"]
        + normalized["under_investigation_cases"]
        + normalized["pending_cases"]
    )

    if normalized["unconfirmed_cases"] <= 0:
        normalized["unconfirmed_cases"] = unconfirmed

    if normalized["total_identified_cases"] <= 0:
        normalized["total_identified_cases"] = (
            normalized["confirmed_cases"] + normalized["unconfirmed_cases"]
        )

    return normalized


def fallback_metrics() -> dict[str, int]:
    return normalize_metrics(OFFICIAL_CURRENT_OUTBREAK_FALLBACK["metrics"])


def metrics_look_too_large_for_current_hantavirus(metrics: dict[str, int]) -> bool:
    total = int(metrics.get("total_identified_cases") or 0)
    confirmed = int(metrics.get("confirmed_cases") or 0)
    deaths = int(metrics.get("deaths") or 0)

    return (
        total > MAX_CURRENT_TOTAL
        or confirmed > MAX_CURRENT_CONFIRMED
        or deaths > MAX_CURRENT_DEATHS
    )


def extract_current_metrics(text: str) -> dict[str, int]:
    normalized_text = normalize_space(text).lower()
    n = number_regex()

    total_identified = extract_by_patterns(
        normalized_text,
        [
            rf"total\s+(?:of\s+)?{n}\s+(?:human\s+)?(?:cases?|patients?|persons?|people|individuals)",
            rf"{n}\s+(?:human\s+)?cases\s+(?:were\s+|have\s+been\s+)?(?:reported|identified|detected|linked|recorded)",
            rf"{n}\s+(?:people|persons|individuals|patients)\s+(?:were\s+|have\s+been\s+)?(?:reported|identified|detected|affected|linked)",
            rf"cluster\s+of\s+{n}\s+(?:human\s+)?cases",
        ],
    )

    metrics: dict[str, int | None] = {
        "confirmed_cases": extract_status_metric(
            normalized_text,
            ["confirmed", "laboratory-confirmed", "laboratory confirmed"],
        ),
        "suspected_cases": extract_status_metric(
            normalized_text,
            ["suspected", "suspect"],
        ),
        "probable_cases": extract_status_metric(normalized_text, ["probable"]),
        "possible_cases": extract_status_metric(normalized_text, ["possible"]),
        "under_investigation_cases": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:cases?|patients?|persons?|people|individuals)\s+(?:are\s+|were\s+)?(?:under\s+investigation|being\s+investigated|undergoing\s+investigation)",
                rf"{n}\s+(?:under\s+investigation|being\s+investigated|pending\s+investigation)",
                rf"(?:under\s+investigation|being\s+investigated|pending\s+investigation)(?:\D{{0,90}}){n}",
            ],
        ),
        "pending_cases": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:pending|awaiting)\s+(?:confirmation|testing|laboratory\s+confirmation|results)",
                rf"(?:pending|awaiting)\s+(?:confirmation|testing|laboratory\s+confirmation|results)(?:\D{{0,90}}){n}",
            ],
        ),
        "ruled_out_cases": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:cases?|patients?|persons?|people|individuals)\s+(?:were\s+|are\s+)?(?:ruled\s+out|discarded|excluded)",
                rf"{n}\s+(?:ruled\s+out|discarded|excluded)",
                rf"(?:ruled\s+out|discarded|excluded)(?:\D{{0,90}}){n}",
            ],
        ),
        "negative_cases": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:tested\s+)?negative",
                rf"negative\s+(?:test\s+)?(?:results|cases)?(?:\D{{0,90}}){n}",
            ],
        ),
        "deaths": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:deaths|fatalities)",
                rf"(?:deaths|fatalities)(?:\D{{0,90}}){n}",
                rf"{n}\s+(?:people|persons|individuals|patients)\s+(?:died|have\s+died|were\s+fatal)",
                rf"including\s+{n}\s+(?:deaths|fatalities)",
            ],
        ),
        "hospitalized": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:hospitalized|hospitalised|admitted\s+to\s+hospital)",
                rf"(?:hospitalized|hospitalised|admitted\s+to\s+hospital)(?:\D{{0,90}}){n}",
            ],
        ),
        "recovered": extract_by_patterns(
            normalized_text,
            [
                rf"{n}\s+(?:recovered|recoveries)",
                rf"(?:recovered|recoveries)(?:\D{{0,90}}){n}",
            ],
        ),
        "total_identified_cases": total_identified,
        "unconfirmed_cases": None,
    }

    confirmed = metrics.get("confirmed_cases") or 0
    suspected = metrics.get("suspected_cases") or 0
    probable = metrics.get("probable_cases") or 0
    possible = metrics.get("possible_cases") or 0
    investigating = metrics.get("under_investigation_cases") or 0
    pending = metrics.get("pending_cases") or 0

    explicit_unconfirmed = extract_by_patterns(
        normalized_text,
        [
            rf"{n}\s+(?:unconfirmed|not\s+confirmed)\s+(?:human\s+)?(?:cases?|patients?|persons?|people|individuals)",
            rf"(?:unconfirmed|not\s+confirmed)\s+(?:human\s+)?(?:cases?|patients?|persons?|people|individuals)?(?:\D{{0,90}}){n}",
        ],
    )

    if explicit_unconfirmed is not None:
        metrics["unconfirmed_cases"] = explicit_unconfirmed

    if metrics.get("total_identified_cases") is None and (
        confirmed or suspected or probable or possible or investigating or pending
    ):
        metrics["total_identified_cases"] = (
            confirmed + suspected + probable + possible + investigating + pending
        )

    return normalize_metrics(metrics)


def sanitize_current_event_metrics(
    event: dict[str, Any],
    full_text: str,
) -> dict[str, Any]:
    if event.get("type") != "current_outbreak":
        return event

    metrics = normalize_metrics(event.get("metrics") or {})
    lowered = (full_text or "").lower()

    is_cruise_event = is_known_cruise_hantavirus_event(lowered)
    has_historical_context = text_has_historical_context(lowered)
    has_current_context = text_has_current_signal_context(lowered)
    too_large = metrics_look_too_large_for_current_hantavirus(metrics)

    if is_cruise_event and too_large:
        event["metrics"] = fallback_metrics()
        event["risk_level"] = "low"
        event["data_correction"] = {
            "applied": True,
            "reason": (
                "Extracted metrics looked too large for the current hantavirus cruise event; "
                "safe official fallback metrics were used instead."
            ),
            "original_metrics": metrics,
        }
        event["data_quality"] = {
            "usable_current_metrics": True,
            "corrected_large_current_metrics": True,
            "historical_like": False,
        }
        return event

    if has_historical_context and too_large:
        event["metrics"] = normalize_metrics({})
        event["data_correction"] = {
            "applied": True,
            "reason": (
                "Historical or cumulative surveillance numbers were removed "
                "from current outbreak metrics."
            ),
            "original_metrics": metrics,
        }
        event["data_quality"] = {
            "usable_current_metrics": False,
            "historical_like": True,
        }
        return event

    if too_large and not has_current_context:
        event["metrics"] = normalize_metrics({})
        event["data_correction"] = {
            "applied": True,
            "reason": "Large numbers without current outbreak context were removed.",
            "original_metrics": metrics,
        }
        event["data_quality"] = {
            "usable_current_metrics": False,
            "historical_like": True,
        }
        return event

    event["metrics"] = metrics
    event["data_quality"] = {
        "usable_current_metrics": any(
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
        ),
        "historical_like": False,
    }

    return event


def apply_known_metric_corrections(
    event: dict[str, Any],
    full_text: str,
) -> dict[str, Any]:
    metrics = normalize_metrics(event.get("metrics") or {})
    text = full_text.lower()

    is_cruise_event = "hantavirus" in text and (
        "cruise" in text
        or "cruise ship" in text
        or "cruise-ship" in text
        or "mv hondius" in text
        or "hondius" in text
    )

    if is_cruise_event:
        correction_notes: list[str] = []

        if metrics["suspected_cases"] >= 100:
            metrics["suspected_cases"] = 0
            correction_notes.append(
                "Ignored suspected_cases >= 100 as likely passenger/crew count."
            )

        if metrics["under_investigation_cases"] >= 100:
            metrics["under_investigation_cases"] = 0
            correction_notes.append(
                "Ignored under_investigation_cases >= 100 as likely passenger/crew count."
            )

        if metrics["pending_cases"] >= 100:
            metrics["pending_cases"] = 0
            correction_notes.append(
                "Ignored pending_cases >= 100 as likely passenger/crew count."
            )

        calculated_total = (
            metrics["confirmed_cases"]
            + metrics["suspected_cases"]
            + metrics["probable_cases"]
            + metrics["possible_cases"]
            + metrics["under_investigation_cases"]
            + metrics["pending_cases"]
        )

        if metrics["total_identified_cases"] >= 100:
            metrics["total_identified_cases"] = calculated_total
            correction_notes.append(
                "Ignored total_identified_cases >= 100 as likely passenger/crew count."
            )

        metrics = normalize_metrics(metrics)

        if correction_notes:
            event["data_correction"] = {
                "applied": True,
                "reason": (
                    "Cruise passenger/crew population numbers were ignored "
                    "when they looked like non-case counts."
                ),
                "notes": correction_notes,
            }

    event["metrics"] = normalize_metrics(metrics)
    return sanitize_current_event_metrics(event, full_text)


def extract_historical_cumulative_cases(text: str) -> int | None:
    patterns = [
        r"(\d{1,3}(?:,\d{3})*|\d+)\s+cases\s+of\s+hantavirus\s+disease\s+were\s+reported",
        r"since\s+1993(?:\D{0,100})(\d{1,3}(?:,\d{3})*|\d+)\s+cases",
        r"reported\s+(\d{1,3}(?:,\d{3})*|\d+)\s+cases\s+of\s+hantavirus",
    ]

    lowered = (text or "").lower()

    for pattern in patterns:
        match = re.search(pattern, lowered, flags=re.I)

        if match:
            return int(match.group(1).replace(",", ""))

    return None


def extract_risk_level(text: str) -> str:
    lowered = (text or "").lower()

    if "very low" in lowered or ("risk" in lowered and "low" in lowered):
        return "low"

    if "moderate" in lowered:
        return "moderate"

    if "high" in lowered:
        return "high"

    if "critical" in lowered or "very high" in lowered:
        return "critical"

    metrics = extract_current_metrics(lowered)
    deaths = metrics.get("deaths", 0)
    total = metrics.get("total_identified_cases", 0)

    if total >= 1000 or deaths >= 50:
        return "critical"

    if total >= 100 or deaths >= 10:
        return "high"

    if total >= 10 or deaths >= 1:
        return "moderate"

    return "unknown"
