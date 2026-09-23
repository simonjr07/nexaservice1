import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getPublicSettings } from "@/features/website-content/manage-content";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const { businessName } = await getPublicSettings();
  return {
    title: { default: `${businessName} | Thoughtful service, handled well`, template: `%s | ${businessName}` },
    description: `${businessName} offers practical care and clear communication for spaces and projects.`,
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const settings = await getPublicSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <SiteHeader businessName={settings.businessName} />
      <main id="main-content" className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
