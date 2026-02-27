import { useState } from "react";
import { registerUser } from "../../api/authApi";
import toast from "react-hot-toast";

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await registerUser(form);
      toast.success("Account created. Please login.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="w-full max-w-sm text-center">
      <h2 className="text-3xl font-bold text-slate-800 mb-10">
        Create Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          name="name"
          type="text"
          placeholder="Name"
          onChange={handleChange}
          required
          className="w-full border-b border-slate-300 py-2 outline-none focus:border-indigo-600 transition"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full border-b border-slate-300 py-2 outline-none focus:border-indigo-600 transition"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="w-full border-b border-slate-300 py-2 outline-none focus:border-indigo-600 transition"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-full transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}