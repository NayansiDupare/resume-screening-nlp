import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createJob, summarizeJD } from "../api/jobApi";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Basic Skill Dictionary
const SKILL_LIST = [
  "react", "node", "node.js", "mongodb", "express",
  "javascript", "typescript", "java", "spring",
  "python", "django", "flask",
  "aws", "docker", "kubernetes",
  "mysql", "postgresql", "firebase",
  "html", "css", "tailwind"
];

export default function CreateJob() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
  });

  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Extract Skills Automatically
  const extractSkills = (text) => {
    const lowerText = text.toLowerCase();

    const foundSkills = SKILL_LIST.filter((skill) =>
      lowerText.includes(skill.toLowerCase())
    );

    return foundSkills;
  };

  // File Handler (TXT + DOCX + PDF)
  const handleFile = async (file) => {
    if (!file) return;

    const fileType = file.name.split(".").pop().toLowerCase();

    try {
      let extractedText = "";

      // TXT
      if (fileType === "txt") {
        extractedText = await file.text();
      }

      // DOCX
      else if (fileType === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      }

      // PDF
      else if (fileType === "pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          extractedText += content.items.map((item) => item.str).join(" ");
        }
      }

      else {
        toast.error("Only TXT, DOCX, and PDF supported");
        return;
      }

      const skills = extractSkills(extractedText);

      setForm((prev) => ({
        ...prev,
        description: extractedText,
        requirements: skills.join(", "),
      }));

      toast.success("Job description loaded & skills extracted");

    } catch (error) {
      toast.error("Failed to read file");
    }
  };

  // AI Summarization (Using API Layer)
  const handleSummarize = async () => {
    if (!form.description) {
      toast.error("Add job description first");
      return;
    }

    setSummarizing(true);

    try {
      const res = await summarizeJD(form.description);

      setForm((prev) => ({
        ...prev,
        description: res.data.summary,
      }));

      toast.success("AI summary generated");

    } catch (err) {
      toast.error("Failed to summarize");
    } finally {
      setSummarizing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createJob({
        title: form.title,
        description: form.description,
        requirements: form.requirements
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
      });

      toast.success("Job created successfully");
      navigate("/jobs");

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-3xl p-10 rounded-2xl shadow-xl">

        <h2 className="text-3xl font-bold text-slate-800 mb-10">
          Create New Job
        </h2>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Job Title
            </label>
            <input
              name="title"
              placeholder="e.g. Senior Backend Developer"
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-600 outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-4">
              Job Description
            </label>

            <textarea
              name="description"
              placeholder="Write or upload job description..."
              rows="7"
              value={form.description}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-600 outline-none transition"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Requirements
            </label>

            <input
              name="requirements"
              placeholder="React, Node.js, MongoDB..."
              value={form.requirements}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition"
            />

            <p className="text-xs text-slate-400 mt-1">
              Separate skills with commas.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center">

            <button
              type="button"
              onClick={handleSummarize}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg text-sm transition"
            >
              {summarizing ? "Summarizing..." : "AI Summarize JD"}
            </button>

            <button
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg font-medium transition shadow-sm"
            >
              {loading ? "Creating..." : "Create Job"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}