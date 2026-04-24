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
import healthCheckRouter from "./routes/healthCheck.route.js";

// rouutes declerations Routing Decoupling structure
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/health", healthCheckRouter);

export { app };
