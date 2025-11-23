// Import required modules
import express from "express";
import connectDB from "./lib/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Create __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an instance of Express
const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://digilasersa-admin.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

// Connect DB
connectDB();

// Default route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Example API route
app.get("/api/test", (req, res) => {
  res.json({ message: "API working fine" });
});

// Start server
const port = 8000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
