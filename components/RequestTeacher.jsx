'use client';
import { useState } from "react";

export default function BecomeTeacherRequestForm() {
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/teacher-request", {
      method: "POST",
      body: JSON.stringify({ reason }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (res.ok) setSubmitted(true);
  };

  return submitted ? (
    <p className="text-green-400">Request submitted! ✅</p>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Why do you want to become a teacher?"
        className="w-full p-2 rounded bg-white/10 text-white"
        required
      />
      <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded">
        Send Request
      </button>
    </form>
  );
}
