import mongoose from "mongoose";
import dotenv from "dotenv";
import teamModel from "../models/team.model.js";
import transporter from "../config/nodemailer.js";

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

    console.log("Fetching teams for creator:", requesterId);

    const teams = await teamModel
      .find({ creator: new mongoose.Types.ObjectId(requesterId) })
      .populate("creator", "name email")
      .populate("members", "name email")
      .populate("applicants.user", "name email")
      .populate("rejectedApplicants.user", "name email")
      .sort({ createdAt: -1 });

    console.log("Found teams with applicants:", teams.map(t => ({
      name: t.name,
      applicantsCount: t.applicants?.length || 0,
      applicants: t.applicants?.map(a => ({ user: a.user?.name, appliedAt: a.appliedAt }))
    })));

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
  console.log("=== applyToTeam START ===");
  console.log("User ID:", req.user?.id);
  console.log("Team ID:", req.params.teamId);
  console.log("Request body:", req.body);
  
  try {
    const requesterId = req.user?.id;
    if (!requesterId) {
      console.log("ERROR: No requesterId found");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { teamId } = req.params;
    const { linkedin, github, resume } = req.body;

    console.log("Extracted data:", { teamId, linkedin, github, resume });

    // Validate teamId
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      console.log("ERROR: Invalid teamId format");
      return res.status(400).json({ success: false, message: "Invalid teamId" });
    }

    // Validate required fields
    if (!linkedin || !github || !resume) {
      console.log("ERROR: Missing required fields");
      return res.status(400).json({ 
        success: false, 
        message: "LinkedIn, GitHub, and Resume links are required" 
      });
    }

    console.log("Finding team by ID:", teamId);
    const team = await teamModel
      .findById(teamId)
      .populate("creator", "name email");
    
    if (!team) {
      console.log("ERROR: Team not found");
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    console.log("Team found:", {
      id: team._id,
      name: team.name,
      creator: team.creator,
      membersCount: team.members?.length || 0,
      applicantsCount: team.applicants?.length || 0
    });

    // Check if user is the creator
    const creatorId = String(team.creator._id || team.creator);
    if (creatorId === String(requesterId)) {
      console.log("ERROR: User trying to apply to own team");
      return res.status(400).json({ success: false, message: "Cannot apply to your own team" });
    }

    // Check if already a member
    const isMember = (team.members || []).some(
      (m) => String(m._id || m) === String(requesterId)
    );
    if (isMember) {
      console.log("ERROR: User is already a member");
      return res.status(400).json({ success: false, message: "Already a member" });
    }

    // Check if already applied
    const hasApplied = (team.applicants || []).some(
      (a) => String(a.user?._id || a.user) === String(requesterId)
    );
    if (hasApplied) {
      console.log("ERROR: User has already applied");
      return res.status(400).json({ success: false, message: "Already applied" });
    }

    // Check if previously rejected
    const wasRejected = (team.rejectedApplicants || []).some(
      (a) => String(a.user?._id || a.user) === String(requesterId)
    );
    if (wasRejected) {
      console.log("ERROR: User was previously rejected");
      return res.status(400).json({ success: false, message: "Application previously rejected" });
    }

    // Check if team is full
    if ((team.members?.length || 0) >= (team.maxMembers || 2)) {
      console.log("ERROR: Team is full");
      return res.status(400).json({ success: false, message: "Team is full" });
    }

    console.log("All validations passed. Creating applicant object...");

    const applicant = {
      user: new mongoose.Types.ObjectId(requesterId),
      linkedin: String(linkedin).trim(),
      github: String(github).trim(),
      resume: String(resume).trim(),
      appliedAt: new Date(),
    };

    console.log("Applicant object created:", applicant);
    console.log("Current applicants count before adding:", team.applicants?.length || 0);

    // Add applicant to team
    team.applicants.push(applicant);
    
    console.log("Applicant added to array. New count:", team.applicants.length);
    console.log("Saving team...");

    // Use updateOne to avoid validating the entire document
    await teamModel.updateOne(
      { _id: teamId },
      { $push: { applicants: applicant } }
    );

    console.log("Team saved successfully! Final applicants count:", team.applicants.length);

    // Send email notification (non-blocking)
    try {
      if (team.creator && team.creator.email && team.name) {
        console.log("Sending notification email to:", team.creator.email);
        console.log("Team name for email:", team.name);
        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: team.creator.email,
          subject: `New application for "${team.name}"`,
          text: `User applied to your team.\n\nTeam: ${team.name}\nApplicant ID: ${requesterId}`,
        };
        await transporter.sendMail(mailOptions);
        console.log("Notification email sent successfully");
      } else {
        console.log("Missing data for email:", {
          hasCreator: !!team.creator,
          hasEmail: !!team.creator?.email,
          hasTeamName: !!team.name,
          teamName: team.name
        });
      }
    } catch (mailErr) {
      console.error("Failed to send notification email:", mailErr);
      // Don't fail the request if email fails
    }

    console.log("=== applyToTeam SUCCESS ===");
    return res.status(200).json({ success: true, message: "Applied successfully" });

  } catch (error) {
    console.error("=== applyToTeam ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({ 
        success: false, 
        message: "Validation error: " + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    if (error.name === 'CastError') {
      console.error("Cast error:", error);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid data format" 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Internal server error: " + error.message
    });
  }
};

/**
 * Accept an applicant (creator only)
 */
export const acceptApplicant = async (req, res) => {
  console.log("=== acceptApplicant START ===");
  console.log("User ID:", req.user?.id);
  console.log("Team ID:", req.params.teamId);
  console.log("Applicant ID:", req.params.applicantId);
  
  try {
    const requesterId = req.user?.id;
    const { teamId, applicantId } = req.params;

    if (!requesterId) {
      console.log("ERROR: No requesterId found");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(applicantId)
    ) {
      console.log("ERROR: Invalid ID format");
      return res.status(400).json({ success: false, message: "Invalid id(s)" });
    }

    console.log("Finding team and populating applicants...");
    const team = await teamModel
      .findById(teamId)
      .populate("applicants.user", "name email");
    
    if (!team) {
      console.log("ERROR: Team not found");
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    console.log("Team found:", {
      id: team._id,
      name: team.name,
      creator: team.creator,
      membersCount: team.members?.length || 0,
      applicantsCount: team.applicants?.length || 0,
      maxMembers: team.maxMembers
    });

    if (String(team.creator) !== String(requesterId)) {
      console.log("ERROR: User is not the creator");
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const applicantIndex = (team.applicants || []).findIndex(
      (a) => a.user && String(a.user._id || a.user) === String(applicantId)
    );
    
    if (applicantIndex === -1) {
      console.log("ERROR: Applicant not found in team");
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }

    if ((team.members?.length || 0) >= (team.maxMembers || 2)) {
      console.log("ERROR: Team is already full");
      return res
        .status(400)
        .json({ success: false, message: "Team is already full" });
    }

    const applicant = team.applicants[applicantIndex];
    const applicantEmail = applicant.user.email;
    const applicantName = applicant.user.name;

    console.log("Applicant to accept:", {
      id: applicantId,
      name: applicantName,
      email: applicantEmail
    });

    // Use atomic operations to avoid validation errors
    const updateResult = await teamModel.updateOne(
      { _id: teamId },
      {
        $push: { members: new mongoose.Types.ObjectId(applicantId) },
        $pull: { applicants: { user: new mongoose.Types.ObjectId(applicantId) } }
      }
    );

    console.log("Update result:", updateResult);

    // Check if team should be closed (separately to avoid validation issues)
    const updatedTeam = await teamModel.findById(teamId);
    if ((updatedTeam.members?.length || 0) >= (updatedTeam.maxMembers || 2)) {
      await teamModel.updateOne(
        { _id: teamId },
        { isOpen: false }
      );
      console.log("Team marked as closed (full)");
    }

    // Send acceptance email (non-blocking)
    try {
      if (applicantEmail && team.name) {
        console.log("Sending acceptance email with team name:", team.name);
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
      } else {
        console.log("Missing data for acceptance email:", {
          hasEmail: !!applicantEmail,
          hasTeamName: !!team.name,
          teamName: team.name
        });
      }
    } catch (emailError) {
      console.error("Failed to send acceptance email:", emailError);
    }

    console.log("=== acceptApplicant SUCCESS ===");
    return res
      .status(200)
      .json({ success: true, message: "Applicant accepted" });
  } catch (error) {
    console.error("=== acceptApplicant ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({ 
        success: false, 
        message: "Validation error: " + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    return res
      .status(500)
      .json({ success: false, message: "Internal server error: " + error.message });
  }
};

/**
 * Reject an applicant (creator only)
 */
export const rejectApplicant = async (req, res) => {
  console.log("=== rejectApplicant START ===");
  console.log("User ID:", req.user?.id);
  console.log("Team ID:", req.params.teamId);
  console.log("Applicant ID:", req.params.applicantId);
  
  try {
    const requesterId = req.user?.id;
    const { teamId, applicantId } = req.params;

    if (!requesterId) {
      console.log("ERROR: No requesterId found");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(applicantId)
    ) {
      console.log("ERROR: Invalid ID format");
      return res.status(400).json({ success: false, message: "Invalid id(s)" });
    }

    console.log("Finding team and populating applicants...");
    const team = await teamModel
      .findById(teamId)
      .populate("applicants.user", "name email");
      
    if (!team) {
      console.log("ERROR: Team not found");
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    console.log("Team found:", {
      id: team._id,
      name: team.name,
      creator: team.creator,
      applicantsCount: team.applicants?.length || 0
    });

    if (String(team.creator) !== String(requesterId)) {
      console.log("ERROR: User is not the creator");
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const applicantIndex = (team.applicants || []).findIndex(
      (a) => a.user && String(a.user._id || a.user) === String(applicantId)
    );
    
    if (applicantIndex === -1) {
      console.log("ERROR: Applicant not found in team");
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }

    const applicant = team.applicants[applicantIndex];
    const applicantEmail = applicant.user.email;
    const applicantName = applicant.user.name;

    console.log("Applicant to reject:", {
      id: applicantId,
      name: applicantName,
      email: applicantEmail
    });

    // Create rejected applicant object
    const rejectedApplicant = {
      user: applicant.user._id || applicant.user,
      linkedin: applicant.linkedin,
      github: applicant.github,
      resume: applicant.resume,
      appliedAt: applicant.appliedAt,
      rejectedAt: new Date(),
    };

    // Use atomic operations to avoid validation errors
    const updateResult = await teamModel.updateOne(
      { _id: teamId },
      {
        $push: { rejectedApplicants: rejectedApplicant },
        $pull: { applicants: { user: new mongoose.Types.ObjectId(applicantId) } }
      }
    );

    console.log("Update result:", updateResult);

    // Send rejection email (non-blocking)
    try {
      if (applicantEmail && team.name) {
        console.log("Sending rejection email with team name:", team.name);
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
      } else {
        console.log("Missing data for rejection email:", {
          hasEmail: !!applicantEmail,
          hasTeamName: !!team.name,
          teamName: team.name
        });
      }
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    console.log("=== rejectApplicant SUCCESS ===");
    return res
      .status(200)
      .json({ success: true, message: "Applicant rejected" });
  } catch (error) {
    console.error("=== rejectApplicant ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({ 
        success: false, 
        message: "Validation error: " + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    return res
      .status(500)
      .json({ success: false, message: "Internal server error: " + error.message });
  }
};

/**
 * Withdraw application (applicant only)
 */
export const withdrawApplication = async (req, res) => {
  console.log("=== withdrawApplication START ===");
  console.log("User ID:", req.user?.id);
  console.log("Team ID:", req.params.teamId);
  console.log("Applicant ID:", req.params.applicantId);
  
  try {
    const requesterId = req.user?.id;
    const { teamId, applicantId } = req.params;

    if (!requesterId) {
      console.log("ERROR: No requesterId found");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(applicantId)
    ) {
      console.log("ERROR: Invalid ID format");
      return res.status(400).json({ success: false, message: "Invalid id(s)" });
    }

    // only allow withdrawing your own application
    if (String(requesterId) !== String(applicantId)) {
      console.log("ERROR: User trying to withdraw someone else's application");
      return res.status(403).json({
        success: false,
        message: "Can only withdraw your own application",
      });
    }

    console.log("Finding team...");
    const team = await teamModel.findById(teamId);
    if (!team) {
      console.log("ERROR: Team not found");
      return res
        .status(404)
        .json({ success: false, message: "Team not found" });
    }

    console.log("Team found:", {
      id: team._id,
      name: team.name,
      applicantsCount: team.applicants?.length || 0
    });

    const applicantIndex = (team.applicants || []).findIndex(
      (a) => String(a.user?._id || a.user) === String(applicantId)
    );
    
    if (applicantIndex === -1) {
      console.log("ERROR: Application not found");
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    console.log("Application found, withdrawing...");

    // Use atomic operation to avoid validation errors
    const updateResult = await teamModel.updateOne(
      { _id: teamId },
      { $pull: { applicants: { user: new mongoose.Types.ObjectId(applicantId) } } }
    );

    console.log("Update result:", updateResult);
    console.log("=== withdrawApplication SUCCESS ===");

    return res
      .status(200)
      .json({ success: true, message: "Application withdrawn" });
  } catch (error) {
    console.error("=== withdrawApplication ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({ 
        success: false, 
        message: "Validation error: " + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    return res
      .status(500)
      .json({ success: false, message: "Internal server error: " + error.message });
  }
};
