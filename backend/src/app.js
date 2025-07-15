import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import path from "path";
import errorHandler from "./app/middleware/errorHandler.js";
import prisma from "./app/prisma/client.js";
import { router } from "./app/router/index.js";
import passport from "passport";
import { envVars } from "./app/config/env.js";
//Must be import after importing passport
import "./app/config/passport.js";
dotenv.config();

const app = express();

app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Attach prisma to app (optional but useful)
app.set("prisma", prisma);

// Global middleware
app.use(cors());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json());

// Attach prisma to request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use("/api", router);

// Health check
app.get("/", (req, res) => {
  res.send("<h1>My Scholar Hack API is running...⚡</h1>");
});

// Route not found handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler (always last)
app.use(errorHandler);

export default app;
