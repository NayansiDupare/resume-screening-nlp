import requests
from bs4 import BeautifulSoup

def analyze_portfolio(portfolio_url: str, job_text: str):
    try:
        response = requests.get(portfolio_url, timeout=5)

        if response.status_code != 200:
            return {"portfolio_score": 0}

        soup = BeautifulSoup(response.text, "html.parser")

        text = soup.get_text().lower()
        job_text = job_text.lower()

        score = 0

        # Project presence
        if "project" in text:
            score += 3

        # Contact presence
        if "contact" in text or "email" in text:
            score += 2

        # Match with job keywords
        job_keywords = job_text.split()
        matches = sum(1 for word in job_keywords if word in text)

        score += min(matches, 5)

        return {
            "portfolio_score": score,
            "keyword_matches": matches
        }

    except Exception:
        return {"portfolio_score": 0}
