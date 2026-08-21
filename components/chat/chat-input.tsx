"use client";

import { useRef, type FormEvent, type KeyboardEvent } from "react";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
};

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit();
  }

  // Enter sends on desktop; Shift+Enter (or any device where the user
  // is clearly composing multi-line text) inserts a newline. Mobile
  // keyboards send a "Enter" keydown for their own newline handling
  // too, so we only intercept when there's no active IME composition.
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-[#e4ddd0] bg-[#faf8f3] p-3 sm:p-4"
      style={{
        // Keeps the input clear of the home-indicator / on-screen
        // keyboard safe area on phones.
        paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)",
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Type a message…"
        aria-label="Message"
        disabled={disabled}
        className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-[#e4ddd0] bg-white px-3 py-2.5 text-[16px] leading-snug text-[#2a2620] outline-none focus:border-[#c96a43] focus:ring-2 focus:ring-[#c96a43]/20 disabled:opacity-60"
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop generating"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1f2a44] text-white transition hover:opacity-90"
        >
          <span className="h-3 w-3 rounded-[2px] bg-white" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c96a43] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 12L20 4L14 20L11 13L4 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </form>
  );
}
