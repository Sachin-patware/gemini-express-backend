import express from "express";
import { getModel } from "../lib/geminiClient.js";

const router = express.Router();

// Translation API
router.post("/", async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: "Missing text or targetLang" });
    }

    
    const model = getModel("gemini-1.5-flash");

    const prompt = `Translate the following text into ${targetLang}:\n\n${text}`;

    const result = await model.generateContent(prompt);
    const translation = result.response?.text?.() || "";

    res.json({ translation });
  } catch (err) {
    console.error("❌ Translation Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
