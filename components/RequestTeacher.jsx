"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // import router

export default function RequestTeacherForm() {
  const router = useRouter(); // initialize router

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Request submitted:", formData);
    alert("Request sent!");

    // Reset form
    setFormData({ fullName: "", email: "", message: "" });

    // Redirect to settings page
    router.push("/Setting");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-black p-8 rounded-lg shadow-md w-full max-w-md"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">
        Request to Become a Teacher
      </h1>

      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 mb-4 border rounded"
        required
      />

      <textarea
        name="message"
        placeholder="Why do you want to become a teacher?"
        value={formData.message}
        onChange={handleChange}
        rows={4}
        className="w-full p-2 mb-4 border rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-800 text-white p-2 rounded font-bold"
      >
        Submit Request
      </button>
    </form>
  );
}