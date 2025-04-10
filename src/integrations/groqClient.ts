import { Groq } from "groq-sdk";

// Use Vite environment variables
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("Missing Groq API Key in environment variables");
}

// Create Groq client
export const groq = new Groq({
  apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true
});
