//component/RegisterForm.jsx
"use client";
import React from 'react';
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }
    if (name.length > 40) {
      setError("Full name must be 40 characters or less");
      return;
    }
    if (!email.includes("@")) {
      setError("Invalid email format");
      return;
    }
    if (password.length < 6 || !/[a-zA-Z]/.test(password)) {
      setError("Password must be at least 8 characters and include at least one letter");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        e.target.reset();
        router.push("/");
      } else {
        const { message } = await res.json();
        setError(message);
        return;
      }
    } catch (error) {
      console.log("An error occurred", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className="login-form-input"
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Full Name"
          />
          <input
            className="login-form-input"
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
          />
          <input
            className="login-form-input"
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
          {error && <div className="error-message">{error}</div>}
          <button className="login-form-button">Register</button>
        </form>
        <div className="register-link">
          <p>
            Already have an account?{" "}
            <Link href="/" className="hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Embedded CSS styles */}
      <style jsx>{`
        .login-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-image: url('/images/jusr_librrr.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .login-form-container {
          background-color: white;
          padding: 32px;
          border-radius: 16px;
          width: 100%;
          max-width: 32rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin: 0 1rem;
        }

        .login-form-container h1 {
          font-size: 2.25rem;
          font-weight: 600;
          text-align: center;
          color: #1f2937;
          margin-bottom: 2rem;
        }

        .login-form-input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 1.125rem;
          color: #374151;
          transition: all 0.3s ease;
        }

        .login-form-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }

        .error-message {
          color: #dc2626;
          font-size: 0.875rem;
          text-align: center;
          padding: 8px;
          background-color: #fef2f2;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .login-form-button {
          width: 100%;
          padding: 16px;
          background-color: #3b82f6;
          color: white;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .login-form-button:hover {
          background-color: #2563eb;
        }

        .login-form-button:focus {
          outline: none;
        }

        .register-link {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: #4b5563;
        }

        .register-link a {
          color: #2563eb;
          text-decoration: underline;
          font-weight: 500;
        }

        .register-link a:hover {
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
