// lib/geminiClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
// Load API key from environment
const apiKey = process.env.GEMINI_API_KEY;


if (!apiKey) {
  throw new Error("⚠️ GEMINI_API_KEY is missing! Please add it to your .env file.");
}

// Singleton instance
let genAI = null;

/**
 * Get initialized GoogleGenerativeAI client
 */
export function getGenAI() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Get a generative model by name
 * @param {string} name - Model name (e.g., "gemini-2.5-flash", "gemini-2.5-pro")
 */
export function getModel(name = "gemini-2.5-flash") {
  const client = getGenAI();
  return client.getGenerativeModel({ model: name });
}
