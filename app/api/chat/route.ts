/**
 * app/api/chat/route.ts
 * ------------------------------------------------------------------
 * The ONLY place the app talks to Anthropic. Runs entirely on the
 * server (Next.js Route Handler), so `ANTHROPIC_API_KEY` (read inside
 * lib/ai-config.ts) never ships to the browser.
 *
 * Client -> POST { messages: UIMessage[] } -> this route
 *        <- streamed UI message chunks (text, start/finish, etc.) <-
 * ------------------------------------------------------------------
 */

import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { CHAT_MODEL, SYSTEM_PROMPT, MAX_OUTPUT_TOKENS } from "@/lib/ai-config";

// Stream responses instead of buffering the whole reply on the server.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: CHAT_MODEL,
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    // Abort the model call if the client disconnects (stop button /
    // navigating away) instead of paying for tokens no one reads.
    abortSignal: req.signal,
  });

  // toUIMessageStreamResponse() turns the raw text stream into the
  // typed "message parts" stream that useChat() on the client expects
  // (text-start / text-delta / text-end / finish, etc.).
  return result.toUIMessageStreamResponse();
}
