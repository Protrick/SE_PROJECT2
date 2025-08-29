import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import teamRouter from "./routes/team.routes.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// normalize FRONTEND_URL (remove trailing slash) and provide a sensible default
const allowedOrigin = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).replace(/\/+$/, "");
console.log("Allowed frontend origin:", allowedOrigin);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server, curl, etc.
      if (origin === allowedOrigin) return callback(null, true);
      return callback(new Error("CORS policy: Origin not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello User!");
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/team", teamRouter);

// serve client build if present
const clientDist = path.join(process.cwd(), "client", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  // let API routes pass through
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next(err);
  });
});

async function connectDB() {
  try {
    // remove deprecated options -- let mongoose use defaults
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectDB();

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
