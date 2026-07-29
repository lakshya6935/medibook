import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../api";
import registerDoctor from "../assets/login-doctor.svg";

export default function Register() {
  const nav = useNavigate();
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);

    const email = data.get("email");
    const mobile = data.get("mobile");
    const role = data.get("role");
    const password = data.get("password");
    const confirm = data.get("confirm");

    if (!email || !mobile || !role || !password || !confirm) {
      setMsg(["Please fill all required fields.", "error"]);
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      setMsg([
        "Please enter a valid 10-digit mobile number.",
        "error",
      ]);
      return;
    }

    if (password.length < 6) {
      setMsg([
        "Password must contain at least 6 characters.",
        "error",
      ]);
      return;
    }

    if (password !== confirm) {
      setMsg([
        "Password and confirm password do not match.",
        "error",
      ]);
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await api.register({
        email,
        mobile,
        role,
        password,
        confirm,
      });

      setMsg([
        res.message ||
          "Registration successful! Redirecting to login...",
        "success",
      ]);

      setTimeout(() => {
        nav("/login");
      }, 900);
    } catch (err) {
      setMsg([
        err.message || "Registration failed. Please try again.",
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
            <span className="floating-pill pill-one">
              Join MediBook
            </span>

            <span className="floating-pill pill-two">
              Secure Account
            </span>

            <span className="floating-plus plus-one">+</span>
            <span className="floating-plus plus-two">+</span>

            <span className="medical-dot dot-one" />
            <span className="medical-dot dot-two" />
            <span className="medical-dot dot-three" />

            <img
              src={registerDoctor}
              alt="MediBook registration"
            />
          </div>

          <div className="login-card">
            <p className="tagline">Create Your Account</p>

            <h1>Register on MediBook</h1>

            <p className="login-subtitle">
              Create your account to book and manage doctor
              appointments.
            </p>

            <form className="login-form" onSubmit={submit}>
              <div className="input-group">
                <label htmlFor="register-email">
                  Email Address
                </label>

                <div className="input-icon-box">
                  <span className="input-icon">✉️</span>

                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="register-mobile">
                  Mobile Number
                </label>

                <div className="input-icon-box">
                  <span className="input-icon">📱</span>

                  <input
                    id="register-mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    placeholder="Enter 10-digit mobile number"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="register-role">Role</label>

                <div className="input-icon-box">
                  <span className="input-icon">👤</span>

                  <select
                    id="register-role"
                    name="role"
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="register-password">
                  Password
                </label>

                <div className="input-icon-box">
                  <span className="input-icon">🔒</span>

                  <input
                    id="register-password"
                    name="password"
                    type="password"
                    minLength="6"
                    placeholder="Create password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="register-confirm">
                  Confirm Password
                </label>

                <div className="input-icon-box">
                  <span className="input-icon">🔒</span>

                  <input
                    id="register-confirm"
                    name="confirm"
                    type="password"
                    minLength="6"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    required
                  />
                </div>
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
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>

            <p className="signup-text">
              Already have an account?{" "}
              <Link to="/login">Login</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}