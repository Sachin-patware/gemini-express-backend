import express from "express";
import { getModel } from "../lib/geminiClient.js";

const router = express.Router();

// Retry helper with exponential backoff
async function callModelWithRetry(model, prompt, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Retry ${i + 1} after error: ${err.message}`);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2; // exponential backoff
    }
  }
}

router.post("/", async (req, res) => {
  try {
    const { product, platform = "Instagram", tone = "catchy and concise" } = req.body;

    if (!product) {
      return res.status(400).json({ error: "Missing product name" });
    }

    // Build prompt using only product input
    const prompt = `Generate a ${tone} ${platform} post to market this product: ${product}.
Include hashtags and a 1-line call-to-action.`;

    let result;
    try {
      // Primary model: flash
      const model = getModel("gemini-2.5-flash");
      result = await callModelWithRetry(model, prompt);
    } catch (err) {
      console.warn("⚠️ Flash model overloaded, switching to gemini-1.5:", err.message);
      // Fallback to gemini-1.5
      const fallbackModel = getModel("gemini-2.5");
      result = await callModelWithRetry(fallbackModel, prompt);
    }

    const post = result.response?.text?.() || "";

    // Return generated post
    res.json({ post });
  } catch (err) {
    console.error("❌ Marketing Error:", err);
    res.status(503).json({
      error: "AI server is busy. Please try again in a few seconds.",
    });
  }
});

export default router;
