import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat with our assistant",
  description: "A streaming AI chat that qualifies leads for the product.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
