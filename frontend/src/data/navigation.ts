import {
  BadgePercent,
  ChartNoAxesCombined,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  ReceiptText,
  Repeat2,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type WorkspacePage = {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const workspacePages: WorkspacePage[] = [
  {
    slug: "dashboard",
    label: "Dashboard",
    description: "A real-time overview of subscription performance and the work that needs attention.",
    icon: LayoutDashboard,
  },
  {
    slug: "customers",
    label: "Customers",
    description: "Manage your customers and their billing information.",
    icon: Users,
  },
  {
    slug: "products",
    label: "Products",
    description: "Manage the products and variants that power your subscription offerings.",
    icon: Package,
  },
  {
    slug: "plans",
    label: "Plans",
    description: "Create and maintain the billing plans available to your customers.",
    icon: Repeat2,
  },
  {
    slug: "quotations",
    label: "Quotations",
    description: "Prepare customer quotations and track them through approval and conversion.",
    icon: FileText,
  },
  {
    slug: "subscriptions",
    label: "Subscriptions",
    description: "Monitor subscription lifecycle, renewals, and customer plan changes.",
    icon: Repeat2,
  },
  {
    slug: "invoices",
    label: "Invoices",
    description: "Review billing documents, due dates, and outstanding balances.",
    icon: ReceiptText,
  },
  {
    slug: "payments",
    label: "Payments",
    description: "Track received payments and their relationship to customer invoices.",
    icon: CreditCard,
  },
  {
    slug: "discounts",
    label: "Discounts",
    description: "Configure promotional discounts and the products they apply to.",
    icon: BadgePercent,
  },
  {
    slug: "analytics",
    label: "Analytics",
    description: "Explore revenue, subscription, and collections reporting.",
    icon: ChartNoAxesCombined,
  },
  {
    slug: "settings",
    label: "Settings",
    description: "Workspace preferences and team settings will be available in a later sprint.",
    icon: Settings,
  },
];

export const navigationGroups = [
  {
    label: "Overview",
    slugs: ["dashboard"],
  },
  {
    label: "Manage",
    slugs: ["customers", "products", "plans", "quotations", "subscriptions"],
  },
  {
    label: "Billing",
    slugs: ["invoices", "payments", "discounts"],
  },
  {
    label: "Insights",
    slugs: ["analytics"],
  },
] as const;
