import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// default middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// imports routes
import userRoutes from "./routes/user.routes.js";

// rouutes declerations
app.use("/api/v1/users", userRoutes);
// hppt://localhost:8000/api/v1/users/register
export { app };
