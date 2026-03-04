from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from services.similarity import get_similarity_scores
from services.explainable_ranker import explain_candidate
from services.github_analyzer import analyze_github_profile
from services.portfolio_analyzer import analyze_portfolio
from services.linkedin_analyzer import analyze_linkedin_profile
from services.skill_extractor import extract_skills_from_jd
from services.resume_quality import analyze_resume_quality
from services.experience_engine import evaluate_experience

load_dotenv()

app = Flask(__name__)
CORS(app)

# --------------------------------------------------
# STRICT ENTERPRISE ATS ENGINE
# --------------------------------------------------
def generate_strict_ats(explanation_data):

    coverage = explanation_data.get("jd_coverage", 0)
    missing = explanation_data.get("missing_keywords", [])
    critical_missing = explanation_data.get("critical_missing_count", 0)

    experience_data = explanation_data.get("experience", {})
    experience_status = experience_data.get("status")
    experience_gap = experience_data.get("gap")

    reject_reasons = []
    strengths = []
    weaknesses = []
    improvements = []

    auto_reject = False

    # --------------------------------------------------
    # STRICT RULE 1 — Missing critical skills
    # --------------------------------------------------
    if critical_missing >= 1:
        auto_reject = True
        reject_reasons.append(
            "Critical mandatory skills required for this role are missing."
        )

    # --------------------------------------------------
    # STRICT RULE 2 — Minimum coverage threshold
    # --------------------------------------------------
    if coverage < 70:
        auto_reject = True
        reject_reasons.append(
            "JD skill coverage below strict ATS threshold (70%)."
        )

    # --------------------------------------------------
    # STRICT RULE 3 — Enterprise alignment requirement
    # --------------------------------------------------
    if coverage < 85:
        auto_reject = True
        reject_reasons.append(
            "Overall technical alignment below enterprise screening threshold (85%)."
        )

    # --------------------------------------------------
    # STRICT RULE 4 — Experience under qualification
    # --------------------------------------------------
    if experience_status in ["UNDER_QUALIFIED", "SLIGHT_UNDER"]:
        auto_reject = True
        reject_reasons.append(
            f"Experience gap of {experience_gap} years below job requirement."
        )

    verdict = "Rejected" if auto_reject else "Shortlisted"

    # --------------------------------------------------
    # Strength Analysis
    # --------------------------------------------------
    if explanation_data.get("matched_keywords"):
        strengths.append(
            f"Strong alignment with core technologies: {', '.join(explanation_data['matched_keywords'])}."
        )

    if coverage >= 90:
        strengths.append(
            "Exceptional keyword coverage and strong technical consistency."
        )

    # --------------------------------------------------
    # Weakness Analysis
    # --------------------------------------------------
    if missing:
        weaknesses.append(
            f"Missing required competencies in: {', '.join(missing)}."
        )
        improvements.append(
            "Add demonstrable experience or projects covering missing technical skills."
        )

    if experience_status in ["UNDER_QUALIFIED", "SLIGHT_UNDER"]:
        weaknesses.append(
            "Professional experience does not fully meet job expectations."
        )
        improvements.append(
            "Gain additional hands-on industry experience aligned with job requirements."
        )

    # --------------------------------------------------
    # Narrative Generation
    # --------------------------------------------------
    narrative = f"""
ENTERPRISE STRICT ATS EVALUATION REPORT

Final JD Coverage Score: {coverage}%
Decision: {verdict}

Strength Indicators:
{' '.join(strengths) if strengths else 'Limited strengths identified under strict evaluation criteria.'}

Critical Weaknesses:
{' '.join(weaknesses) if weaknesses else 'No major structural weaknesses detected.'}

Rejection Triggers:
{' '.join(reject_reasons) if reject_reasons else 'No strict rejection rules triggered.'}

Improvement Suggestions:
{' '.join(improvements) if improvements else 'Profile satisfies strict enterprise ATS standards.'}
"""

    return {
        "verdict": verdict,
        "reject_reasons": reject_reasons,
        "narrative": narrative.strip()
    }

# --------------------------------------------------
# Health check
# --------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ML service running"})

# --------------------------------------------------
# Resume similarity
# --------------------------------------------------
@app.route("/ml/similarity", methods=["POST"])
def similarity():
    data = request.get_json()

    job_text = data.get("job_text", "")
    resume_texts = data.get("resume_texts", [])

    if not job_text or not resume_texts:
        return jsonify({
            "error": "job_text and resume_texts are required"
        }), 400

    try:
        scores = get_similarity_scores(job_text, resume_texts)
        return jsonify({"scores": scores})
    except Exception as e:
        return jsonify({
            "error": "Similarity computation failed",
            "details": str(e)
        }), 500

# --------------------------------------------------
# Explainable AI + STRICT ATS
# --------------------------------------------------
@app.route("/ml/explain", methods=["POST"])
def explain():
    print("🔥 EXPLAIN ROUTE CALLED 🔥")
    data = request.get_json()

    job_text = data.get("job_text", "")
    resume_text = data.get("resume_text", "")
    extracted_skills = data.get("extracted_skills", None)

    if not job_text or not resume_text:
        return jsonify({
            "error": "job_text and resume_text are required"
        }), 400

    try:
        explanation = explain_candidate(
            resume_text,
            job_text,
            extracted_skills
        )

        # Apply strict ATS logic
        ats_evaluation = generate_strict_ats(explanation)

        explanation["ats_evaluation"] = ats_evaluation
        explanation["decision"] = ats_evaluation["verdict"]

        return jsonify(explanation)

    except Exception as e:
        return jsonify({
            "error": "Explainability computation failed",
            "details": str(e)
        }), 500
    
@app.route("/ml/conversational-explain", methods=["POST"])
def conversational_explain():
    data = request.get_json()

    explanation = data.get("explanation")

    if not explanation:
        return jsonify({"error": "explanation data required"}), 400

    try:
        from services.conversational_ai import generate_conversational_explanation

        response = generate_conversational_explanation(explanation)

        return jsonify({
            "conversational_explanation": response
        })

    except Exception as e:
        return jsonify({
            "error": "Conversational explanation failed",
            "details": str(e)
        }), 500

# --------------------------------------------------
@app.route("/ml/extract-skills", methods=["POST"])
def extract_skills():
    data = request.get_json()
    jd_text = data.get("job_text", "")

    if not jd_text:
        return jsonify({"error": "job_text is required"}), 400

    skills = extract_skills_from_jd(jd_text)
    return jsonify(skills)

# --------------------------------------------------
@app.route("/ml/resume-quality", methods=["POST"])
def resume_quality():
    data = request.get_json()
    resume_text = data.get("resume_text", "")

    if not resume_text:
        return jsonify({"error": "resume_text is required"}), 400

    try:
        result = analyze_resume_quality(resume_text)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": "Resume quality analysis failed",
            "details": str(e)
        }), 500

# --------------------------------------------------
@app.route("/ml/experience", methods=["POST"])
def experience_analysis():
    data = request.get_json()

    jd_text = data.get("job_text", "")
    resume_text = data.get("resume_text", "")

    if not jd_text or not resume_text:
        return jsonify({"error": "job_text and resume_text required"}), 400

    result = evaluate_experience(jd_text, resume_text)
    return jsonify(result)

# --------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)