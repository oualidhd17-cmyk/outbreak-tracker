from __future__ import annotations

import re
from functools import lru_cache
from typing import Any

STATIC_SPECIAL_LOCATIONS: dict[str, dict[str, Any]] = {
    "Cruise ship travel": {
        "country": "Cruise ship travel",
        "region": "Atlantic Ocean / travel-related signal",
        "lat": 23.5,
        "lng": -31.0,
        "is_country": False,
    },
    "Multi-country": {
        "country": "Multi-country",
        "region": "Multi-country / travel-related signal",
        "lat": 20.0,
        "lng": -20.0,
        "is_country": False,
    },
}

COUNTRY_ALIASES: dict[str, str] = {
    "United States of America": "United States",
    "USA": "United States",
    "U.S.": "United States",
    "US": "United States",
    "UK": "United Kingdom",
    "Great Britain": "United Kingdom",
    "Britain": "United Kingdom",
    "England": "United Kingdom",
    "DR Congo": "Democratic Republic of the Congo",
    "DRC": "Democratic Republic of the Congo",
    "Congo-Kinshasa": "Democratic Republic of the Congo",
    "Congo Brazzaville": "Congo",
    "Russia": "Russian Federation",
    "South Korea": "Korea, Republic of",
    "North Korea": "Korea, Democratic People's Republic of",
    "Iran": "Iran, Islamic Republic of",
    "Syria": "Syrian Arab Republic",
    "Vietnam": "Viet Nam",
    "Venezuela": "Venezuela, Bolivarian Republic of",
    "Bolivia": "Bolivia, Plurinational State of",
    "Tanzania": "Tanzania, United Republic of",
    "Moldova": "Moldova, Republic of",
    "Laos": "Lao People's Democratic Republic",
}

MANUAL_COUNTRY_COORDS: dict[str, dict[str, Any]] = {
    "United States": {
        "country": "United States",
        "region": "North America",
        "lat": 37.0902,
        "lng": -95.7129,
        "is_country": True,
    },
    "Canada": {
        "country": "Canada",
        "region": "North America",
        "lat": 56.1304,
        "lng": -106.3468,
        "is_country": True,
    },
    "Mexico": {
        "country": "Mexico",
        "region": "North America",
        "lat": 23.6345,
        "lng": -102.5528,
        "is_country": True,
    },
    "Brazil": {
        "country": "Brazil",
        "region": "South America",
        "lat": -14.235,
        "lng": -51.9253,
        "is_country": True,
    },
    "Argentina": {
        "country": "Argentina",
        "region": "South America",
        "lat": -38.4161,
        "lng": -63.6167,
        "is_country": True,
    },
    "Chile": {
        "country": "Chile",
        "region": "South America",
        "lat": -35.6751,
        "lng": -71.543,
        "is_country": True,
    },
    "Panama": {
        "country": "Panama",
        "region": "Central America",
        "lat": 8.538,
        "lng": -80.7821,
        "is_country": True,
    },
    "Germany": {
        "country": "Germany",
        "region": "Europe",
        "lat": 51.1657,
        "lng": 10.4515,
        "is_country": True,
    },
    "France": {
        "country": "France",
        "region": "Europe",
        "lat": 46.2276,
        "lng": 2.2137,
        "is_country": True,
    },
    "United Kingdom": {
        "country": "United Kingdom",
        "region": "Europe",
        "lat": 55.3781,
        "lng": -3.436,
        "is_country": True,
    },
    "Spain": {
        "country": "Spain",
        "region": "Europe",
        "lat": 40.4637,
        "lng": -3.7492,
        "is_country": True,
    },
    "Italy": {
        "country": "Italy",
        "region": "Europe",
        "lat": 41.8719,
        "lng": 12.5674,
        "is_country": True,
    },
    "Netherlands": {
        "country": "Netherlands",
        "region": "Europe",
        "lat": 52.1326,
        "lng": 5.2913,
        "is_country": True,
    },
    "Portugal": {
        "country": "Portugal",
        "region": "Europe",
        "lat": 39.3999,
        "lng": -8.2245,
        "is_country": True,
    },
    "Sweden": {
        "country": "Sweden",
        "region": "Europe",
        "lat": 60.1282,
        "lng": 18.6435,
        "is_country": True,
    },
    "Norway": {
        "country": "Norway",
        "region": "Europe",
        "lat": 60.472,
        "lng": 8.4689,
        "is_country": True,
    },
    "Finland": {
        "country": "Finland",
        "region": "Europe",
        "lat": 61.9241,
        "lng": 25.7482,
        "is_country": True,
    },
    "Uganda": {
        "country": "Uganda",
        "region": "Africa",
        "lat": 1.3733,
        "lng": 32.2903,
        "is_country": True,
    },
    "Democratic Republic of the Congo": {
        "country": "Democratic Republic of the Congo",
        "region": "Africa",
        "lat": -4.0383,
        "lng": 21.7587,
        "is_country": True,
    },
    "Congo": {
        "country": "Congo",
        "region": "Africa",
        "lat": -0.228,
        "lng": 15.8277,
        "is_country": True,
    },
}


def infer_region(lat: float, lng: float) -> str:
    if lat >= 0 and -170 <= lng <= -30:
        return "North America"

    if lat < 15 and -90 <= lng <= -30:
        return "South America"

    if -35 <= lat <= 38 and -20 <= lng <= 55:
        return "Africa"

    if 35 <= lat <= 72 and -25 <= lng <= 45:
        return "Europe"

    if -50 <= lat <= 10 and 110 <= lng <= 180:
        return "Oceania"

    if -15 <= lat <= 55 and 25 <= lng <= 150:
        return "Asia"

    return "Global"


def normalize_country_payload(
    name_hint: str,
    data: dict[str, Any],
) -> dict[str, Any] | None:
    latlng = (
        data.get("latlng")
        or data.get("latLng")
        or data.get("lat_lng")
        or data.get("coordinates")
        or []
    )

    if not isinstance(latlng, list) or len(latlng) < 2:
        return None

    try:
        lat = float(latlng[0])
        lng = float(latlng[1])
    except Exception:
        return None

    common_name = str(
        data.get("name")
        or data.get("nativeName")
        or data.get("officialName")
        or name_hint
        or ""
    ).strip()

    if not common_name:
        return None

    return {
        "country": common_name,
        "region": infer_region(lat, lng),
        "lat": lat,
        "lng": lng,
        "is_country": True,
        "alpha2": data.get("alpha2Code") or data.get("alpha2"),
        "alpha3": data.get("alpha3Code") or data.get("alpha3"),
    }


@lru_cache(maxsize=1)
def load_countryinfo_countries() -> dict[str, dict[str, Any]]:
    """
    تحميل كل الدول من countryinfo.

    في نسختك:
    all_countries() يرجع list[CountryInfo object]
    لذلك نقرأ كل object عبر .info().
    """
    countries: dict[str, dict[str, Any]] = {}

    try:
        from countryinfo import CountryInfo, all_countries

        raw = all_countries()

        if isinstance(raw, dict):
            iterable = list(raw.values())
        elif isinstance(raw, list):
            iterable = raw
        else:
            iterable = []

        for item in iterable:
            info: dict[str, Any] | None = None
            name_hint = ""

            if isinstance(item, dict):
                info = item
                name_hint = str(
                    item.get("name")
                    or item.get("country")
                    or item.get("nativeName")
                    or ""
                ).strip()

            elif isinstance(item, str):
                name_hint = item.strip()

                try:
                    maybe_info = CountryInfo(name_hint).info()
                    if isinstance(maybe_info, dict):
                        info = maybe_info
                except Exception:
                    continue

            else:
                # هنا الحالة الموجودة عندك:
                # item = countryinfo.countryinfo.CountryInfo object
                try:
                    maybe_info = item.info()

                    if isinstance(maybe_info, dict):
                        info = maybe_info
                        name_hint = str(
                            maybe_info.get("name") or maybe_info.get("nativeName") or ""
                        ).strip()
                except Exception:
                    continue

            if not isinstance(info, dict):
                continue

            payload = normalize_country_payload(name_hint, info)

            if payload is None:
                continue

            countries[payload["country"]] = payload

    except Exception as exc:
        print(f"[Geo] countryinfo load failed: {exc}")

    # ندمج اليدوي فوق المكتبة لضبط الدول المهمة.
    countries.update(MANUAL_COUNTRY_COORDS)

    for alias, canonical in COUNTRY_ALIASES.items():
        if canonical in countries:
            countries[alias] = {
                **countries[canonical],
                "country": countries[canonical]["country"],
                "alias": alias,
            }

    return countries


@lru_cache(maxsize=1)
def get_location_registry() -> dict[str, dict[str, Any]]:
    countries = load_countryinfo_countries()

    return {
        **STATIC_SPECIAL_LOCATIONS,
        **countries,
    }


def list_all_countries() -> list[dict[str, Any]]:
    registry = get_location_registry()

    countries = [
        value
        for value in registry.values()
        if value.get("is_country") is True and value.get("country")
    ]

    deduped: dict[str, dict[str, Any]] = {}

    for item in countries:
        deduped[item["country"]] = item

    return sorted(deduped.values(), key=lambda item: item["country"])


def detect_countries(text: str) -> list[dict[str, Any]]:
    registry = get_location_registry()
    lowered = (text or "").lower()

    found: list[dict[str, Any]] = []

    is_cruise_related = (
        "cruise ship" in lowered
        or "cruise-ship" in lowered
        or "mv hondius" in lowered
        or "hondius" in lowered
    )

    is_multi_country = (
        "multi-country" in lowered
        or "multicountry" in lowered
        or "multi country" in lowered
    )

    # إضافة الإشارات العامة بدون الخروج من الدالة
    if is_cruise_related:
        found.append(registry["Cruise ship travel"])

    if is_multi_country:
        found.append(registry["Multi-country"])

    # البحث عن الدول الحقيقية وإضافتها
    for country_name, data in registry.items():
        if data.get("is_country") is not True:
            continue

        pattern = r"\b" + re.escape(country_name.lower()) + r"\b"

        if re.search(pattern, lowered):
            canonical_country = data["country"]

            if not any(item["country"] == canonical_country for item in found):
                found.append(data)

    return found
