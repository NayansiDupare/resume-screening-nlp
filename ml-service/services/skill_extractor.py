import spacy
import re

nlp = spacy.load("en_core_web_sm")

TECH_SKILL_HINTS = [
    "react", "node", "node.js", "mongodb", "express",
    "java", "python", "spring", "aws", "docker",
    "kubernetes", "mysql", "typescript", "javascript",
    "html", "css", "rest", "api"
]

IMPORTANT_WORDS = ["must", "required", "mandatory", "need"]


def clean_text(text):
    return re.sub(r"[^\w\s.+#]", " ", text.lower())


def extract_skills_from_jd(jd_text: str):
    jd_clean = clean_text(jd_text)
    doc = nlp(jd_clean)

    detected_skills = set()

    # -----------------------------
    # STRICT RULE: Only exact skill matches
    # -----------------------------
    for skill in TECH_SKILL_HINTS:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, jd_clean):
            detected_skills.add(skill)

    # -----------------------------
    # Determine Critical Skills
    # -----------------------------
    critical_skills = []
    optional_skills = []

    # If JD contains strong requirement words,
    # first 2 detected skills become critical
    if any(word in jd_clean for word in IMPORTANT_WORDS):
        critical_skills = list(detected_skills)[:2]
        optional_skills = list(detected_skills)[2:]
    else:
        optional_skills = list(detected_skills)

    return {
        "critical_skills": critical_skills,
        "optional_skills": optional_skills,
        "all_skills": list(detected_skills)
    }
