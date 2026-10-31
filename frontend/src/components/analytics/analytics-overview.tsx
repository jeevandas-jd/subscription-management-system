"use client";

import {
  Activity,
  CircleDollarSign,
  FileWarning,
  Layers,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageContainer, PageHeader, DateRangeSelector } from "@/components/shared/ui";
import {
  calculateAnalyticsReport,
  getAnalyticsSourceData,
} from "@/lib/analytics/analytics-service";
import type {
  AnalyticsRange,
  AnalyticsReport,
  AnalyticsSourceData,
} from "@/types/analytics";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 0,
});

export default function AnalyticsOverview() {
  const [range, setRange] = useState<AnalyticsRange>("6");
  const [sourceData, setSourceData] = useState<AnalyticsSourceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const report: AnalyticsReport | null = useMemo(
    () => (sourceData ? calculateAnalyticsReport(sourceData, range) : null),
    [sourceData, range],
  );

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        setSourceData(getAnalyticsSourceData());
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Analytics demo data could not be loaded from this browser.",
        );
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace reporting"
        title="Analytics"
        description="Comprehensive subscription metrics, recurring revenue, and invoice collections."
        action={<DateRangeSelector value={range} onChange={setRange} />}
      />

      <section
        aria-label="Demo data notice"
        className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs leading-5 text-amber-900"
      >
        <p className="font-semibold">Demo analytics from browser sample data</p>
        <p className="mt-0.5 text-amber-800">
          These local summaries are not verified business results. Financial figures use the browser&apos;s demo
          invoice, quotation, and payment records; no backend analytics API is connected.
        </p>
        {sourceData?.financeError ? (
          <p className="mt-1 text-amber-800">Finance summaries unavailable: {sourceData.financeError}</p>
        ) : null}
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          <p className="font-semibold">Analytics data is unavailable</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : report ? (
        <>
          {/* Key Metric KPI Cards (8 metrics) */}
          <section aria-label="Workspace analytics key figures" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Total revenue"
              value={report.revenueCents === null ? "Unavailable" : currency.format(report.revenueCents / 100)}
              detail={report.paymentCount === null ? "Payment data is unavailable" : `From ${report.paymentCount} payments`}
              icon={CircleDollarSign}
              tone="amber"
            />
            <MetricCard
              label="Estimated MRR"
              value={currency.format(report.mrrCents / 100)}
              detail="Monthly normalized from active plans"
              icon={TrendingUp}
              tone="green"
            />
            <MetricCard
              label="Active subscriptions"
              value={String(report.activeSubscriptions)}
              detail="Currently active subscriptions"
              icon={RefreshCw}
              tone="blue"
            />
            <MetricCard
              label="New subscriptions"
              value={String(report.newSubscriptions)}
              detail={`Created in selected period`}
              icon={Activity}
              tone="violet"
            />
            <MetricCard
              label="Churned subscriptions"
              value={String(report.churnedSubscriptions)}
              detail="Total closed subscriptions"
              icon={TrendingDown}
              tone="rose"
            />
            <MetricCard
              label="Customer count"
              value={String(report.totalCustomers)}
              detail={`${report.newCustomers} added in period`}
              icon={UsersRound}
              tone="violet"
            />
            <MetricCard
              label="Outstanding invoices"
              value={report.outstandingCents === null ? "Unavailable" : currency.format(report.outstandingCents / 100)}
              detail="Open balance on confirmed invoices"
              icon={FileWarning}
              tone="amber"
            />
            <MetricCard
              label="Overdue invoices"
              value={report.overdueInvoices === null ? "Unavailable" : String(report.overdueInvoices)}
              detail="Past due date with remaining balance"
              icon={TriangleAlert}
              tone="rose"
            />
          </section>

          {/* Revenue Over Time & Subscription Growth Charts */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {/* Revenue Trend */}
            <article className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Revenue over time</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Recorded payment collections by month.
                  </p>
                </div>
                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                  {range === "6" ? "6 Months" : "12 Months"}
                </span>
              </div>
              <div className="mt-6 h-[260px] w-full">
                {report.paymentCount === null || report.paymentCount === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    {report.paymentCount === null
                      ? "Payment data is unavailable"
                      : "No recorded payments in this range"}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.months} margin={{ top: 8, right: 6, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="analyticsRevenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#635bff" stopOpacity={0.25} />
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
                        tickFormatter={(value: number) => compactCurrency.format(Number(value) / 100)}
                        width={64}
                      />
                      <Tooltip
                        cursor={{ stroke: "#c7c3ff", strokeDasharray: "4 4" }}
                        contentStyle={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          boxShadow: "0 8px 24px rgba(15, 23, 42, .1)",
                          fontSize: 12,
                        }}
                        formatter={(value) => [currency.format(Number(value) / 100), "Revenue"]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenueCents"
                        name="Revenue"
                        stroke="#635bff"
                        strokeWidth={2.5}
                        fill="url(#analyticsRevenueFill)"
                        activeDot={{ r: 5, fill: "#635bff", stroke: "white", strokeWidth: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
                <span>Period: {report.rangeStart} – {report.rangeEnd}</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="size-2 rounded-full bg-[#635bff]" />
                  Recorded collections
                </span>
              </div>
            </article>

            {/* Subscription Growth */}
            <article className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Subscription growth</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    New subscription acquisitions grouped by month.
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  {report.newSubscriptions} new
                </span>
              </div>
              <div className="mt-6 h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.months} margin={{ top: 8, right: 6, left: -16, bottom: 0 }}>
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
                      allowDecimals={false}
                      width={40}
                    />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9" }}
                      contentStyle={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        boxShadow: "0 8px 24px rgba(15, 23, 42, .1)",
                        fontSize: 12,
                      }}
                      formatter={(value) => [`${value} subscriptions`, "Acquired"]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar
                      dataKey="subscriptions"
                      name="Subscriptions"
                      fill="#22c55e"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
                <span>Period: {report.rangeStart} – {report.rangeEnd}</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  New subscriptions
                </span>
              </div>
            </article>
          </section>

          {/* Status Distributions: Subscriptions & Invoices */}
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Subscription Status Mix */}
            <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Subscription status mix</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Subscriptions in range grouped by current lifecycle status.
                </p>
              </div>
              <div className="relative mx-auto mt-3 h-[205px] max-w-[340px]">
                {report.newSubscriptions > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={report.statuses.filter((status) => status.value > 0)}
                          dataKey="value"
                          nameKey="label"
                          innerRadius={62}
                          outerRadius={83}
                          paddingAngle={4}
                          cornerRadius={4}
                          stroke="none"
                        >
                          {report.statuses.filter((status) => status.value > 0).map((status) => (
                            <Cell key={status.name} fill={status.color} />
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
                      <span className="text-[27px] font-semibold tracking-tight text-slate-900">
                        {report.newSubscriptions}
                      </span>
                      <span className="mt-0.5 text-[11px] text-slate-400">subscriptions</span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No subscription records in this range
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4">
                {report.statuses.map((status) => (
                  <div className="flex items-center justify-between gap-2" key={status.name}>
                    <span className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="truncate">{status.label}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{status.value}</span>
                  </div>
                ))}
              </div>
            </article>

            {/* Invoice Status Distribution */}
            <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Invoice status distribution</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Breakdown of all invoices by settlement and due state.
                </p>
              </div>
              <div className="relative mx-auto mt-3 h-[205px] max-w-[340px]">
                {report.invoiceStatuses.some((item) => item.value > 0) ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={report.invoiceStatuses.filter((s) => s.value > 0)}
                          dataKey="value"
                          nameKey="label"
                          innerRadius={62}
                          outerRadius={83}
                          paddingAngle={4}
                          cornerRadius={4}
                          stroke="none"
                        >
                          {report.invoiceStatuses.filter((s) => s.value > 0).map((s) => (
                            <Cell key={s.name} fill={s.color} />
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
                      <span className="text-[27px] font-semibold tracking-tight text-slate-900">
                        {report.invoiceStatuses.reduce((acc, curr) => acc + curr.value, 0)}
                      </span>
                      <span className="mt-0.5 text-[11px] text-slate-400">invoices</span>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No invoice records available
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4">
                {report.invoiceStatuses.map((status) => (
                  <div className="flex items-center justify-between gap-2" key={status.name}>
                    <span className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="truncate">{status.label}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{status.value}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* Revenue & Subscriptions by Plan */}
          {report.planBreakdown.length > 0 ? (
            <section
              aria-label="Revenue by subscription plan"
              className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Plan distribution & recurring volume</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Subscriptions and estimated recurring value grouped by plan.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <Layers size={14} aria-hidden="true" />
                  {report.planBreakdown.length} active plan{report.planBreakdown.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {report.planBreakdown.map((plan) => (
                  <div
                    key={plan.name}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-200 hover:bg-slate-50"
                  >
                    <p className="font-semibold text-slate-800 text-sm truncate">{plan.name}</p>
                    <div className="mt-3 flex items-baseline justify-between text-xs text-slate-500">
                      <span>{plan.count} subscription{plan.count === 1 ? "" : "s"}</span>
                      <span className="font-semibold text-slate-900 text-sm">
                        {currency.format(plan.recurringCents / 100)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Period Summary Footer */}
          <section
            aria-label="Additional period summary"
            className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Period summary</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Aggregate numbers for {report.rangeStart} – {report.rangeEnd}.
                </p>
              </div>
              <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-500">
                {range === "6" ? "Last 6 months" : "Last 12 months"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
              <PeriodValue label="New customer accounts" value={String(report.newCustomers)} />
              <PeriodValue label="New subscriptions" value={String(report.newSubscriptions)} />
              <PeriodValue label="Recorded payments" value={report.paymentCount === null ? "Unavailable" : String(report.paymentCount)} />
              <PeriodValue label="Total collected" value={report.revenueCents === null ? "Unavailable" : currency.format(report.revenueCents / 100)} />
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
          Loading local analytics data…
        </div>
      )}
    </PageContainer>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "violet" | "green" | "blue" | "amber" | "rose";
}) {
  const tones = {
    violet: "bg-[#f0efff] text-[#635bff]",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium leading-5 text-slate-500">{label}</p>
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className={`mt-4 text-[24px] font-semibold tracking-tight text-slate-950 ${value === "Unavailable" ? "text-lg" : ""}`}>
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </article>
  );
}

function PeriodValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}
