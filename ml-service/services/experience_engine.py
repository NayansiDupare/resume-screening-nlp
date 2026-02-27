import re
from datetime import datetime


def extract_years(text: str):
    text = (text or "").lower()

    # ------------------------------
    # Fresher / Entry Level Handling
    # ------------------------------
    fresher_keywords = [
        "fresher",
        "freshers",
        "no experience",
        "entry level",
        "entry-level",
        "graduate role"
    ]

    for word in fresher_keywords:
        if word in text:
            return 0

    patterns = [
        r"(\d+)\s*-\s*(\d+)\s*years?",
        r"(\d+)\s*to\s*(\d+)\s*years?",
        r"minimum\s*(\d+)\s*years?",
        r"at least\s*(\d+)\s*years?",
        r"(\d+)\+?\s*years?",
        r"(\d+)\s*yrs?"
    ]

    found = []

    for pattern in patterns:
        matches = re.findall(pattern, text)
        for m in matches:
            if isinstance(m, tuple):
                found.append(int(m[0]))  # lower bound
            else:
                found.append(int(m))

    return max(found) if found else None


MONTH_MAP = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}


def parse_date_ranges(text: str):
    text = (text or "").lower()
    current_year = datetime.now().year
    current_month = datetime.now().month

    ranges = []

    pattern = r"""
        (?:
            (?P<start_month>[a-z]{3,9})?\s*
            (?P<start_year>20\d{2})
        )
        \s*[-–]\s*
        (?:
            (?P<end_month>[a-z]{3,9})?\s*
            (?P<end_year>20\d{2}|present)
        )
    """

    matches = re.finditer(pattern, text, re.VERBOSE)

    for match in matches:
        start_year = int(match.group("start_year"))
        start_month_text = match.group("start_month")
        start_month = MONTH_MAP.get(start_month_text, 1)

        end_year_raw = match.group("end_year")
        end_month_text = match.group("end_month")

        if end_year_raw == "present":
            end_year = current_year
            end_month = current_month
        else:
            end_year = int(end_year_raw)
            end_month = MONTH_MAP.get(end_month_text, 12)

        start_index = start_year * 12 + start_month
        end_index = end_year * 12 + end_month

        if end_index >= start_index:
            ranges.append((start_index, end_index))

    return ranges


def merge_ranges(ranges):
    if not ranges:
        return []

    ranges.sort()
    merged = [ranges[0]]

    for current in ranges[1:]:
        prev_start, prev_end = merged[-1]
        curr_start, curr_end = current

        if curr_start <= prev_end:
            merged[-1] = (prev_start, max(prev_end, curr_end))
        else:
            merged.append(current)

    return merged


def calculate_timeline_experience(text: str):
    ranges = parse_date_ranges(text)
    merged = merge_ranges(ranges)

    total_months = 0

    for start, end in merged:
        total_months += (end - start)

    return round(total_months / 12, 1)


def evaluate_experience(jd_text: str, resume_text: str):

    required = extract_years(jd_text)
    candidate = extract_years(resume_text)

    # 🔥 If numeric years not found, calculate from timeline
    if candidate is None:
        candidate = calculate_timeline_experience(resume_text)

    # ------------------------------
    # Handle Missing Data Correctly
    # ------------------------------
    if required is None or candidate is None:
        return {
            "required_years": required,
            "candidate_years": candidate,
            "status": "UNKNOWN",
            "score": 0,
            "penalty": 0,
            "gap": None
        }

    gap = required - candidate

    # ------------------------------
    # Scoring Logic
    # ------------------------------
    if candidate >= required:
        return {
            "required_years": required,
            "candidate_years": candidate,
            "status": "MATCHED",
            "score": 10,
            "penalty": 0,
            "gap": 0
        }

    elif gap <= 1:
        return {
            "required_years": required,
            "candidate_years": candidate,
            "status": "SLIGHT_UNDER",
            "score": 5,
            "penalty": -3,
            "gap": gap
        }

    else:
        return {
            "required_years": required,
            "candidate_years": candidate,
            "status": "UNDER_QUALIFIED",
            "score": 2,
            "penalty": -8,
            "gap": gap
        }