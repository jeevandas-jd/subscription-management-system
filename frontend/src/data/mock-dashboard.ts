import {
  ArrowDownToLine,
  CreditCard,
  FilePlus2,
  RefreshCw,
  UserPlus,
  WalletCards,
  CircleAlert,
  FileClock,
} from "lucide-react";
import type {
  ActivityItem,
  AttentionItem,
  DashboardStat,
  RevenuePoint,
  SubscriptionRow,
  SubscriptionSegment,
} from "@/types/dashboard";

export const dashboardStats: DashboardStat[] = [
  {
    label: "Monthly recurring revenue",
    value: "₹4,82,500",
    change: "+12.8%",
    comparison: "vs. last month",
    icon: WalletCards,
    tone: "violet",
  },
  {
    label: "Active subscriptions",
    value: "248",
    change: "+8.2%",
    comparison: "vs. last month",
    icon: RefreshCw,
    tone: "green",
  },
  {
    label: "Outstanding invoices",
    value: "₹86,400",
    change: "30 invoices",
    comparison: "awaiting payment",
    icon: FileClock,
    tone: "amber",
  },
  {
    label: "Collection rate",
    value: "94.6%",
    change: "+2.4%",
    comparison: "vs. last month",
    icon: CreditCard,
    tone: "blue",
  },
];

export const revenueByMonth: RevenuePoint[] = [
  { month: "Nov '25", revenue: 298000 },
  { month: "Dec '25", revenue: 324000 },
  { month: "Jan", revenue: 312000 },
  { month: "Feb", revenue: 356000 },
  { month: "Mar", revenue: 371000 },
  { month: "Apr", revenue: 348000 },
  { month: "May", revenue: 392000 },
  { month: "Jun", revenue: 408000 },
  { month: "Jul", revenue: 421000 },
  { month: "Aug", revenue: 446000 },
  { month: "Sep", revenue: 461000 },
  { month: "Oct", revenue: 482500 },
];

export const subscriptionSegments: SubscriptionSegment[] = [
  { name: "Active", value: 198, color: "#635bff" },
  { name: "Trial", value: 18, color: "#22c5a5" },
  { name: "Past due", value: 21, color: "#f59e0b" },
  { name: "Cancelled", value: 11, color: "#cbd5e1" },
];

export const attentionItems: AttentionItem[] = [
  {
    id: "invoice-1048",
    title: "Invoice overdue",
    customer: "Acme Technologies",
    detail: "₹12,500 · Due 3 days ago",
    status: "Overdue",
    icon: CircleAlert,
    tone: "red",
  },
  {
    id: "payment-338",
    title: "Payment failed",
    customer: "John Enterprises",
    detail: "Retry scheduled for tomorrow",
    status: "Action needed",
    icon: CreditCard,
    tone: "amber",
  },
  {
    id: "quotation-206",
    title: "Quotation awaiting approval",
    customer: "Nova Solutions",
    detail: "Sent 2 days ago · ₹48,000",
    status: "Pending",
    icon: FilePlus2,
    tone: "blue",
  },
];

export const recentActivity: ActivityItem[] = [
  {
    id: "activity-1",
    title: "New subscription created",
    description: "Growth plan · Acme Technologies",
    time: "12 minutes ago",
    icon: FilePlus2,
    tone: "violet",
  },
  {
    id: "activity-2",
    title: "Payment received",
    description: "₹24,500 · Northstar Studio",
    time: "48 minutes ago",
    icon: CreditCard,
    tone: "green",
  },
  {
    id: "activity-3",
    title: "New customer registered",
    description: "Maya Patel · maya@brightlane.in",
    time: "2 hours ago",
    icon: UserPlus,
    tone: "blue",
  },
  {
    id: "activity-4",
    title: "Subscription renewed",
    description: "Business plan · Orion Labs",
    time: "Yesterday, 4:32 PM",
    icon: RefreshCw,
    tone: "amber",
  },
  {
    id: "activity-5",
    title: "Invoice generated",
    description: "INV-2026-1048 · Acme Technologies",
    time: "Yesterday, 1:15 PM",
    icon: ArrowDownToLine,
    tone: "violet",
  },
];

export const recentSubscriptions: SubscriptionRow[] = [
  {
    id: "SUB-2026-00128",
    customer: "Acme Technologies",
    initials: "AT",
    plan: "Business · Monthly",
    amount: "₹12,500",
    status: "Active",
  },
  {
    id: "SUB-2026-00127",
    customer: "Northstar Studio",
    initials: "NS",
    plan: "Growth · Annual",
    amount: "₹24,500",
    status: "Active",
  },
  {
    id: "SUB-2026-00126",
    customer: "Brightlane Co.",
    initials: "BC",
    plan: "Starter · Monthly",
    amount: "₹4,800",
    status: "Trial",
  },
  {
    id: "SUB-2026-00125",
    customer: "Orion Labs",
    initials: "OL",
    plan: "Business · Monthly",
    amount: "₹18,000",
    status: "Past due",
  },
];

export const notifications = [
  {
    id: "notice-1",
    title: "Invoice overdue",
    description: "Acme Technologies · ₹12,500",
    time: "3 days ago",
  },
  {
    id: "notice-2",
    title: "Payment retry scheduled",
    description: "John Enterprises · Tomorrow",
    time: "1 hour ago",
  },
  {
    id: "notice-3",
    title: "Quotation needs review",
    description: "Nova Solutions · ₹48,000",
    time: "2 hours ago",
  },
];
