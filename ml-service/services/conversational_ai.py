import os
from openai import OpenAI


def generate_conversational_explanation(explanation):
    """
    Generates structured recruiter-style explanation
    from ATS evaluation data.
    """

    try:
        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            raise ValueError("OPENAI_API_KEY is missing. Check your .env file.")

        client = OpenAI(api_key=api_key)

        ats_decision = explanation.get("ats_evaluation", {}).get("verdict", "Unknown")
        coverage = explanation.get("jd_coverage", "Unknown")
        matched = explanation.get("matched_keywords", [])
        missing = explanation.get("missing_keywords", [])

        prompt = f"""
You are a senior technical recruiter explaining ATS candidate evaluation results.

Analyze the following data and produce a **clear bullet point explanation**.

Candidate Evaluation Data
-------------------------
JD Coverage: {coverage}
Matched Skills: {", ".join(matched) if matched else "None"}
Missing Skills: {", ".join(missing) if missing else "None"}
ATS Decision: {ats_decision}

Return the explanation ONLY as bullet points.

Rules:
- Each point must start with "-"
- Maximum 6 bullet points
- Do NOT write paragraphs
- Do NOT write greetings
- Do NOT write letters like "Dear Hiring Manager"

Example format:

- Candidate shows strong alignment with core technologies.
- High JD coverage indicates strong skill match.
- Missing Docker may affect deployment workflows.
- ATS rejected due to missing mandatory requirement.
- Candidate could still succeed with targeted training.
- Recommended improvement: gain hands-on Docker experience.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior technical recruiter explaining ATS evaluation results."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3
        )

        explanation_text = response.choices[0].message.content.strip()

        return explanation_text

    except Exception as e:
        return f"Conversational AI explanation failed: {str(e)}"