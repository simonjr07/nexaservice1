import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NexaService | Thoughtful service, handled well",
    template: "%s | NexaService",
  },
  description:
    "NexaService brings practical care, clear communication, and dependable support to the spaces and projects that matter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
