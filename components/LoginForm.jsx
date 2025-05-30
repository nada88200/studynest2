"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid credentials");
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      console.log("An error occurred", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              className="login-form-input"
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              className="login-form-input"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-form-button">
            Login
          </button>
        </form>
        <div className="register-link">
          <p>
            Don't have an account?{" "}
            <Link href="/register" className="hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Embedded styles */}
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
