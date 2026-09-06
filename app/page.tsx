import { Chat } from "@/components/chat/chat";

/**
 * The capstone's landing page IS the qualification chat — a visitor
 * arrives and can start chatting immediately. See lib/ai-config.ts
 * for the system prompt and app/api/chat/route.ts for the server
 * route handler that streams Claude's replies.
 */
export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <Chat />
    </main>
  );
}
