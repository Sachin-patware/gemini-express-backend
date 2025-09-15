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
    const { product, brief } = req.body;

    if (!product || !brief) {
      return res.status(400).json({ error: "Missing product name or brief description" });
    }

    const prompt = `Write an attractive product description for the following product: ${product}. 
Brief description: ${brief}. Make it engaging and persuasive.`;

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
