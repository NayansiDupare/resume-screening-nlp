import re
from collections import Counter
from services.experience_engine import evaluate_experience
from services.seniority_engine import evaluate_seniority

def clean_text(text: str) -> str:
    text = (text or "").lower()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^a-z0-9\s\+\#\.\-]", " ", text)
    return text.strip()

def extract_keywords(jd_text: str):
    jd = clean_text(jd_text)

    skill_bank = [
        "react", "reactjs", "redux", "next", "nextjs",
        "node", "nodejs", "node.js", "express",
        "mongodb", "mysql", "postgresql",
        "javascript", "typescript", "java",
        "spring", "spring boot",
        "html", "css", "tailwind", "mui",
        "rest", "api", "jwt",
        "git", "github",
        "docker", "aws", "azure",
        "python", "flask", "django",
        "machine learning", "nlp",
        "sql"
    ]

    GENERIC_WORDS = [
        "developer", "looking", "experience",
        "skills", "knowledge", "project",
        "team", "work", "role", "strong",
        "requirement", "candidate"
    ]

    found = set()

    for skill in skill_bank:
        if re.search(r"\b" + re.escape(skill) + r"\b", jd):
            found.add(skill)

    # Remove generic words (strict filtering)
    final_keywords = [k for k in found if k not in GENERIC_WORDS]

    return sorted(final_keywords)



def split_into_lines(resume_text: str):
    raw = (resume_text or "").replace("\r", "\n")
    parts = []
    for line in raw.split("\n"):
        line = line.strip()
        if not line:
            continue
        sentences = re.split(r"(?<=[.!?])\s+", line)
        parts.extend([s.strip() for s in sentences if len(s.strip()) > 8])
    return parts

def keyword_hits_in_line(line: str, keywords: list):
    line_clean = clean_text(line)
    hits = []
    for k in keywords:
        if re.search(r"\b" + re.escape(k) + r"\b", line_clean):
            hits.append(k)
    return hits


def explain_candidate(resume_text: str, jd_text: str, extracted_skills=None):
    resume_clean = clean_text(resume_text)

    # ---------------------------------
    # Use AI Extracted Skills If Available
    # ---------------------------------
    if extracted_skills:
        critical_skills = extracted_skills.get("critical_skills", [])
        optional_skills = extracted_skills.get("optional_skills", [])
        keywords = extracted_skills.get("all_skills", [])
    else:
        keywords = extract_keywords(jd_text)
        critical_skills = keywords[:2]
        optional_skills = keywords[2:]

    matched = []
    missing = []
    weak_mentions = 0
    critical_missing = 0
    strong_mentions = 0

    # ---------------------------------
    # Skill Matching With Frequency Check
    # ---------------------------------
    for skill in keywords:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        occurrences = len(re.findall(pattern, resume_clean))

        if occurrences > 0:
            matched.append(skill)

            if occurrences == 1:
                weak_mentions += 1
            elif occurrences >= 2:
                strong_mentions += 1
        else:
            missing.append(skill)

            if skill in critical_skills:
                critical_missing += 1

    total = max(len(keywords), 1)

    # ---------------------------------
    # BASE COVERAGE (Weighted)
    # ---------------------------------
    critical_weight = 2.0
    optional_weight = 1.0

    weighted_score = 0
    max_weight = 0

    for skill in keywords:
        if skill in critical_skills:
            max_weight += critical_weight
            if skill in matched:
                weighted_score += critical_weight
        else:
            max_weight += optional_weight
            if skill in matched:
                weighted_score += optional_weight

    coverage = (weighted_score / max_weight) * 100 if max_weight else 0

    # ---------------------------------
    # STRICT RULES
    # ---------------------------------

    # 1️⃣ Weak mentions penalty
    coverage -= weak_mentions * 2

    # 2️⃣ Strong mentions bonus
    coverage += strong_mentions * 1.5

    # 3️⃣ Heavy penalty if > 40% skills missing
    if len(missing) > (0.4 * total):
        coverage -= 25

    # 4️⃣ If strong JD but only 1 skill matched
    if total >= 4 and len(matched) <= 1:
        coverage -= 35

    # 5️⃣ Critical skill penalty (VERY strict)
    coverage -= critical_missing * 30

    # 6️⃣ Hard fail rule
    if len(critical_skills) >= 2 and critical_missing >= 2:
        coverage *= 0.5

    # 7️⃣ Cap maximum
    coverage = min(95, coverage)

    coverage = max(0, round(coverage, 2))

    # ---------------------------------
    # Extract Top Matching Lines
    # ---------------------------------
    lines = split_into_lines(resume_text)
    scored_lines = []

    for line in lines:
        hits = keyword_hits_in_line(line, keywords)
        if hits:
            scored_lines.append({
                "line": line,
                "hit_count": len(hits)
            })

    scored_lines.sort(key=lambda x: x["hit_count"], reverse=True)
    top_lines = [x["line"] for x in scored_lines[:5]]

    # ---------------------------------
    # Professional Reason Generation
    # ---------------------------------
    if coverage >= 85:
        reason = "Strong alignment with required technical stack and solid coverage of critical competencies."
    elif coverage >= 65:
        reason = "Good alignment, but some important or critical skills require strengthening."
    elif coverage >= 45:
        reason = "Partial alignment. Multiple key or critical skill gaps detected."
    else:
        reason = "Low alignment due to missing critical competencies and insufficient skill coverage."

            # ---------------------------------
    # Experience Evaluation
    # ---------------------------------
    experience_result = evaluate_experience(jd_text, resume_text)
    seniority_result = evaluate_seniority(jd_text, resume_text)

    return {
        "jd_coverage": coverage,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "critical_missing_count": critical_missing,
        "weak_mentions": weak_mentions,
        "strong_mentions": strong_mentions,
        "top_matching_lines": top_lines,
        "reason": reason,
        "experience": experience_result,
        "seniority": seniority_result
    }
