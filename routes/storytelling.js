import express from "express";
import { getModel } from "../lib/geminiClient.js";
import gTTS from "gtts";

const router = express.Router();

// POST /api/storytelling
router.post("/", async (req, res) => {
  try {
    const { product, culture, tone = "warm and evocative" } = req.body;

    if (!product || !culture) {
      return res.status(400).json({ error: "Missing product or culture" });
    }

    const model = getModel("gemini-2.5-flash");
    const prompt = `Tell a cultural story about this product: ${product}, from ${culture}. Use a ${tone} tone and make it 3-4 short paragraphs.`;

    const result = await model.generateContent(prompt);
    const story = result.response?.text?.() || "";

    res.json({ story });
  } catch (err) {
    console.error("❌ Storytelling Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// POST /api/storytelling/tts
router.post("/tts", async (req, res) => {
  try {
    const { product, culture, tone = "warm and evocative", voiceOptions = {} } = req.body;

    if (!product || !culture) {
      return res.status(400).json({ error: "Missing product or culture" });
    }

    const model = getModel("gemini-2.5-flash");
    const prompt = `Tell a cultural story about this product: ${product}, from ${culture}. Use a ${tone} tone and keep it under ~250 words.`;

    const result = await model.generateContent(prompt);
    const story = result.response?.text?.() || "No story generated.";

    // ✅ Fix headers before piping
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": 'attachment; filename="story.mp3"',
    });

    const gtts = new gTTS(story, voiceOptions.languageCode || "en");
    gtts.stream().pipe(res);
  } catch (err) {
    console.error("❌ TTS Story Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
