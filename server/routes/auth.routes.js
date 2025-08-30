import express from "express";
import {
  isAuthenticated,
  login,
  logout,
  register,
  resetPassword,
  sendPasswordResetOtp,
  sendVerifyOtp,
  verifyEmail,
} from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/sendVerifyOtp", userAuth, sendVerifyOtp);
authRouter.post("/verifyAccount", userAuth, verifyEmail);
authRouter.post("/isAuthenticated", userAuth, isAuthenticated);
authRouter.post("/sendResetOtp", sendPasswordResetOtp);
authRouter.post("/resetPassword", resetPassword);

export default authRouter;
