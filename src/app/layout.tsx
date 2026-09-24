import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "NexaService",
  title: {
    default: "NexaService | Workplace services, handled well",
    template: "%s | NexaService",
  },
  description:
    "NexaService brings practical care and clear coordination to commercial workplaces and facilities.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
