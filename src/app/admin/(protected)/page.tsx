import type { Metadata } from "next";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { getDashboardAnalytics } from "@/features/dashboard/get-dashboard-analytics";
import { requireStaff } from "@/server/auth/authorization";
import { dashboardAnalyticsRepository } from "@/server/db/repositories/dashboard-analytics";

export const metadata: Metadata = { title: "Dashboard overview" };

export default async function AdminPage() {
  const user = await requireStaff();
  let analytics: Awaited<ReturnType<typeof getDashboardAnalytics>> | null = null;
  try {
    analytics = await getDashboardAnalytics(user, new Date(), dashboardAnalyticsRepository);
  } catch {
    // Only a generic message crosses the server rendering boundary.
  }
  if (!analytics) {
    return <div role="alert" className="rounded-2xl border border-line bg-white p-8">
      <h1 className="text-2xl font-semibold">Dashboard unavailable</h1>
      <p className="mt-3 text-sm text-muted">Enquiry analytics could not be loaded right now. Please try again.</p>
    </div>;
  }
  return <AnalyticsOverview analytics={analytics} />;
}
