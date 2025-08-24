import express from "express";
import userAuth from "../middleware/userAuth.js";
import optionalUserAuth from "../middleware/optionalUserAuth.js";
import {
  createTeam,
  applyToTeam,
  acceptApplicant,
  rejectApplicant,
  withdrawApplication,
  getTeamById,
  showCreatedTeams,
  showAvailableTeams,
  appliedTeams,
} from "../controllers/teamController.js";

const router = express.Router();

// Create a new team (protected)
router.post("/", userAuth, createTeam);
// list teams created by the authenticated user
router.get("/created", userAuth, showCreatedTeams);
 // list available teams (optionally filtered by domain via ?domain=...)
router.get("/available", optionalUserAuth, showAvailableTeams);
// Apply to a team (require auth and links)
router.post("/:teamId/apply", userAuth, applyToTeam);
// get team by id
router.get("/:teamId", userAuth, getTeamById);
// list teams the user has applied to
router.get("/applied", userAuth, appliedTeams);
// Creator accepts/rejects applicant
router.post(
  "/:teamId/applicants/:applicantId/accept",
  userAuth,
  acceptApplicant
);
router.post(
  "/:teamId/applicants/:applicantId/reject",
  userAuth,
  rejectApplicant
);
// Applicant withdraws their application
router.post(
  "/:teamId/applicants/:applicantId/withdraw",
  userAuth,
  withdrawApplication
);

export default router;
