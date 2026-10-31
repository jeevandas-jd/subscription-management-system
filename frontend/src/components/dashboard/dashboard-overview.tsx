"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  attentionItems,
  dashboardStats,
  recentActivity,
  recentSubscriptions,
  revenueByMonth,
  subscriptionSegments,
} from "@/data/mock-dashboard";
import {
  DataTable,
  DateRangeSelector,
  PageContainer,
  PageHeader,
  StatCard,
  StatusBadge,
  type DateRangeValue,
  type TableColumn,
} from "@/components/shared/ui";
import type { SubscriptionRow } from "@/types/dashboard";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const subscriptionColumns: TableColumn<SubscriptionRow>[] = [
  {
    header: "Subscription",
    cell: (row) => (
      <span className="font-medium text-slate-800">{row.id}</span>
    ),
  },
  {
    header: "Customer",
    cell: (row) => (
      <span className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
          {row.initials}
        </span>
        <span className="whitespace-nowrap font-medium text-slate-700">{row.customer}</span>
      </span>
    ),
  },
  {
    header: "Plan",
    cell: (row) => <span className="whitespace-nowrap text-slate-500">{row.plan}</span>,
  },
  {
    header: "Amount",
    cell: (row) => <span className="whitespace-nowrap font-medium text-slate-700">{row.amount}</span>,
  },
  {
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
];

export default function DashboardOverview() {
  const [range, setRange] = useState<DateRangeValue>("6");
  const revenue = range === "6" ? revenueByMonth.slice(-6) : revenueByMonth;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Good morning, Jane"
        description="Here’s what’s happening across your subscriptions today."
        action={
          <Link
            href="/subscriptions"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white shadow-sm shadow-[#635bff]/20 transition hover:bg-[#5148e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#635bff]/20"
          >
            <ArrowRight size={16} aria-hidden="true" />
            View subscriptions
          </Link>
        }
      />

      <section aria-label="Key subscription metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,0.9fr)]">
        <article className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Revenue overview</h2>
              <p className="mt-1 text-xs text-slate-500">A steady increase in collected subscription revenue</p>
            </div>
            <DateRangeSelector value={range} onChange={setRange} />
          </div>
          <div className="mt-6 flex items-end gap-3">
            <p className="text-2xl font-semibold tracking-tight text-slate-950">₹4,82,500</p>
            <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <ArrowUpRight size={14} aria-hidden="true" />
              12.8%
            </span>
            <span className="mb-1 text-[11px] text-slate-400">vs. previous period</span>
          </div>
          <div className="mt-5 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#635bff" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#635bff" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eef2f7" strokeDasharray="3 5" />
                <XAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  dataKey="month"
                  tickMargin={12}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={(value: number) => (value === 0 ? "0" : `${Math.round(value / 1000)}k`)}
                  ticks={[0, 150000, 300000, 450000, 600000]}
                  width={42}
                />
                <Tooltip
                  cursor={{ stroke: "#c7c3ff", strokeDasharray: "4 4" }}
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    boxShadow: "0 8px 24px rgba(15, 23, 42, .1)",
                    fontSize: 12,
                  }}
                  formatter={(value) => [currency.format(Number(value)), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#635bff"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                  activeDot={{ r: 5, fill: "#635bff", stroke: "white", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} aria-hidden="true" />
              {range === "6" ? "May – Oct 2026" : "Nov 2025 – Oct 2026"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#635bff]" />
              Revenue received
            </span>
          </div>
        </article>

        <SubscriptionHealth />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <NeedsAttention />
        <RecentActivity />
      </section>

      <RecentSubscriptions />
    </PageContainer>
  );
}

function SubscriptionHealth() {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Subscription health</h2>
          <p className="mt-1 text-xs text-slate-500">Current subscription status breakdown</p>
        </div>
        <span
          className="grid size-8 place-items-center rounded-lg bg-slate-50 text-slate-400"
          title="Status distribution across all subscriptions"
          aria-hidden="true"
        >
          <CalendarDays size={15} />
        </span>
      </div>
      <div className="relative mx-auto mt-3 h-[205px] max-w-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={subscriptionSegments}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={83}
              paddingAngle={4}
              cornerRadius={4}
              stroke="none"
            >
              {subscriptionSegments.map((segment) => (
                <Cell key={segment.name} fill={segment.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(15, 23, 42, .1)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[27px] font-semibold tracking-tight text-slate-900">248</span>
          <span className="mt-0.5 text-[11px] text-slate-400">subscriptions</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4">
        {subscriptionSegments.map((segment) => (
          <div className="flex items-center justify-between gap-2" key={segment.name}>
            <span className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="truncate">{segment.name}</span>
            </span>
            <span className="text-xs font-semibold text-slate-700">{segment.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function NeedsAttention() {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Needs attention</h2>
          <p className="mt-1 text-xs text-slate-500">A few things need your review</p>
        </div>
        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-600">
          3 items
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {attentionItems.map((item) => {
          const Icon = item.icon;
          const href =
            item.id.startsWith("invoice")
              ? "/invoices"
              : item.id.startsWith("payment")
                ? "/payments"
                : "/quotations";
          const tone =
            item.tone === "red"
              ? "bg-rose-50 text-rose-600"
              : item.tone === "amber"
                ? "bg-amber-50 text-amber-600"
                : "bg-blue-50 text-blue-600";

          return (
            <div className="flex items-start gap-3 py-4 first:pt-1 last:pb-1" key={item.id}>
              <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{item.customer}</p>
                <p className="mt-1 text-[11px] text-slate-400">{item.detail}</p>
              </div>
              <Link
                href={href}
                className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold text-[#635bff] transition hover:bg-[#f0efff]"
              >
                Review
                <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </div>
          );
        })}
      </div>
      <Link
        href="/invoices"
        className="mt-4 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500 transition hover:text-[#635bff]"
      >
        View all items
        <ArrowRight size={13} aria-hidden="true" />
      </Link>
    </article>
  );
}

function RecentActivity() {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
          <p className="mt-1 text-xs text-slate-500">Latest updates from your workspace</p>
        </div>
        <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-500">
          Today
        </span>
      </div>
      <ol className="space-y-0.5">
        {recentActivity.map((item, index) => {
          const Icon = item.icon;
          const tone =
            item.tone === "green"
              ? "bg-emerald-50 text-emerald-600"
              : item.tone === "blue"
                ? "bg-blue-50 text-blue-600"
                : item.tone === "amber"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-[#f0efff] text-[#635bff]";

          return (
            <li className="flex gap-3" key={item.id}>
              <div className="flex flex-col items-center">
                <span className={`grid size-8 shrink-0 place-items-center rounded-full ${tone}`}>
                  <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
                </span>
                {index < recentActivity.length - 1 ? (
                  <span className="my-1 min-h-3 w-px flex-1 bg-slate-100" aria-hidden="true" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 pb-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                  <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                  <time className="text-[10px] text-slate-400">{item.time}</time>
                </div>
                <p className="mt-1 truncate text-[11px] text-slate-500">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

function RecentSubscriptions() {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Recent subscriptions</h2>
          <p className="mt-1 text-xs text-slate-500">The latest subscriptions added to your workspace</p>
        </div>
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#635bff] transition hover:text-[#5148e5]"
        >
          View subscriptions
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
      <DataTable
        label="Recent subscriptions"
        rows={recentSubscriptions}
        getRowKey={(row) => row.id}
        columns={subscriptionColumns}
      />
    </article>
  );
}
