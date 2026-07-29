import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, mobile, role, password, confirm } = req.body;

    if (!email || !mobile || !role || !password || !confirm) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({ message: "Please enter a valid 10-digit mobile number." });
    }
    if (!["patient", "doctor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected." });
    }
    if (password !== confirm) {
      return res.status(400).json({ message: "Password and confirm password do not match." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      mobile,
      role,
      password,
    });

    return res.status(201).json({
      message: "Registration successful! Redirecting to login...",
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during registration." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Please fill email, password, and user role." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (user.role !== role) {
      return res.status(401).json({ message: "This account is not registered under the selected role." });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);
    return res.json({
      message: "Login successful! Opening your dashboard...",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during login." });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

export default router;
