"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  RefreshCw,
  ReceiptText,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState, PageContainer, PageHeader, StatusBadge } from "@/components/shared/ui";
import { useLifecycle } from "@/components/lifecycle/lifecycle-provider";
import {
  customerDisplayName,
  formatInr,
  formatLifecycleDate,
  LifecycleLoading,
  LifecycleStorageError,
} from "@/components/lifecycle/lifecycle-shared";
import { useAuth } from "@/lib/auth/auth-context";
import { getInvoiceBalance, getInvoices } from "@/lib/finance/invoice-service";
import type { Invoice } from "@/types/finance";
import type { Subscription } from "@/types/subscription";
import type { Customer } from "@/types/customer";
import type { SubscriptionPlan } from "@/types/catalog";

function demoRecurringAmount(lines: Subscription["lines"]) {
  return (
    lines.reduce((sum, l) => sum + Math.round(Number(l.unit_price) * 100) * l.quantity, 0) / 100
  ).toFixed(2);
}

function useBillingData() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    try {
      setInvoices(getInvoices());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Finance data could not be loaded.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(reload, 0);
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === null || ev.key?.startsWith("subflow.invoices.")) reload();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, [reload]);

  return { invoices, ready, error, reload };
}

function customerName(customers: Customer[], id: string) {
  return customerDisplayName(customers.find((c) => c.id === id));
}

function planName(plans: SubscriptionPlan[], id: number) {
  return plans.find((p) => p.id === id)?.name ?? "Unknown plan";
}

function daysFromNow(dateStr: string | null) {
  if (!dateStr) return null;
  const now = Date.now();
  const then = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr).getTime();
  if (Number.isNaN(then)) return null;
  return Math.ceil((then - now) / 86_400_000);
}

function urgencyClass(days: number | null) {
  if (days === null) return "";
  if (days < 0) return "text-rose-600";
  if (days <= 3) return "text-amber-600";
  return "text-slate-600";
}

export function BillingOverview() {
  const { subscriptions, customers, plans, isReady, storageError, refresh } = useLifecycle();
  const { invoices, ready: financeReady, error: billingError, reload } = useBillingData();
  const { user } = useAuth();

  const isCustomer = user?.role === "CUSTOMER";
  const email = user?.email.toLowerCase();
  const customerIds = new Set(
    customers
      .filter((c) => c.email.toLowerCase() === email)
      .map((c) => c.id),
  );

  const visibleSubscriptions = isCustomer
    ? subscriptions.filter((s) => customerIds.has(s.customer_id))
    : subscriptions;
  const visibleInvoices = isCustomer
    ? invoices.filter((inv) => customerIds.has(inv.customer_id))
    : invoices;

  const today = new Date().toISOString().slice(0, 10);

  // Upcoming: active subscriptions with a next_billing_date within 60 days
  const upcoming = visibleSubscriptions
    .filter((s) => s.status === "active" && s.next_billing_date)
    .map((s) => ({ ...s, days: daysFromNow(s.next_billing_date) }))
    .filter((s) => s.days !== null && s.days <= 60)
    .sort((a, b) => (a.next_billing_date ?? "").localeCompare(b.next_billing_date ?? ""));

  // Recently generated invoices (last 10)
  const recentInvoices = financeReady ? visibleInvoices.slice(0, 10) : [];

  // Overdue: confirmed invoices where due_date < today and balance > 0
  const overdue = financeReady
    ? visibleInvoices.filter(
        (inv) =>
          inv.status === "confirmed" &&
          inv.due_date < today &&
          getInvoiceBalance(inv) > 0,
      )
    : [];

  // Failed / partially-paid: confirmed invoices with partial payment
  const partiallyPaid = financeReady
    ? visibleInvoices.filter(
        (inv) =>
          inv.status === "confirmed" &&
          Number(inv.amount_paid) > 0 &&
          getInvoiceBalance(inv) > 0,
      )
    : [];

  function retry() {
    refresh();
    reload();
  }

  return (
    <PageContainer>
      {/* Demo notice */}
      <div
        role="note"
        className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
      >
        <span className="mt-0.5 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
          Simulated billing
        </span>
        <p className="text-xs leading-5 text-amber-800">
          This billing overview is a demo simulation using local browser data. No real invoices are
          generated, no charges are made, and no billing automation is running.
        </p>
      </div>

      {storageError ? <LifecycleStorageError message={storageError} onRetry={retry} /> : null}
      {billingError ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm font-semibold text-rose-800">Finance data unavailable</p>
          <p className="mt-1 text-xs text-rose-700">{billingError}</p>
        </div>
      ) : null}

      <PageHeader
        eyebrow={isCustomer ? "Customer billing" : "Finance"}
        title={isCustomer ? "Your billing overview" : "Billing overview"}
        description={
          isCustomer
            ? "Simulated view of your upcoming subscription renewals, recently generated invoices, and balances."
            : "Simulated view of upcoming billing cycles, recently generated invoices, and overdue balances."
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Upcoming billing"
          value={isReady ? String(upcoming.length) : "—"}
          detail="Active subscriptions due in 60 days"
          icon={CalendarClock}
          tone="blue"
        />
        <KpiCard
          label="Overdue invoices"
          value={financeReady ? String(overdue.length) : "—"}
          detail="Confirmed invoices past due date"
          icon={AlertTriangle}
          tone="rose"
        />
        <KpiCard
          label="Partially paid"
          value={financeReady ? String(partiallyPaid.length) : "—"}
          detail="Invoices with a remaining balance"
          icon={Clock}
          tone="amber"
        />
        <KpiCard
          label="Recent invoices"
          value={financeReady ? String(recentInvoices.length) : "—"}
          detail="Last 10 generated invoices"
          icon={ReceiptText}
          tone="violet"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Upcoming billing */}
        <section
          aria-labelledby="upcoming-billing-heading"
          className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2
                id="upcoming-billing-heading"
                className="flex items-center gap-2 text-sm font-semibold text-slate-900"
              >
                <RefreshCw size={15} className="text-blue-500" aria-hidden="true" />
                Upcoming billing cycles
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Active subscriptions due within the next 60 days
              </p>
            </div>
            <Link
              href="/subscriptions"
              className="shrink-0 text-xs font-semibold text-[#635bff]"
            >
              All subscriptions
            </Link>
          </div>

          {!isReady ? (
            <LifecycleLoading label="upcoming billing" />
          ) : upcoming.length ? (
            <div className="divide-y divide-slate-100">
              {upcoming.map((sub) => {
                const days = sub.days;
                return (
                  <div
                    key={sub.id}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/subscriptions/${sub.id}`}
                          className="text-sm font-semibold text-slate-800 hover:text-[#635bff]"
                        >
                          {sub.subscription_number}
                        </Link>
                        <StatusBadge status={sub.status} />
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {customerName(customers, sub.customer_id)} ·{" "}
                        {planName(plans, sub.plan_id)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatInr(demoRecurringAmount(sub.lines))}
                        <span className="ml-1 text-[10px] font-normal text-slate-400">est.</span>
                      </p>
                      <p className={`text-xs font-medium ${urgencyClass(days)}`}>
                        {days === null
                          ? "—"
                          : days < 0
                            ? `${Math.abs(days)}d overdue`
                            : days === 0
                              ? "Due today"
                              : `${days}d · ${formatLifecycleDate(sub.next_billing_date)}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No upcoming billing cycles"
              description="No active subscriptions have a next billing date within 60 days."
            />
          )}
        </section>

        {/* Right column: overdue + recent invoices */}
        <aside className="space-y-6">
          {/* Overdue invoices */}
          {financeReady && overdue.length > 0 ? (
            <section
              aria-label="Overdue invoices"
              className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50"
            >
              <div className="flex items-center gap-2 border-b border-rose-200 px-5 py-4">
                <AlertTriangle size={15} className="shrink-0 text-rose-500" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-rose-900">Overdue invoices</h2>
                <span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                  {overdue.length} overdue
                </span>
              </div>
              <div className="divide-y divide-rose-200">
                {overdue.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-rose-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-rose-800">
                        {inv.invoice_number}
                      </p>
                      <p className="mt-0.5 text-xs text-rose-600">
                        Due {formatLifecycleDate(inv.due_date)} ·{" "}
                        {customerName(customers, inv.customer_id)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-rose-800">
                      {formatInr(getInvoiceBalance(inv) / 100)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Partially paid */}
          {financeReady && partiallyPaid.length > 0 ? (
            <section
              aria-label="Partially paid invoices"
              className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50"
            >
              <div className="flex items-center gap-2 border-b border-amber-200 px-5 py-4">
                <Clock size={15} className="shrink-0 text-amber-500" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-amber-900">Partial payments</h2>
              </div>
              <div className="divide-y divide-amber-200">
                {partiallyPaid.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-amber-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-amber-800">
                        {inv.invoice_number}
                      </p>
                      <p className="mt-0.5 text-xs text-amber-600">
                        {formatInr(inv.amount_paid)} paid of {formatInr(inv.grand_total)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-amber-800">
                      {formatInr(getInvoiceBalance(inv) / 100)} left
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* Recent invoices */}
          <section
            aria-label="Recent invoices"
            className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CheckCircle2 size={15} className="text-emerald-500" aria-hidden="true" />
                Recent invoices
              </h2>
              <Link href="/invoices" className="text-xs font-semibold text-[#635bff]">
                All invoices
              </Link>
            </div>
            {!financeReady ? (
              <div className="px-5 py-6 text-center text-xs text-slate-400">Loading…</div>
            ) : recentInvoices.length ? (
              <div className="divide-y divide-slate-100">
                {recentInvoices.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {inv.invoice_number}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatLifecycleDate(inv.issue_date)} · {customerName(customers, inv.customer_id)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={inv.status} />
                      <span className="text-xs font-semibold text-slate-700">
                        {formatInr(inv.grand_total)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ReceiptText}
                title="No invoices yet"
                description="Generated invoices will appear here."
              />
            )}
          </section>
        </aside>
      </div>
    </PageContainer>
  );
}

function KpiCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof CalendarClock;
  tone: "blue" | "rose" | "amber" | "violet";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-[#f0efff] text-[#635bff]",
  };
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium leading-5 text-slate-500">{label}</p>
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-4 text-[26px] font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </article>
  );
}
