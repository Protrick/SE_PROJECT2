import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  domain: { type: String, lowercase: true, trim: true },
  password: { type: String, required: true },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Date, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Date, default: 0 },
  createdTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  appliedTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
});

const usermodel = mongoose.models.User || mongoose.model("User", userSchema);

export default usermodel;
