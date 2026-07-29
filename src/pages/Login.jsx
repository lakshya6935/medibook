import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api, setAuth } from "../api";
import loginDoctor from "../assets/login-doctor.svg";

export default function Login() {
  const nav = useNavigate();
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    const d = new FormData(e.currentTarget);
    const role = d.get("role");
    const email = d.get("email");
    const password = d.get("password");

    if (!email || !password || !role) {
      setMsg([
        "Please fill email, password, and user role.",
        "error",
      ]);
      return;
    }

    setLoading(true);

    try {
      const res = await api.login({
        email,
        password,
        role,
      });

      setAuth({
        token: res.token,
        user: res.user,
      });

      setMsg([
        res.message ||
          "Login successful! Opening your dashboard...",
        "success",
      ]);

      setTimeout(() => {
        nav(`/${res.user.role}-dashboard`);
      }, 700);
    } catch (err) {
      setMsg([
        err.message || "Login failed. Please try again.",
        "error",
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <Header />

      <main className="login-page">
        <section className="login-wrapper">
          <div className="login-visual">
            <span className="floating-pill pill-one">24/7 Care</span>
            <span className="floating-pill pill-two">Secure Login</span>

            <span className="floating-plus plus-one">+</span>
            <span className="floating-plus plus-two">+</span>

            <span className="medical-dot dot-one" />
            <span className="medical-dot dot-two" />
            <span className="medical-dot dot-three" />

            <img
              src={loginDoctor}
              alt="Doctor appointment login illustration"
            />
          </div>

          <div className="login-card">
            <p className="tagline">Welcome Back</p>

            <h1>Login to MediBook</h1>

            <p className="login-subtitle">
              Access your appointment dashboard as Patient, Doctor,
              or Admin.
            </p>

            <form className="login-form" onSubmit={submit}>
              <div className="input-group">
                <label>Email Address</label>

                <div className="input-icon-box">
                  <span className="input-icon">✉️</span>

                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>

                <div className="input-icon-box">
                  <span className="input-icon">🔒</span>

                  <input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Login As</label>

                <div className="input-icon-box">
                  <span className="input-icon">👤</span>

                  <select name="role" required>
                    <option value="">Select user role</option>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="login-options">
                <label>
                  <input type="checkbox" /> Remember me
                </label>

                <a href="#" onClick={(e) => e.preventDefault()}>
                  Forgot Password?
                </a>
              </div>

              {msg && (
                <div className={`form-message ${msg[1]}`}>
                  {msg[0]}
                </div>
              )}

              <button
                className="login-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login Now"}
              </button>
            </form>

            <p className="signup-text">
              New to MediBook?{" "}
              <Link to="/register">Create Account</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}