import type { LucideIcon } from "lucide-react";

export type DashboardStat = {
  label: string;
  value: string;
  change: string;
  comparison: string;
  icon: LucideIcon;
  tone: "violet" | "green" | "amber" | "blue";
};

export type RevenuePoint = {
  month: string;
  revenue: number;
};

export type SubscriptionSegment = {
  name: "Active" | "Trial" | "Past due" | "Cancelled";
  value: number;
  color: string;
};

export type AttentionItem = {
  id: string;
  title: string;
  customer: string;
  detail: string;
  status: string;
  icon: LucideIcon;
  tone: "red" | "amber" | "blue";
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  tone: "violet" | "green" | "blue" | "amber";
};

export type SubscriptionRow = {
  id: string;
  customer: string;
  initials: string;
  plan: string;
  amount: string;
  status: string;
};
