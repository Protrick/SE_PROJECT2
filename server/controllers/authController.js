import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import usermodel from "../models/user.model.js";
import dotenv from "dotenv";
import { transporter } from "../config/nodemailer.js"; // Fixed: use named import
dotenv.config();

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Please fill all the fields" });
  }
  try {
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new usermodel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const domainValue = user.domain
      ? String(user.domain).trim().toLowerCase()
      : String(user.email).split("@")[1]?.trim().toLowerCase();
    const tokenPayload = { id: user._id, domain: domainValue };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send welcome email using the imported sendEmail function
    try {
      const welcomeSubject = "Welcome to Team Formation Platform!";
      const welcomeHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome! 🎉</h1>
          </div>
          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Thank you for registering with our Team Formation Platform. Your account has been created successfully.
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #667eea;">Your Account Details:</h3>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              You can now start creating teams or join existing ones. Explore the platform and find your perfect team match!
            </p>
          </div>
        </div>
      `;

      await sendEmail(email, welcomeSubject, welcomeHtml);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the registration if email fails
    }

    return res.json({ success: true, message: "User created successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "Please fill all the fields" });
  }
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const domainValue = user.domain
      ? String(user.domain).trim().toLowerCase()
      : String(user.email).split("@")[1]?.trim().toLowerCase();
    const tokenPayload = { id: user._id, domain: domainValue };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ success: true, message: "Login successful" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// send verification OTP to the user's email
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Resolved userId from token:", userId);

    const user = await usermodel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account already verified",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send OTP email using the imported sendEmail function
    try {
      const otpSubject = "Account Verification OTP";
      const otpHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Verify Your Account</h1>
          </div>
          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Hello ${user.name}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Please use the following OTP to verify your account:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #667eea;">
              <h2 style="margin: 0; color: #667eea; font-size: 32px; letter-spacing: 5px;">${otp}</h2>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              This OTP will expire in 15 minutes. Please do not share this code with anyone.
            </p>
          </div>
        </div>
      `;

      await sendEmail(user.email, otpSubject, otpHtml);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendVerifyOtp error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { otp } = req.body;

    if (!userId || !otp) {
      return res.json({
        success: false,
        message: "Please provide userId and OTP",
      });
    }
    try {
      const user = await usermodel.findById(userId);
      if (!user) {
        return res.json({ success: false, message: "User not found" });
      }
      if (user.verifyOtp === "" || user.verifyOtp !== otp) {
        return res.json({ success: false, message: "Invalid OTP" });
      }
      if (user.verifyOtpExpireAt < Date.now()) {
        return res.json({ success: false, message: "OTP expired" });
      }
      user.isAccountVerified = true;
      user.verifyOtp = "";
      user.verifyOtpExpireAt = 0;
      await user.save();
      return res.json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//send password reset otp
export const sendPasswordResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Please provide an email" });
  }
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send password reset OTP email
    try {
      const resetSubject = "Password Reset OTP";
      const resetHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
          </div>
          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Hello ${user.name}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              You requested to reset your password. Please use the following OTP:
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #ff6b6b;">
              <h2 style="margin: 0; color: #ff6b6b; font-size: 32px; letter-spacing: 5px;">${otp}</h2>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              This OTP will expire in 15 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `;

      await sendEmail(email, resetSubject, resetHtml);
    } catch (emailError) {
      console.error("Failed to send reset OTP email:", emailError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendPasswordResetOtp error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//reset user password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Please fill all the fields" });
  }
  try {
    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp || user.resetOtp === "") {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
