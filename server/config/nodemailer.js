import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: process.env.SENDER_EMAIL, // your email from .env
    pass: process.env.SENDER_PASSWORD, // your app password from .env
  },
});

// export const sendEmail = async (to, subject, html) => {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: to,
//       subject: subject,
//       html: html,
//     };

//     const result = await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully:", result.messageId);
//     return result;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw error;
//   }
// };
