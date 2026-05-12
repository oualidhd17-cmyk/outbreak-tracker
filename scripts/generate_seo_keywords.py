from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "public" / "data"
OUTPUT_FILE = DATA_DIR / "seo-keywords.json"

BASE_KEYWORDS = [
    "Hantavirus map reddit",
    "Hantavirus map live",
    "Hantavirus map 2026",
    "Hantavirus map tracker",
    "Hantavirus map riskradar",
    "Hantavirus map 2026 live",
    "Hantavirus map app",
    "Hantavirus map website",
    "Hantavirus Reddit",
    "Hantavirus symptoms",
    "Hantavirus transmission",
    "Hantavirus treatment",
    "Hantavirus map",
    "Hantavirus origin",
    "Hantavirus wiki",
    "Hantavirus countries",
    "Hantavirus map live feed",
    "Hantavirus map live global",
    "Hantavirus tracker map",
    "Hantavirus map live tracker",
    "Hanta virus map live",
    "ANDV Hantavirus 2026",
    "ANDV Hantavirus map",
    "ANDV Hantavirus tracker",
    "Andes virus map",
    "Andes virus outbreak tracker",
    "Hantavirus outbreak map",
    "Hantavirus outbreak tracker",
    "Live Hantavirus outbreak tracker",
    "Hantavirus cases by country",
    "Hantavirus deaths by country",
    "Hantavirus suspected cases",
    "Hantavirus confirmed cases",
    "Hantavirus live dashboard",
    "Hantavirus global map",
    "Hantavirus world map",
    "Hantavirus Europe map",
    "Hantavirus cruise ship outbreak",
    "Hantavirus cruise ship map",
    "Hantavirus latest update",
    "Hantavirus latest news",
    "Hantavirus public health map",
    "Hantavirus official data",
    "Hantavirus WHO update",
    "Hantavirus CDC update",
    "Hantavirus ECDC update",
    "Hantavirus Africa CDC update",
]

COUNTRY_KEYWORDS = [
    "United States",
    "Canada",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "United Kingdom",
    "Argentina",
    "Chile",
    "Brazil",
    "Panama",
    "Mexico",
    "Sweden",
    "Norway",
    "Finland",
    "Netherlands",
    "Portugal",
    "Multi-country",
]

INTENT_MODIFIERS = [
    "live map",
    "map live",
    "tracker",
    "outbreak tracker",
    "cases",
    "symptoms",
    "transmission",
    "treatment",
    "deaths",
    "risk map",
    "country update",
    "official update",
    "2026 live",
    "2026 tracker",
]


def normalize_keyword(value: str) -> str:
    return " ".join(value.strip().split())


def unique_keywords(items: list[str]) -> list[str]:
    seen = set()
    output = []

    for item in items:
        keyword = normalize_keyword(item)
        key = keyword.lower()

        if not keyword or key in seen:
            continue

        seen.add(key)
        output.append(keyword)

    return output


def build_keywords() -> dict[str, object]:
    generated: list[str] = []

    for country in COUNTRY_KEYWORDS:
        generated.extend(
            [
                f"Hantavirus {country}",
                f"Hantavirus map {country}",
                f"Hantavirus live map {country}",
                f"Hantavirus cases {country}",
                f"Hantavirus outbreak {country}",
                f"Hantavirus tracker {country}",
                f"Hantavirus 2026 {country}",
            ]
        )

    for modifier in INTENT_MODIFIERS:
        generated.extend(
            [
                f"Hantavirus {modifier}",
                f"Hanta virus {modifier}",
                f"ANDV Hantavirus {modifier}",
                f"Andes virus {modifier}",
            ]
        )

    all_keywords = unique_keywords(BASE_KEYWORDS + generated)

    return {
        "primary": [
            "Hantavirus map live",
            "Hantavirus map 2026",
            "Hantavirus outbreak tracker",
            "ANDV Hantavirus 2026",
            "Hantavirus tracker map",
        ],
        "keywords": all_keywords,
        "keyword_count": len(all_keywords),
        "seo_title": "Hantavirus Map Live 2026 | ANDV Hantavirus Outbreak Tracker",
        "seo_description": (
            "Track the live Hantavirus map, ANDV Hantavirus 2026 outbreak updates, "
            "confirmed cases, suspected cases, deaths, transmission, symptoms, and official public-health sources."
        ),
    }


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    payload = build_keywords()

    OUTPUT_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"SEO keywords generated: {payload['keyword_count']}")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
