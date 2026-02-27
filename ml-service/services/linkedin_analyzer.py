import re

def extract_linkedin_username(url: str):
    try:
        if "linkedin.com/in/" not in url:
            return None
        return url.rstrip("/").split("linkedin.com/in/")[1].split("/")[0]
    except:
        return None


def analyze_linkedin_profile(linkedin_url: str, job_text: str):
    username = extract_linkedin_username(linkedin_url)

    if not username:
        return {"linkedin_score": 0}

    score = 0

    # Basic credibility bonus
    score += 3

    # Match username or slug with job keywords
    job_keywords = job_text.lower().split()
    username_lower = username.lower()

    matches = sum(1 for word in job_keywords if word in username_lower)

    score += min(matches, 3)

    return {
        "linkedin_score": score,
        "profile_slug": username
    }
