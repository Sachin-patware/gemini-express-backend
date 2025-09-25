// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

import descriptionRoute from "./routes/description.js";
import translationRoute from "./routes/translation.js";
import storytellingRoute from "./routes/storytelling.js";
import marketingRoute from "./routes/marketing.js"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;


const MONGO_URI = process.env.MONGO_URI;


if (!MONGO_URI) {
  throw new Error("⚠️ Please add MONGO_URI to your .env file");
}

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

// Routes
app.use("/api/description", descriptionRoute);
app.use("/api/translation", translationRoute);
app.use("/api/storytelling", storytellingRoute);
app.use("/api/marketing", marketingRoute);


app.get("/", (req, res) => res.json({ ok: true, timestamp: Date.now() }));

// Connect MongoDB & start server
mongoose
  .connect(MONGO_URI) // options no longer needed
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
