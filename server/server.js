import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import teamRouter from "./routes/team.routes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// Support a comma-separated list of allowed frontend origins via FRONTEND_URLS
const rawFrontend = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "";
const stripTrailingSlash = (s) =>
  typeof s === "string" ? s.replace(/\/+$/, "") : s;
const allowedOrigins = rawFrontend
  .split(",")
  .map((s) => stripTrailingSlash(s.trim()))
  .filter(Boolean);

// default dev origins if none provided
const devDefaults = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];
const origins = allowedOrigins.length ? allowedOrigins : devDefaults;

console.log("Allowed frontend origins:", origins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-side requests
      const incoming = stripTrailingSlash(origin);
      if (origins.includes(incoming)) return callback(null, true);
      return callback(
        new Error(`CORS policy: origin ${origin} is not allowed`)
      );
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello User!");
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/team", teamRouter);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
