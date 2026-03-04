import os
from openai import OpenAI


def generate_conversational_explanation(explanation):
    """
    Generates a recruiter-style conversational explanation
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
You are an expert technical recruiter and AI hiring analyst.

Analyze the candidate evaluation below and explain it clearly
to a hiring manager.

Evaluation Data
---------------
JD Coverage: {coverage}
Matched Skills: {", ".join(matched) if matched else "None"}
Missing Skills: {", ".join(missing) if missing else "None"}
ATS Decision: {ats_decision}

Explain:

1. Why the candidate received this evaluation
2. Technical strengths
3. Technical weaknesses or hiring risks
4. Why the ATS system made the decision
5. Whether you would recommend the candidate
6. Suggestions for improvement

Write in a professional recruiter-style explanation.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior technical recruiter explaining ATS candidate evaluations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Conversational AI explanation failed: {str(e)}"