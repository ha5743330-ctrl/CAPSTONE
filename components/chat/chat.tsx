"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageBubble } from "./message-bubble";
import { ThinkingIndicator } from "./thinking-indicator";
import { ChatInput } from "./chat-input";
import { useStickyScroll } from "@/hooks/use-sticky-scroll";

export function Chat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  // status is one of: 'ready' | 'submitted' | 'streaming' | 'error'.
  // 'submitted' = request sent, no tokens yet (-> thinking indicator).
  // 'streaming' = tokens arriving (-> live text + stop button).
  const isWaitingForFirstToken = status === "submitted";
  const isStreaming = status === "streaming";
  const isBusy = isWaitingForFirstToken || isStreaming;

  const { containerRef, isPinnedToBottom, scrollToBottom } =
    useStickyScroll<HTMLDivElement>(messages);

  function handleSubmit() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    sendMessage({ text });
  }

  return (
    <div className="flex h-dvh flex-col bg-[#faf8f3]">
      <header className="flex items-center gap-3 border-b border-[#e4ddd0] bg-white px-4 py-3 sm:px-6">
        <div className="h-2 w-2 rounded-full bg-[#4a8a5c]" />
        <div>
          <p className="text-sm font-medium text-[#2a2620]">
            Chat with our assistant
          </p>
          <p className="text-xs text-[#8a8272]">
            Tell us what you&apos;re looking for
          </p>
        </div>
      </header>

      <div
        ref={containerRef}
        className="relative flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6"
      >
        {messages.length === 0 && (
          <div className="mx-auto max-w-sm pt-10 text-center text-sm text-[#8a8272]">
            Say hello to start — the assistant will ask a couple of
            quick questions to see how it can help.
          </div>
        )}

        {messages.map((message, index) => {
          const isLastMessage = index === messages.length - 1;
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={
                isLastMessage && message.role === "assistant" && isStreaming
              }
            />
          );
        })}

        {isWaitingForFirstToken && <ThinkingIndicator />}

        {error && (
          <div className="mx-auto max-w-sm rounded-xl border border-[#e0a97a] bg-[#fdf3e8] px-3 py-2 text-center text-xs text-[#8a4a1e]">
            Something went wrong sending that message. Please try again.
          </div>
        )}

        {!isPinnedToBottom && messages.length > 0 && (
          <button
            type="button"
            onClick={() => scrollToBottom()}
            className="sticky bottom-2 left-1/2 mx-auto flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#1f2a44] px-3 py-1.5 text-xs font-medium text-white shadow-md"
          >
            ↓ Jump to latest
          </button>
        )}
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        onStop={stop}
        isStreaming={isBusy}
        disabled={isBusy}
      />
    </div>
  );
}
