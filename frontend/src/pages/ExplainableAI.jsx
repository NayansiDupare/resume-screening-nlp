import { useLocation, useParams, useNavigate } from "react-router-dom";

export default function ExplainableAI() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { jobId, candidateId } = useParams();

  const candidate = state?.candidate;

  if (!candidate) {
    return (
      <div className="p-8">
        <p>No candidate data found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      <h2 className="text-3xl font-bold mb-8 text-indigo-700">
        Explainable AI Analysis
      </h2>

      {/* Final Score */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-xl font-semibold mb-2">
          Final Score: {Math.min(candidate.score, 100)}%
        </h3>

        <p className="text-gray-600">
          Confidence Level: {(candidate.score / 100).toFixed(2)}
        </p>

        <p className="mt-2 font-medium">
          Decision: {candidate.decision}
        </p>

        <p className="mt-2 text-gray-700">
          {candidate.explanation?.reason}
        </p>
      </div>

      {/* Conversational AI Explanation */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">
          AI Recruiter Explanation
        </h3>

        <p className="text-gray-700 leading-relaxed">
          {candidate.conversational_explanation || "No AI explanation available."}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Score Contribution Breakdown
        </h3>

        {Object.entries(candidate.score_breakdown || {}).map(
          ([key, value], index) => {
            if (typeof value !== "number") return null;

            const isPositive = value >= 0;

            return (
              <div key={index} className="flex justify-between border-b py-2">
                <span className="capitalize">
                  {key.replace(/_/g, " ")}
                </span>

                <span
                  className={isPositive ? "text-green-600" : "text-red-600"}
                >
                  {value}
                </span>
              </div>
            );
          }
        )}
      </div>

      {/* Skill Gap Analysis */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Skill Gap Analysis
        </h3>

        <p className="text-green-600 font-medium mb-2">
          Matched Keywords:
        </p>

        <ul className="list-disc ml-6 mb-4">
          {candidate.explanation?.matched_keywords?.map((kw, index) => (
            <li key={index}>{kw}</li>
          ))}
        </ul>

        <p className="text-red-600 font-medium mb-2">
          Missing Keywords:
        </p>

        <ul className="list-disc ml-6">
          {candidate.explanation?.missing_keywords?.map((kw, index) => (
            <li key={index}>{kw}</li>
          ))}
        </ul>
      </div>

      {/* Resume Quality */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">
          Resume Quality Issues
        </h3>

        <p>
          Weak Action Verbs Penalty:{" "}
          {candidate.resume_quality_details?.penalties?.weak_action_verbs || 0}
        </p>

        <p>
          Has Metrics:{" "}
          {candidate.resume_quality_details?.quality_flags?.has_metrics
            ? "Yes"
            : "No"}
        </p>

        <p>
          Strong Action Verbs:{" "}
          {candidate.resume_quality_details?.quality_flags?.strong_action_verbs
            ? "Yes"
            : "No"}
        </p>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
      >
        Back
      </button>

    </div>
  );
}