import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
 
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Scope coverage to the modules that currently have tests, so the
      // report reflects real coverage of tested units rather than
      // penalizing untested UI shells that don't yet have tests.
      include: ["lib/streaming-markdown.ts", "components/chat/thinking-indicator.tsx"],
    },
  },
});
 
