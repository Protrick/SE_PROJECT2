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

// Use FRONTEND_URL (single origin) if provided; otherwise default to the requested dev origin.
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5175";

console.log("Allowed frontend origin:", allowedOrigin);

app.use(
  cors({
    origin: allowedOrigin,
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
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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
