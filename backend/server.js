import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getCodeReview } from "./groqService.js";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.post("/api/review", async (req, res) => {
  const { code, language } = req.body || {};

  if (!code || typeof code !== "string") {
    return res.status(400).json({
      error: "Code cannot be empty",
    });
  }

  try {
    const review = await getCodeReview({
      code,
      language: language || "unknown",
    });

    if (!review || !review.trim()) {
      return res.status(500).json({
        error: "The model did not return any review content",
      });
    }

    return res.json({
      review,
    });
  } catch (err) {
    console.error("Error in /api/review:", err);
    return res.status(500).json({
      error: "An error occurred while processing the code review",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
