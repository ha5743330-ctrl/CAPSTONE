/**
 * lib/streaming-markdown.ts
 * ------------------------------------------------------------------
 * Streamed text arrives token-by-token, so at any given instant the
 * markdown is very likely *incomplete*: an unclosed ``` code fence, a
 * dangling single `*` before the closing `**` of bold text, etc.
 * Rendering that raw with a markdown parser makes the UI flicker
 * between broken and fixed formatting on every token.
 *
 * `balanceMarkdown` closes any constructs that are still open in the
 * given chunk of text, purely for *rendering* purposes — it never
 * mutates the underlying message state, only the string handed to the
 * markdown renderer for the current frame.
 * ------------------------------------------------------------------
 */
export function balanceMarkdown(text: string): string {
  let result = text;

  // Balance unclosed ``` code fences by appending a closing fence.
  const fenceMatches = result.match(/```/g);
  if (fenceMatches && fenceMatches.length % 2 !== 0) {
    result += "\n```";
  }

  // Balance unclosed inline `code` spans (single backticks), but only
  // if we're not already inside an (odd) unbalanced ``` block, which
  // is handled above.
  const singleBacktickCount = (result.match(/(?<!`)`(?!`)/g) || []).length;
  if (singleBacktickCount % 2 !== 0) {
    result += "`";
  }

  // Balance unclosed **bold** markers.
  const boldMatches = result.match(/\*\*/g);
  if (boldMatches && boldMatches.length % 2 !== 0) {
    result += "**";
  }

  return result;
}
