import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import usermodel from "../models/user.model.js";
import dotenv from "dotenv";
import transporter from "../config/nodemailer.js";
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Our App!",
      text: "Hello! Thanks for registering with us. with your email: " + email,
    };

    await transporter.sendMail(mailOptions);
    //sending welcome email
    // await SENDMAIL(email);
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// send verification OTP to  the user's email
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
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification otp",
      text: `Hello! Thanks for registering with us. Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

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
    const userId = req.user?.id; // ✅ Get from token, not from req.body
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

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);

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
