import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserProfile } from "../controllers/userController.js";

const userRouter = express.Router();
userRouter.get("/profile", userAuth, getUserProfile);

export default userRouter;
