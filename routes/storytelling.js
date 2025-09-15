import express from "express";
import { getModel } from "../lib/geminiClient.js";
import gTTS from "gtts";

const router = express.Router();

// Returns text story (no DB storage)
router.post("/", async (req, res) => {
  try {
    const { product, culture, tone = "warm and evocative" } = req.body;

    if (!product || !culture) {
      return res.status(400).json({ error: "Missing product or culture" });
    }

    const model = getModel("gemini-2.5-flash");
    const prompt = `Tell a cultural story about this product: ${product}, from ${culture}. Use a ${tone} tone and make it 3-4 short paragraphs.`;

    const result = await model.generateContent(prompt); // pass string directly
    const story = result.response?.text() || "";

    res.json({ story });
  } catch (err) {
    console.error("❌ Storytelling Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// 🎧 Returns audio (mp3) of the story (no DB storage)
router.post("/tts", async (req, res) => {
  try {
    const { product, culture, tone = "warm and evocative", voiceOptions = {} } = req.body;

    if (!product || !culture) {
      return res.status(400).json({ error: "Missing product or culture" });
    }

    // 1. Generate story
    const model = getModel("gemini-2.5-flash");
    const prompt = `Tell a cultural story about this product: ${product}, from ${culture}. 
    Use a ${tone} tone and keep it under ~250 words.`;

    const result = await model.generateContent(prompt);
    const story = result.response?.text?.() || "No story generated.";

    // 2. Convert story to audio using gtts (FREE, no billing)
    const gtts = new gTTS(story, voiceOptions.languageCode || "en");
    gtts.stream().pipe(res);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": 'attachment; filename="story.mp3"',
    });
  } catch (err) {
    console.error("❌ TTS Story Error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
