import mongoose from "mongoose";
import dotenv from "dotenv";
import teamModel from "../models/team.model.js";
import { transporter } from "../config/nodemailer.js";

dotenv.config();

/**
 * Create a team
 */
export const createTeam = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { name, domain, description, maxMembers = 2 } = req.body;
    if (!name || !domain)
      return res
        .status(400)
        .json({ success: false, message: "Name and domain required" });

    const team = await teamModel.create({
      name,
      domain,
      description: description || "",
      creator: requesterId,
      maxMembers,
      members: [],
      applicants: [],
      rejectedApplicants: [],
      isOpen: true,
    });

    return res.status(201).json({ success: true, team });
  } catch (error) {
    console.error("createTeam error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Show teams created by the requester
 */
export const showCreatedTeams = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const teams = await teamModel
      .find({ creator: new mongoose.Types.ObjectId(requesterId) })
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("applicants.user", "name email")
      .populate("rejectedApplicants.user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error("showCreatedTeams error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Show available teams (optional authenticated user)
 */
export const showAvailableTeams = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { domain } = req.query;

    const baseQuery = { isOpen: true };
    if (domain) baseQuery.domain = String(domain).trim();

    if (requesterId) {
      baseQuery.$nor = [
        { creator: new mongoose.Types.ObjectId(requesterId) },
        { "applicants.user": new mongoose.Types.ObjectId(requesterId) },
        { members: new mongoose.Types.ObjectId(requesterId) },
        { "rejectedApplicants.user": new mongoose.Types.ObjectId(requesterId) },
      ];
    }

    const teams = await teamModel
      .find(baseQuery)
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("applicants.user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error("showAvailableTeams error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Teams where user interacted (applicants, members or rejected)
 */
export const appliedTeams = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const oid = new mongoose.Types.ObjectId(requesterId);
    const teams = await teamModel
      .find({
        $or: [
          { "applicants.user": oid },
          { members: oid },
          { "rejectedApplicants.user": oid },
        ],
      })
      .populate("creator", "name email")
      .populate("applicants.user", "name email")
      .populate("rejectedApplicants.user", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error("appliedTeams error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get team by id
 */
export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid teamId" });

    const team = await teamModel
      .findById(teamId)
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("applicants.user", "name email")
      .populate("rejectedApplicants.user", "name email");

    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    return res.status(200).json({ success: true, team });
  } catch (error) {
    console.error("getTeamById error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Apply to a team
 */
export const applyToTeam = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { teamId } = req.params;
    const { linkedin, github, resume } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teamId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid teamId" });

    const team = await teamModel
      .findById(teamId)
      .populate("creator", "name email");
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (String(team.creator) === String(requesterId))
      return res
        .status(400)
        .json({ success: false, message: "Cannot apply to your own team" });

    if (
      (team.members || []).some(
        (m) => String(m._id || m) === String(requesterId)
      )
    )
      return res
        .status(400)
        .json({ success: false, message: "Already a member" });

    if (
      (team.applicants || []).some(
        (a) => String(a.user?._id || a.user) === String(requesterId)
      )
    )
      return res
        .status(400)
        .json({ success: false, message: "Already applied" });

    if (
      (team.rejectedApplicants || []).some(
        (a) => String(a.user?._id || a.user) === String(requesterId)
      )
    )
      return res
        .status(400)
        .json({ success: false, message: "Application previously rejected" });

    if ((team.members?.length || 0) >= (team.maxMembers || 2))
      return res.status(400).json({ success: false, message: "Team is full" });

    const applicant = {
      user: new mongoose.Types.ObjectId(requesterId),
      linkedin: linkedin || "",
      github: github || "",
      resume: resume || "",
      appliedAt: new Date(),
    };

    team.applicants.push(applicant);
    await team.save();

    try {
      if (team.creator && team.creator.email) {
        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: team.creator.email,
          subject: `New application for "${team.name}"`,
          text: `User applied to your team.\n\nTeam: ${team.name}\nApplicant ID: ${requesterId}`,
        };
        await transporter.sendMail(mailOptions);
      }
    } catch (mailErr) {
      console.error("Failed to notify creator about new applicant:", mailErr);
    }

    return res
      .status(200)
      .json({ success: true, message: "Applied successfully" });
  } catch (error) {
    console.error("applyToTeam error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Accept an applicant (creator only)
 */
export const acceptApplicant = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { teamId, applicantId } = req.params;

    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(applicantId)
    )
      return res.status(400).json({ success: false, message: "Invalid id(s)" });

    const team = await teamModel
      .findById(teamId)
      .populate("applicants.user", "name email");
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (String(team.creator) !== String(requesterId))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const applicantIndex = (team.applicants || []).findIndex(
      (a) => a.user && String(a.user._id || a.user) === String(applicantId)
    );
    if (applicantIndex === -1)
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });

    if ((team.members?.length || 0) >= (team.maxMembers || 2))
      return res
        .status(400)
        .json({ success: false, message: "Team is already full" });

    const applicant = team.applicants[applicantIndex];
    const applicantEmail = applicant.user.email;
    const applicantName = applicant.user.name;

    team.members.push(new mongoose.Types.ObjectId(applicantId));
    team.applicants.splice(applicantIndex, 1);

    if ((team.members?.length || 0) >= (team.maxMembers || 2))
      team.isOpen = false;

    await team.save();

    try {
      if (applicantEmail) {
        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: applicantEmail,
          subject: `Accepted to "${team.name}"`,
          html: `<p>Hi ${
            applicantName || "there"
          },</p><p>Congratulations — you have been accepted to join the team "<strong>${
            team.name
          }</strong>". Welcome aboard!</p>`,
        };
        await transporter.sendMail(mailOptions);
        console.log("Acceptance email sent to:", applicantEmail);
      }
    } catch (emailError) {
      console.error("Failed to send acceptance email:", emailError);
    }

    return res
      .status(200)
      .json({ success: true, message: "Applicant accepted" });
  } catch (error) {
    console.error("acceptApplicant error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Reject an applicant (creator only)
 */
export const rejectApplicant = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { teamId, applicantId } = req.params;

    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(applicantId)
    )
      return res.status(400).json({ success: false, message: "Invalid id(s)" });

    const team = await teamModel
      .findById(teamId)
      .populate("applicants.user", "name email");
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (String(team.creator) !== String(requesterId))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const applicantIndex = (team.applicants || []).findIndex(
      (a) => a.user && String(a.user._id || a.user) === String(applicantId)
    );
    if (applicantIndex === -1)
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });

    const applicant = team.applicants[applicantIndex];
    const applicantEmail = applicant.user.email;
    const applicantName = applicant.user.name;

    team.rejectedApplicants.push({
      user: applicant.user,
      linkedin: applicant.linkedin,
      github: applicant.github,
      resume: applicant.resume,
      appliedAt: applicant.appliedAt,
      rejectedAt: new Date(),
    });
    team.applicants.splice(applicantIndex, 1);

    await team.save();

    try {
      if (applicantEmail) {
        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: applicantEmail,
          subject: `Update on your application to "${team.name}"`,
          html: `<p>Hi ${
            applicantName || "there"
          },</p><p>Thank you for applying to "<strong>${
            team.name
          }</strong>". After careful consideration, we have decided to move forward with other candidates.</p>`,
        };
        await transporter.sendMail(mailOptions);
        console.log("Rejection email sent to:", applicantEmail);
      }
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    return res
      .status(200)
      .json({ success: true, message: "Applicant rejected" });
  } catch (error) {
    console.error("rejectApplicant error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Withdraw application (applicant only)
 */
export const withdrawApplication = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    const { teamId, applicantId } = req.params;

    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(applicantId)
    )
      return res.status(400).json({ success: false, message: "Invalid id(s)" });

    // only allow withdrawing your own application
    if (String(requesterId) !== String(applicantId)) {
      return res.status(403).json({
        success: false,
        message: "Can only withdraw your own application",
      });
    }

    const team = await teamModel.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    const applicantIndex = (team.applicants || []).findIndex(
      (a) => String(a.user?._id || a.user) === String(applicantId)
    );
    if (applicantIndex === -1)
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });

    team.applicants.splice(applicantIndex, 1);
    await team.save();

    return res
      .status(200)
      .json({ success: true, message: "Application withdrawn" });
  } catch (error) {
    console.error("withdrawApplication error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
