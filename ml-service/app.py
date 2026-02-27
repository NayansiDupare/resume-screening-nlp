from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

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
# Explainable AI
# --------------------------------------------------
@app.route("/ml/explain", methods=["POST"])
def explain():
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
        return jsonify(explanation)

    except Exception as e:
        return jsonify({
            "error": "Explainability computation failed",
            "details": str(e)
        }), 500


# --------------------------------------------------
# GitHub Analyzer
# --------------------------------------------------
@app.route("/ml/github", methods=["POST"])
def github_analysis():
    data = request.get_json()
    github_url = data.get("github_url", "")

    if not github_url:
        return jsonify({"error": "github_url is required"}), 400

    result = analyze_github_profile(github_url)
    return jsonify(result)




@app.route("/ml/portfolio", methods=["POST"])
def portfolio_analysis():
    data = request.get_json()
    portfolio_url = data.get("portfolio_url", "")
    job_text = data.get("job_text", "")

    if not portfolio_url:
        return jsonify({"error": "portfolio_url required"}), 400

    result = analyze_portfolio(portfolio_url, job_text)
    return jsonify(result)



@app.route("/ml/linkedin", methods=["POST"])
def linkedin_analysis():
    data = request.get_json()
    linkedin_url = data.get("linkedin_url", "")
    job_text = data.get("job_text", "")

    if not linkedin_url:
        return jsonify({"error": "linkedin_url required"}), 400

    result = analyze_linkedin_profile(linkedin_url, job_text)
    return jsonify(result)






@app.route("/ml/extract-skills", methods=["POST"])
def extract_skills():
    data = request.get_json()
    jd_text = data.get("job_text", "")

    if not jd_text:
        return jsonify({"error": "job_text is required"}), 400

    skills = extract_skills_from_jd(jd_text)

    return jsonify(skills)


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


