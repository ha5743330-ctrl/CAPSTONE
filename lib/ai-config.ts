/**
 * lib/ai-config.ts
 * ------------------------------------------------------------------
 * Single source of truth for everything related to the AI model used
 * by the "Lead Qualification Chat" (the capstone's central AI feature).
 *
 * FE-06 asks for this in "one well-commented module" so it's easy to
 * find and extend later (FE-07 builds directly on top of this file).
 * ------------------------------------------------------------------
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * PROVIDER SWITCH
 * ------------------------------------------------------------------
 * The Anthropic API is paid (no ongoing free tier). Google's Gemini
 * API has a genuine free tier (no card required) via AI Studio, so
 * it's used here as the default for local development/testing.
 *
 * To go back to Claude once you have API credits, just set
 * AI_PROVIDER=anthropic in .env.local — nothing else in the app
 * needs to change, since every other file only imports CHAT_MODEL
 * from this module.
 * ------------------------------------------------------------------
 */
const provider = process.env.AI_PROVIDER ?? "google";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

/**
 * The exact model used for the chat. Centralizing this means
 * upgrading models later (e.g. for FE-07), or switching provider
 * back to Claude, is a one-line change.
 */
export const CHAT_MODEL =
  provider === "anthropic"
    ? anthropic("claude-sonnet-4-6")
    : google("gemini-3.6-flash");

/**
 * The system prompt that defines the assistant's role and behavior.
 *
 * This is the "Lead Qualification Chat": a visitor lands on the
 * capstone's marketing/landing page and chats with the assistant,
 * which asks a handful of qualifying questions (budget, timeline,
 * use case) and gives the visitor a clear next step.
 *
 * Keep this prompt here — not inline in the route handler — so it's
 * easy to review and tune independently of the streaming logic.
 */
export const SYSTEM_PROMPT = `
You are the AI assistant for a product landing page. Your job is to
have a short, friendly conversation with a website visitor to
understand whether they are a good fit for the product, and then
guide them to a clear next step (e.g. "book a call" or "start a free
trial").

Guidelines:
- Ask ONE qualifying question at a time. Don't interrogate the visitor
  with a list of questions in a single message.
- Useful things to learn (in a natural, conversational way, not as a
  checklist read aloud to the visitor): what problem they're trying to
  solve, roughly how big their team/company is, and their timeline.
- Keep every reply short: 2-4 sentences, plain language, no jargon.
- Once you have a reasonable picture (usually after 2-3 exchanges),
  summarize what you understood in one sentence and suggest a concrete
  next step.
- Be warm and helpful, never pushy or salesy.
- If the visitor asks something unrelated to the product, answer
  briefly and steer the conversation back.
`.trim();

/**
 * Max number of turns the model is allowed to think/respond in a
 * single request. Kept small since this is a simple qualification
 * chat with no tool calls.
 */
export const MAX_OUTPUT_TOKENS = 512;
