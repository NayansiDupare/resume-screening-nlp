const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateExplanation({
  jobTitle,
  matched,
  missing,
  score,
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
You are an ATS AI assistant.

Job Role: ${jobTitle}
Resume Score: ${score}%

Matched Skills: ${matched.join(", ") || "None"}
Missing Skills: ${missing.join(", ") || "None"}

Explain in simple professional language why this resume got this score.
Keep it short (3–4 lines).
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = generateExplanation;
