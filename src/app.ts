import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Blood Donation API is running",
    data: null,
  });
});

export default app;