"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";

// Import the CSS file
import "../styles/css/LoginForm.css";

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
      if(session.user.role === "admin") {
         router.push("/adminDashboard");
      } else if(session.user.role === "tutor") {
         router.push("/tutorDashboard");
       }
       else {
         router.push("/dashboard");
       }
        
      //router.replace("dashboard");
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
          <button
            type="submit"
            className="login-form-button"
          >
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
    </div>
  );
}
