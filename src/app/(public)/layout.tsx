import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getPublicSettings } from "@/features/website-content/manage-content";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const { businessName } = await getPublicSettings();
  return {
    title: { absolute: `${businessName} | Fictional workplace services demo`, template: `%s | ${businessName}` },
    description: `${businessName} is a fictional portfolio demo of a commercial workplace services website and staff dashboard.`,
    openGraph: {
      type: "website",
      siteName: businessName,
      title: `${businessName} | Fictional workplace services demo`,
      description: "A fictional portfolio demo of a commercial workplace services website and staff dashboard.",
    },
    twitter: { card: "summary_large_image" },
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
      <p className="border-b border-line bg-[#eaf0e8] px-5 py-2 text-center text-xs leading-5 text-ink sm:px-8">
        Fictional portfolio demo. No real services are offered; use fictional details for enquiries.
      </p>
      <main id="main-content" className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
