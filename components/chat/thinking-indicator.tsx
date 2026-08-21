/**
 * Shown in place of the assistant bubble the instant a message is
 * sent, before the first token arrives. It's styled as the *same*
 * bubble shell the real message will use, so when text starts
 * streaming in, the indicator's dots fade out as text fades in
 * inside the same container — a handoff, not a swap (per the FE-06
 * mentor tips: a hard swap between indicator and text reads as a
 * flicker).
 */
export function ThinkingIndicator() {
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-[#e4ddd0] bg-white px-4 py-3 sm:max-w-[75%]">
        <div className="flex items-center gap-1" aria-label="Assistant is thinking">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c96a43] [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c96a43] [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c96a43]" />
        </div>
      </div>
    </div>
  );
}
