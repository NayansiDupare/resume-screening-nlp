from services.experience_engine import extract_years

def detect_seniority_keyword(text: str):
    text = (text or "").lower()

    if "intern" in text:
        return "INTERN"

    if "junior" in text or "entry level" in text:
        return "JUNIOR"

    if "mid level" in text or "mid-level" in text:
        return "MID"

    if "senior" in text:
        return "SENIOR"

    if "lead" in text or "principal" in text:
        return "LEAD"

    return None


def infer_level_from_years(years):
    if years is None:
        return None

    if years >= 5:
        return "SENIOR"
    elif years >= 2:
        return "MID"
    else:
        return "JUNIOR"


def evaluate_seniority(jd_text: str, resume_text: str):

    # Try keyword detection first
    jd_level = detect_seniority_keyword(jd_text)
    candidate_level = detect_seniority_keyword(resume_text)

    # If no keyword, infer from experience
    if jd_level is None:
        required_years = extract_years(jd_text)
        jd_level = infer_level_from_years(required_years)

    if candidate_level is None:
        candidate_years = extract_years(resume_text)
        candidate_level = infer_level_from_years(candidate_years)

    if jd_level is None or candidate_level is None:
        return {
            "required_level": jd_level or "UNKNOWN",
            "candidate_level": candidate_level or "UNKNOWN",
            "status": "UNKNOWN",
            "score": 0,
            "penalty": 0
        }

    hierarchy = ["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD"]

    if jd_level == candidate_level:
        return {
            "required_level": jd_level,
            "candidate_level": candidate_level,
            "status": "MATCHED",
            "score": 8,
            "penalty": 0
        }

    if hierarchy.index(candidate_level) < hierarchy.index(jd_level):
        return {
            "required_level": jd_level,
            "candidate_level": candidate_level,
            "status": "UNDER_LEVEL",
            "score": 2,
            "penalty": -6
        }

    return {
        "required_level": jd_level,
        "candidate_level": candidate_level,
        "status": "OVER_LEVEL",
        "score": 4,
        "penalty": -2
    }