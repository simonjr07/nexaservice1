import type { LeadStatus } from "@/features/leads/validation";

const labels: Record<LeadStatus, string> = {
  NEW: "New", CONTACTED: "Contacted", QUALIFIED: "Qualified", WON: "Won", LOST: "Lost",
};

const colors: Record<LeadStatus, string> = {
  NEW: "bg-[#eaf0e8] text-sea",
  CONTACTED: "bg-[#e8eef4] text-[#315477]",
  QUALIFIED: "bg-[#f5eddb] text-[#745718]",
  WON: "bg-[#e4f1df] text-[#346738]",
  LOST: "bg-[#f0eceb] text-[#645957]",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colors[status]}`}>{labels[status]}</span>;
}

export function leadStatusLabel(status: LeadStatus) {
  return labels[status];
}

export function formatLeadDate(date: Date) {
  return `${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date)} UTC`;
}
