import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_conversational_explanation(explanation):
    print("OPENAI KEY:", os.getenv("OPENAI_API_KEY"))

    prompt = f"""
You are an expert technical recruiter and AI hiring analyst.

Analyze the following candidate evaluation data and explain:

- Why this candidate received this score
- Strengths in technical stack
- Weaknesses or risks
- Why ATS decided: {explanation.get("ats_evaluation", {}).get("verdict")}
- Whether you would personally recommend this candidate and why
- Improvements needed

Evaluation Data:
{explanation}

Write in professional but conversational tone.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a senior AI recruiter."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )

    return response.choices[0].message.content