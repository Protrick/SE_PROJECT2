import userAuth from "../middleware/userAuth.js";
import optionalUserAuth from "../middleware/optionalUserAuth.js";
import express from "express";
import {
  createTeam,
  showAvailableTeams,
  showCreatedTeams,
  getTeamById,
  applyToTeam,
  acceptApplicant,
  rejectApplicant,
  withdrawApplication,
} from "../controllers/teamController.js";

const router = express.Router();

router.post("/", userAuth, createTeam);
router.get("/created", userAuth, showCreatedTeams);
router.get("/available", optionalUserAuth, showAvailableTeams);

router.get("/:teamId", getTeamById);
router.post("/:teamId/apply", userAuth, applyToTeam);
router.post("/:teamId/accept/:applicantId", userAuth, acceptApplicant);
router.post("/:teamId/reject/:applicantId", userAuth, rejectApplicant);
router.post("/:teamId/withdraw/:applicantId", userAuth, withdrawApplication);

export default router;
