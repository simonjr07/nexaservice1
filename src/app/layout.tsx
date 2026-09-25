import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "NexaService",
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")),
  title: {
    default: "NexaService | Fictional workplace services demo",
    template: "%s | NexaService",
  },
  description:
    "A fictional portfolio demo of a commercial workplace services website and staff dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
