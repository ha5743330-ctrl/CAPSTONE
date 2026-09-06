# CAPSTONE — Streaming Lead Qualification Chat

**Live app:** https://capstone-two-lac.vercel.app
**Repo:** https://github.com/ha5743330-ctrl/CAPSTONE

---

## Project Brief

This app solves the "cold landing page" problem: a visitor arrives with a
question, and a static page can't ask anything back. Here, the landing
page *is* a streaming AI chat that asks a couple of natural qualifying
questions (what problem they're solving, team size, timeline) and ends
with a concrete next step — book a call or share a portfolio link. It's
built for a SaaS-style product's marketing team that wants every visitor
to leave with a clear action instead of just reading text. I chose this
idea because it's the single AI feature most 2026 frontend job postings
ask for — a real streaming chat, not a chatbot bolted onto a page as a
gimmick — so it doubles as both a working tool and a portfolio piece.

---

## Run it locally

```bash
npm install
cp .env.example .env.local
# then paste a real key into .env.local, e.g.:
# AI_PROVIDER=google
# GOOGLE_GENERATIVE_AI_API_KEY=AIza...
npm run dev
```

Open http://localhost:3000 — the chat is the whole page.

To run the test suite:

```bash
npm run test          # run once
npm run test:coverage # run with coverage report
```

---

## Architecture overview

| Part | File | What it does |
|---|---|---|
| Model + system prompt (single source of truth) | `lib/ai-config.ts` | Picks the AI provider (Google Gemini by default, Anthropic Claude as an opt-in), holds the system prompt, and exports `CHAT_MODEL` so nothing else in the app needs to know which provider is active. |
| Markdown-safe streaming renderer | `lib/streaming-markdown.ts` | Closes unclosed \`\`\` fences, \`code\` spans, and **bold** markers in whatever partial text has streamed in so far, so the UI never flickers between broken and fixed formatting mid-stream. |
| Server route handler | `app/api/chat/route.ts` | The only place the app talks to the model. Receives the message history, calls `streamText`, and returns a UI-message stream. Runs entirely server-side, so the API key never reaches the browser. |
| Chat UI (state + orchestration) | `components/chat/chat.tsx` | Wires up `useChat`, renders the message list, empty state, and the "provider notice" banner. |
| Message bubble | `components/chat/message-bubble.tsx` | Renders one message. User text is always plain text (never interpreted as markdown); assistant text is lazy-loaded through `react-markdown` + `remark-gfm`, balanced by `balanceMarkdown()` first. |
| Thinking indicator | `components/chat/thinking-indicator.tsx` | Placeholder bubble shown between send and the first token, styled as the *same* bubble shell the real message will use — a handoff, not a swap. |
| Input + stop/send control | `components/chat/chat-input.tsx` | Textarea + the button that becomes "stop" while streaming. |
| Auto-scroll | `hooks/use-sticky-scroll.ts` | Pins to bottom while the user is already there; releases the moment they scroll up; offers a "jump to latest" pill. |

**Request flow:** browser → `useChat` (client) → `POST /api/chat` →
`streamText` (server, talks to the model) → streamed UI-message chunks
back to the client → `MessageBubble` renders each chunk as it arrives.

---

## AI integration — how and why

- **Model:** Google Gemini (`gemini-3.6-flash`) by default. The code
  also supports Anthropic Claude (`claude-sonnet-4-6`) — set
  `AI_PROVIDER=anthropic` and provide `ANTHROPIC_API_KEY` to switch, no
  other file needs to change. Google is the default because it has a
  genuine no-card free tier, which matters for a project meant to stay
  running as a portfolio piece.
- **Why streaming, not a single request/response:** the whole point of
  this feature is that a visitor should never stare at a blank screen
  waiting for a full reply. Token-by-token rendering plus a "thinking"
  handoff keeps the interaction feeling immediate.
- **Prompt design:** the system prompt (in `lib/ai-config.ts`) is
  intentionally constrained — one qualifying question per turn, 2–4
  sentence replies, a summary + concrete next step after 2–3 exchanges,
  and an instruction to steer off-topic questions back on track. This
  was chosen over an open-ended "helpful assistant" prompt because an
  unqualified chat window is a gimmick; this one is scoped to do one
  job (qualify the visitor) and hand them off.
- **Not a gimmick, because:** the assistant has a defined success
  condition (visitor reaches a next step), not just "answer whatever is
  asked" — verified by testing it with off-topic questions ("name 10
  movies", "how's your day") and confirming it politely redirects back
  to the qualifying flow instead of just answering and moving on.

---

## Known limitations & future improvements

- **No persistence.** Refreshing the page loses the conversation —
  there's no localStorage or DB-backed history yet. Documented as a
  stretch goal in the original assignment; would be a small addition
  (`localStorage` keyed by a session id) if extended.
- **Google Gemini as default, not Claude.** The Anthropic API has no
  ongoing free tier, so Gemini is the default for a project meant to
  keep running without ongoing cost. The Claude path is implemented
  and works — it's one environment variable away — but isn't the
  default a reviewer will hit.
- **Performance score capped around 76/100 (Lighthouse, mobile).**
  Investigated this directly: the bulk of Total Blocking Time comes
  from the Vercel AI SDK's client bundle (`useChat` /
  `DefaultChatTransport` from the `ai` package), which ships zod-based
  schema validation and a buffer polyfill that this simple text-only
  chat doesn't otherwise need. One real fix was made (lazy-loading
  `react-markdown` out of the initial bundle, which measurably cut
  Total Blocking Time), but fully closing the gap would mean replacing
  the AI SDK's client transport with a hand-rolled fetch/SSE consumer —
  a bigger rewrite with real risk to the streaming/stop-button behavior
  that's already been tested and works. Left as a documented trade-off
  rather than risking a working feature to chase a score.
- **Single-language, no i18n.** English-only prompt and UI copy.

---

## Testing evidence

Two test files, 11 tests total, 100% coverage on the modules tested:

- `lib/streaming-markdown.test.ts` (9 tests) — covers the pure
  `balanceMarkdown()` function: unclosed code fences, inline code
  spans, bold markers, multiple unbalanced constructs at once, and the
  already-balanced/empty-string no-op cases.
- `components/chat/thinking-indicator.test.tsx` (2 tests) — covers the
  `ThinkingIndicator` component: the accessible label screen reader
  users need, and that the three animated dots actually render.

```
 Test Files  2 passed (2)
      Tests  11 passed (11)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |     100 |      100 |     100 |     100 |
 components/chat   |     100 |      100 |     100 |     100 |
  thinking-indicator.tsx |100|      100 |     100 |     100 |
 lib               |     100 |      100 |     100 |     100 |
  streaming-markdown.ts  |100|      100 |     100 |     100 |
-------------------|---------|----------|---------|---------|
```

Run `npm run test:coverage` to reproduce.

The core streaming/stop/multi-turn behavior (the highest-risk part of
the app) is covered by the **manual test checklist** below rather than
end-to-end tests, since it depends on a live model connection.

---

## Performance & accessibility audit

Audited with Chrome DevTools Lighthouse (mobile), against
`https://capstone-two-lac.vercel.app`.

| Category | Before | After |
|---|---|---|
| Performance | 76 | 76 (see limitation above) |
| Accessibility | 93 | **100** |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

**Findings and what was fixed:**

1. **Contrast failure (WCAG AA violation).** Secondary text
   (`#8a8272` on white) measured 3.81:1 — below the 4.5:1 AA minimum
   for normal text. Fixed by darkening it to `#6b6355`, which measures
   5.93:1 (verified by computing relative luminance directly, not just
   trusting the audit re-run). Accessibility score went 93 → 100.
2. **Missing `<main>` landmark.** The page had no `<main>` element,
   which hurts screen-reader/assistive-tech navigation. Fixed by
   wrapping the chat in `<main>` in `app/page.tsx`.
3. **Total Blocking Time (performance).** `react-markdown` was being
   loaded eagerly even though the empty state never renders markdown.
   Lazy-loaded it via `next/dynamic` — Total Blocking Time dropped from
   1,230ms to 1,080ms. See "Known limitations" above for why the
   Performance *score* didn't move: the remaining blocking time is
   dominated by the AI SDK's client bundle, not this app's own code.

---

## Deployment & operation

**Hosting:** Vercel, connected to the `main` branch of this repo — every
push to `main` triggers a new Production deployment automatically.

**Deployment checklist (filled out):**

- [x] Environment variables (`GOOGLE_GENERATIVE_AI_API_KEY`) set in
      Vercel → Project Settings → Environment Variables → Production
      (not committed to the repo; `.env.example` documents the shape).
- [x] Production build (`next build`) passes with no errors.
- [x] Live URL manually smoke-tested after every deploy (send a
      message, confirm a reply streams back).
- [x] `.gitignore` excludes `.env.local` and `node_modules`.
- [x] No secrets logged or exposed client-side (`ANTHROPIC_API_KEY` /
      `GOOGLE_GENERATIVE_AI_API_KEY` are only read inside
      `lib/ai-config.ts`, imported solely by the server route).

**How it fails safely:**

- If the model API call fails or the API key is missing/invalid, the
  request fails server-side; the client's `useChat` `status` reflects
  the error rather than hanging indefinitely, and the input re-enables
  so the visitor can retry instead of getting stuck.
- If the visitor's connection drops mid-stream, `abortSignal: req.signal`
  on the server call means the model generation is cancelled too — the
  app doesn't keep paying for tokens no one will read.
- Because there's no persistence, a crashed tab loses the conversation
  but never leaves the app in a broken/half-saved state — the next
  visit starts clean.

**Rollback plan:** if a deploy breaks something, Vercel keeps every
previous deployment addressable at its own URL. Rollback is: open the
Vercel dashboard → Deployments → find the last known-good deployment →
"Promote to Production" (or simply `git revert` the bad commit and push,
which triggers a fresh known-good deploy). No database or migration
state to worry about, since the app is stateless.

---

## Manual test checklist (core streaming behavior)

1. Send a message → thinking dots appear → text streams in.
2. Send a long-ish question, click the stop (■) button mid-stream →
   partial text stays, input re-enables, send another message → works.
3. Scroll up while a reply is streaming → auto-scroll stops pulling you
   down → a "↓ Jump to latest" pill appears → click it → scrolls down
   and re-pins.
4. Resize the browser to ~375px wide (or open on a phone) → input and
   messages stay usable, nothing overflows horizontally.
5. Ask for something that would produce a code block or **bold** text
   → formatting doesn't flicker/break mid-stream.
6. Ask something off-topic ("what's your favorite movie?") → assistant
   answers briefly and steers back to qualifying questions, rather than
   just answering and dropping the thread.

---

## Reflection

**What was hardest, and why:** Getting the Lighthouse Performance score
up was the hardest part. I fixed what I could — lazy-loaded the
markdown renderer, closed a contrast issue — but the score stayed
around 76 because most of the remaining slowness comes from the AI SDK
library itself, not my own code. It took me a while to realize that
and stop trying to "fix" something that wasn't actually broken on my
end.

**What I'd do differently next time:** I'd run a Lighthouse check much
earlier in the process instead of right before submitting. If I'd known
about the AI SDK's bundle size from the start, I could have made a more
informed choice about which libraries to use.

**One thing that surprised me:** How much "production ready" is really
about documenting trade-offs honestly, not just making every score
perfect. Explaining *why* something isn't 100% turned out to matter
more than I expected.
