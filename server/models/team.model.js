import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    domain: { type: String, required: true },
    description: { type: String },
    maxMembers: { type: Number, default: 2 }, // creator + 1 recruit
    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        linkedin: { type: String },
        github: { type: String },
        resume: { type: String },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    // Keep a record of rejected applications so applicants can still see they were rejected
    rejectedApplicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        linkedin: { type: String },
        github: { type: String },
        resume: { type: String },
        appliedAt: { type: Date },
        rejectedAt: { type: Date, default: Date.now },
      },
    ],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isOpen: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const teamModel = mongoose.models.Team || mongoose.model("Team", teamSchema);

export default teamModel;
