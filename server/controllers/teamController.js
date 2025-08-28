import mongoose from "mongoose";
import teamModel from "../models/team.model.js";
import { transporter } from "../config/nodemailer.js";
import { configDotenv } from "dotenv";
configDotenv();

// Create a team for a specific domain
export const createTeam = async (req, res) => {
  try {
    const creatorId = req.user?.id;
    let { name, domain, description = "" } = req.body;

    if (!creatorId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!name || !domain)
      return res
        .status(400)
        .json({ success: false, message: "Name and domain are required" });

    // validate creator id
    if (!mongoose.Types.ObjectId.isValid(creatorId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid creator id" });

    const creatorObjId = new mongoose.Types.ObjectId(creatorId);

    const team = await teamModel.create({
      creator: creatorObjId,
      name,
      domain,
      description,
      maxMembers: 2,
      members: [creatorObjId],
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

export const showCreatedTeams = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!mongoose.Types.ObjectId.isValid(requesterId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }

    const creatorObjId = new mongoose.Types.ObjectId(requesterId);

    // Find all teams where the authenticated user is the creator
    const teams = await teamModel
      .find({ creator: creatorObjId })
      .populate("creator", "name email")
      .populate("applicants.user", "name email")
      .populate("rejectedApplicants.user", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error("showCreated error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const showAvailableTeams = async (req, res) => {
  try {
    const requesterId = req.user?.id; // may be undefined for anonymous callers

    // Get domain: prefer explicit query param; otherwise, if user is authenticated and has a domain, use that.
    let domain =
      (req.query && req.query.domain) ||
      (req.user?.domain ? String(req.user.domain) : undefined);

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "domain query parameter is required",
      });
    }

    domain = String(domain).trim().toLowerCase();

    // Base filter: open teams in the requested domain
    const query = { isOpen: true, domain };

    // Exclude teams created by the requester (if authenticated)
    if (requesterId && mongoose.Types.ObjectId.isValid(requesterId)) {
      query.creator = { $ne: new mongoose.Types.ObjectId(requesterId) };
    }

    const teams = await teamModel
      .find(query)
      .populate("creator", "name email")
      .populate("applicants.user", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error("showAvailableTeams error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const applyToTeam = async (req, res) => {
  try {
    const applicantId = req.user?.id;
    const { teamId } = req.params;
    let { linkedin, github, resume } = req.body;

    if (!applicantId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!teamId || !mongoose.Types.ObjectId.isValid(teamId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid team id" });

    if (!linkedin || !github || !resume)
      return res.status(400).json({
        success: false,
        message: "linkedin, github and resume are required",
      });

    // basic URL normalization/validation
    const normalize = (u) => (typeof u === "string" ? u.trim() : "");
    linkedin = normalize(linkedin);
    github = normalize(github);
    resume = normalize(resume);

    // simple URL checks (can be improved with full regex or validator lib)
    if (
      !linkedin.startsWith("http") ||
      !github.startsWith("http") ||
      !resume.startsWith("http")
    ) {
      return res.status(400).json({
        success: false,
        message: "Links must be valid URLs starting with http/https",
      });
    }

    const requesterId = req.user?.id;
    const team = await teamModel
      .findById(teamId)
      .populate("creator", "name email");

    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    // Prevent applying to own team
    if (
      requesterId &&
      String(team.creator?._id || team.creator) === String(requesterId)
    ) {
      return res
        .status(409)
        .json({ success: false, message: "Cannot apply to your own team" });
    }

    // Prevent duplicate application
    const alreadyApplied = (team.applicants || []).some(
      (a) => String(a.user?._id || a.user) === String(requesterId)
    );
    if (alreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this team",
      });
    }

    // Also prevent if already a member
    const isMember = (team.members || []).some(
      (m) => String(m._id || m) === String(requesterId)
    );
    if (isMember) {
      return res.status(409).json({
        success: false,
        message: "You are already a member of this team",
      });
    }

    // push applicant subdocument
    team.applicants.push({
      user: new mongoose.Types.ObjectId(applicantId),
      linkedin,
      github,
      resume,
    });
    await team.save();

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

export const appliedTeams = async (req, res) => {
  try {
    const requesterId = req.user?.id;
    if (!requesterId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    console.log("appliedTeams - Looking for user:", requesterId);

    // Find teams where user is either:
    // 1. In applicants array (pending)
    // 2. In members array (accepted)
    // 3. In rejectedApplicants array (rejected)
    const teams = await teamModel
      .find({
        $or: [
          { "applicants.user": new mongoose.Types.ObjectId(requesterId) },
          { members: new mongoose.Types.ObjectId(requesterId) },
          {
            "rejectedApplicants.user": new mongoose.Types.ObjectId(requesterId),
          },
        ],
      })
      .populate("creator", "name email")
      .populate("applicants.user", "name email")
      .populate("rejectedApplicants.user", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    console.log("appliedTeams - Found teams:", teams.length);

    return res.status(200).json({ success: true, teams });
  } catch (error) {
    console.error("appliedTeams error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId || !mongoose.Types.ObjectId.isValid(teamId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid team id" });

    const team = await teamModel
      .findById(teamId)
      .populate("creator", "name email")
      .populate("applicants.user", "name email")
      .populate("rejectedApplicants.user", "name email")
      .populate("members", "name email");

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

    // Populate the team with applicant user details to get their email
    const team = await teamModel
      .findById(teamId)
      .populate("applicants.user", "name email");
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (String(team.creator) !== String(requesterId))
      return res.status(403).json({ success: false, message: "Forbidden" });

    // find applicant subdoc
    const applicantIndex = team.applicants.findIndex(
      (a) => a.user && String(a.user._id || a.user) === String(applicantId)
    );
    if (applicantIndex === -1)
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });

    // Get the applicant's details before removing from array
    const applicant = team.applicants[applicantIndex];
    const applicantEmail = applicant.user.email;
    const applicantName = applicant.user.name;

    // check capacity
    if ((team.members?.length || 0) >= (team.maxMembers || 2)) {
      return res
        .status(400)
        .json({ success: false, message: "Team is already full" });
    }

    // add to members
    team.members.push(new mongoose.Types.ObjectId(applicantId));
    // remove from applicants
    team.applicants.splice(applicantIndex, 1);

    // close team if full
    if ((team.members?.length || 0) >= (team.maxMembers || 2))
      team.isOpen = false;

    await team.save();

    // Send email to the ACCEPTED APPLICANT (not the team creator)
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: applicantEmail, // Fixed: was requesterId, should be applicantEmail
      subject: "Congratulations! You've been accepted to the team",
      text: `Hi ${applicantName},\n\nCongratulations! You have been accepted to join the team "${team.name}".\n\nWelcome aboard!\n\nBest regards,\nThe Team`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Acceptance email sent to:", applicantEmail); // Fixed: was requesterId
    } catch (emailError) {
      console.error("Failed to send acceptance email:", emailError);
      // Don't fail the acceptance if email fails - just log it
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

    // Populate the team with applicant user details to get their email
    const team = await teamModel
      .findById(teamId)
      .populate("applicants.user", "name email");
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    if (String(team.creator) !== String(requesterId))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const applicantIndex = team.applicants.findIndex(
      (a) => a.user && String(a.user._id || a.user) === String(applicantId)
    );
    if (applicantIndex === -1)
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });

    // Get the applicant's details before moving to rejected
    const applicant = team.applicants[applicantIndex];
    const applicantEmail = applicant.user.email;
    const applicantName = applicant.user.name;

    // Move applicant to rejectedApplicants so they can still see they were rejected
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

    // Send rejection email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: applicantEmail,
      subject: "Update on your team application",
      text: `Hi ${applicantName},\n\nThank you for your interest in joining the team "${team.name}". After careful consideration, we have decided to move forward with other candidates at this time.\n\nWe appreciate the time you took to apply and encourage you to apply for other opportunities.\n\nBest regards,\nThe Team`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Rejection email sent to:", applicantEmail);
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
      // Don't fail the rejection if email fails - just log it
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

export const withdrawApplication = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { teamId, applicantId } = req.params;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(applicantId)
    )
      return res.status(400).json({ success: false, message: "Invalid id(s)" });

    // Only allow applicant to withdraw their own application
    if (userId !== applicantId)
      return res.status(403).json({ success: false, message: "Forbidden" });

    const team = await teamModel.findById(teamId);
    if (!team)
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });

    const applicantIndex = team.applicants.findIndex(
      (a) => a.user && a.user.toString() === applicantId
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
