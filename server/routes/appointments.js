import express from "express";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// POST /api/appointments - patient books an appointment
router.post("/", protect, authorize("patient"), async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "Doctor, date, and time are required." });
    }
    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Selected doctor was not found." });
    }
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      date,
      time,
      reason: reason || "",
    });
    res.status(201).json({ message: "Appointment booked successfully!", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to book appointment." });
  }
});

// GET /api/appointments/mine - appointments for the logged-in user (patient or doctor)
router.get("/mine", protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "patient") query.patient = req.user._id;
    else if (req.user.role === "doctor") query.doctor = req.user._id;
    else return res.status(403).json({ message: "Admins should use /api/appointments/all" });

    const appointments = await Appointment.find(query)
      .populate("doctor", "email specialty")
      .populate("patient", "email mobile")
      .sort({ createdAt: -1 });

    res.json({ appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch appointments." });
  }
});

// GET /api/appointments/all - admin only
router.get("/all", protect, authorize("admin"), async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("doctor", "email specialty")
      .populate("patient", "email mobile")
      .sort({ createdAt: -1 });
    res.json({ appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch appointments." });
  }
});

// PATCH /api/appointments/:id/status - doctor or admin updates status
router.patch("/:id/status", protect, authorize("doctor", "admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found." });

    if (req.user.role === "doctor" && String(appointment.doctor) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only update your own appointments." });
    }

    appointment.status = status;
    await appointment.save();
    res.json({ message: "Appointment updated.", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update appointment." });
  }
});

export default router;
