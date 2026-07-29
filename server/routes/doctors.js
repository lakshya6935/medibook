import express from "express";
import User from "../models/User.js";

const router = express.Router();

// GET /api/doctors - public list of doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select(
      "email mobile specialty createdAt"
    );
    res.json({ doctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch doctors." });
  }
});

export default router;
