"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Keeps a scroll container pinned to the bottom while new content
 * streams in — but only for as long as the user is already at the
 * bottom. The instant they scroll up (to read something above), the
 * pin releases and we stop yanking their view around. A "jump to
 * latest" button can then use `scrollToBottom()` to resume.
 *
 * This is the exact behavior the FE-06 mentor tips call out as the
 * most commonly-missed robustness bar, so it's isolated here and
 * tested independently of the chat UI itself.
 */
export function useStickyScroll<T extends HTMLElement>(
  dependency: unknown, // re-run the pinning effect when this changes (e.g. messages)
): {
  containerRef: RefObject<T | null>;
  isPinnedToBottom: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
} {
  const containerRef = useRef<T | null>(null);
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);

  // How close to the bottom (in px) still counts as "at the bottom".
  const BOTTOM_THRESHOLD = 48;

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    const node = containerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior });
    setIsPinnedToBottom(true);
  }

  // Track whether the user is at the bottom; release the pin the
  // moment they scroll away from it.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    function handleScroll() {
      const el = containerRef.current;
      if (!el) return;
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      setIsPinnedToBottom(distanceFromBottom <= BOTTOM_THRESHOLD);
    }

    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => node.removeEventListener("scroll", handleScroll);
  }, []);

  // While new tokens stream in, keep pinned to bottom — but only if
  // the user hasn't scrolled up. Runs on every message/content update.
  useEffect(() => {
    if (isPinnedToBottom) {
      scrollToBottom("auto");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency]);

  return { containerRef, isPinnedToBottom, scrollToBottom };
}
