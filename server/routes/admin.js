import express from "express";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// GET /api/admin/stats - admin only
router.get("/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const [doctorCount, patientCount, appointmentCount] = await Promise.all([
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "patient" }),
      Appointment.countDocuments({}),
    ]);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const todayCount = await Appointment.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({
      doctors: doctorCount,
      patients: patientCount,
      appointments: appointmentCount,
      appointmentsToday: todayCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch admin stats." });
  }
});

export default router;
