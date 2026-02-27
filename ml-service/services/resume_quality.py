import re

def analyze_resume_quality(resume_text: str):

    text = resume_text.lower()

    positive_score = 0
    penalties = {}
    flags = {}

    word_count = len(text.split())

    # ---------------------------------------
    # 1️⃣ Resume Length Check
    # ---------------------------------------
    if word_count < 250:
        penalties["too_short_resume"] = -8
    elif word_count > 1200:
        penalties["too_long_resume"] = -4
    else:
        positive_score += 3

    # ---------------------------------------
    # 2️⃣ Metrics / Quantifiable Results
    # ---------------------------------------
    metrics_pattern = r"\d+%|\d+\+|\d+\s?(users|clients|projects|months|years)"
    if re.search(metrics_pattern, text):
        positive_score += 5
        flags["has_metrics"] = True
    else:
        penalties["no_measurable_results"] = -5
        flags["has_metrics"] = False

    # ---------------------------------------
    # 3️⃣ Projects Section
    # ---------------------------------------
    if "project" in text:
        positive_score += 4
        flags["has_projects_section"] = True
    else:
        penalties["no_projects_section"] = -6
        flags["has_projects_section"] = False

    # ---------------------------------------
    # 4️⃣ Skills Section
    # ---------------------------------------
    if "skill" in text:
        positive_score += 3
        flags["has_skills_section"] = True
    else:
        penalties["no_skills_section"] = -5
        flags["has_skills_section"] = False

    # ---------------------------------------
    # 5️⃣ Professional Language
    # ---------------------------------------
    weak_words = ["hardworking", "passionate", "quick learner"]
    weak_count = sum(1 for w in weak_words if w in text)

    if weak_count > 2:
        penalties["generic_language"] = -4

    # ---------------------------------------
    # 6️⃣ Action Verbs
    # ---------------------------------------
    action_verbs = ["developed", "implemented", "built", "designed", "optimized"]
    verb_hits = sum(1 for v in action_verbs if v in text)

    if verb_hits >= 3:
        positive_score += 4
        flags["strong_action_verbs"] = True
    else:
        penalties["weak_action_verbs"] = -3
        flags["strong_action_verbs"] = False

    # ---------------------------------------
    # 7️⃣ Grammar Check (basic heuristic)
    # ---------------------------------------
    long_sentences = [s for s in text.split(".") if len(s.split()) > 40]
    if len(long_sentences) > 5:
        penalties["poor_sentence_structure"] = -3

    # ---------------------------------------
    # Final Cap
    # ---------------------------------------
    positive_score = min(15, positive_score)

    return {
        "resume_positive_score": positive_score,
        "penalties": penalties,
        "quality_flags": flags,
        "word_count": word_count
    }
