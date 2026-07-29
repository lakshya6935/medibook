import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const demoUsers = [
  { email: "admin@medibook.com", mobile: "9000000001", role: "admin", password: "admin123" },
  { email: "doctor@medibook.com", mobile: "9000000002", role: "doctor", password: "doctor123", specialty: "Cardiologist" },
  { email: "patient@medibook.com", mobile: "9000000003", role: "patient", password: "patient123" },
];

async function seed() {
  await connectDB();
  for (const u of demoUsers) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`Skipping (already exists): ${u.email}`);
      continue;
    }
    await User.create(u);
    console.log(`Created: ${u.email} / ${u.password} (${u.role})`);
  }
  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
