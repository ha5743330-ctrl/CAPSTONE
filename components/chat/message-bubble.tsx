"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { balanceMarkdown } from "@/lib/streaming-markdown";
import type { UIMessage } from "ai";

type MessageBubbleProps = {
  message: UIMessage;
  isStreaming: boolean;
};

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  // A UIMessage's content is an array of typed "parts" (text, tool
  // calls, etc). This chat only ever produces text parts, so we join
  // them, but the shape is future-proof for FE-07.
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed sm:max-w-[75%] ${
          isUser
            ? "rounded-br-sm bg-[#1f2a44] text-white"
            : "rounded-bl-sm border border-[#e4ddd0] bg-white text-[#2a2620]"
        }`}
      >
        {isUser ? (
          // User text is never markdown — render as plain text so
          // nothing they type is ever mis-interpreted as formatting.
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-pre:my-2 prose-pre:bg-[#f4f1ea] prose-pre:text-[#2a2620]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {balanceMarkdown(text)}
            </ReactMarkdown>
            {isStreaming && (
              <span
                aria-hidden="true"
                className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-[#c96a43]"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
