import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    // Doctor-only optional fields (safe defaults so registration form stays unchanged)
    specialty: {
      type: String,
      default: function () {
        return this.role === "doctor" ? "General Physician" : undefined;
      },
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, role: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    email: this.email,
    mobile: this.mobile,
    role: this.role,
    specialty: this.specialty,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
