import express from "express";
import { getModel } from "../lib/geminiClient.js";

const router = express.Router();

// Retry helper with exponential backoff
async function callModelWithRetry(model, prompt, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Retry ${i + 1} after error: ${err.message}`);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}
router.post("/", async (req, res) => {
  try {
    const { product, culture, tone = "engaging" } = req.body;

    // Input validation
    if (!product || !culture || !tone) {
      return res.status(400).json({ 
        error: "Missing required fields: product, culture, or tone" 
      });
    }

    // Build prompt dynamically
    const prompt = `
Write an attractive product description for the following product: ${product}.
Target audience / culture: ${culture}.
Tone of writing: ${tone}.
Make it engaging, persuasive, and culturally relevant.
`;

    let result;
    try {
      // Primary model: flash
      const model = getModel("gemini-2.5-flash");
      result = await callModelWithRetry(model, prompt);
    } catch (err) {
      console.warn("⚠️ Flash model overloaded, switching to gemini-2.5:", err.message);
      // Fallback model
      const fallbackModel = getModel("gemini-2.5");
      result = await callModelWithRetry(fallbackModel, prompt);
    }

    const text = result.response?.text?.() || "";

    res.json({ text });
  } catch (err) {
    console.error("❌ Description Error:", err);
    res.status(503).json({
      error: "AI server is busy. Please try again in a few seconds.",
    });
  }
});

export default router;