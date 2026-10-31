"use client";

import Link from "next/link";
import {
  CircleUserRound,
  CreditCard,
  FileText,
  ReceiptText,
  Repeat2,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, PageContainer, PageHeader, StatusBadge } from "@/components/shared/ui";
import { useLifecycle } from "@/components/lifecycle/lifecycle-provider";
import {
  LifecycleDemoNotice,
  LifecycleLoading,
  LifecycleStorageError,
  customerDisplayName,
  formatInr,
  formatLifecycleDate,
} from "@/components/lifecycle/lifecycle-shared";
import { useAuth } from "@/lib/auth/auth-context";
import { getInvoiceBalance, getInvoices } from "@/lib/finance/invoice-service";
import { getPayments } from "@/lib/finance/payment-service";
import type { Invoice, Payment } from "@/types/finance";

function useCustomerFinance(customerIds: Set<string>) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [financeReady, setFinanceReady] = useState(false);
  const [financeError, setFinanceError] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      try {
        setInvoices(
          getInvoices()
            .filter((inv) => customerIds.has(inv.customer_id))
            .sort((a, b) => b.created_at.localeCompare(a.created_at)),
        );
        setPayments(
          getPayments()
            .filter((pay) => customerIds.has(pay.customer_id))
            .sort((a, b) => b.payment_date.localeCompare(a.payment_date)),
        );
        setFinanceError(null);
      } catch (err) {
        setFinanceError(
          err instanceof Error ? err.message : "Finance records could not be loaded.",
        );
      } finally {
        setFinanceReady(true);
      }
    };
    const timer = window.setTimeout(load, 0);
    const onStorage = (ev: StorageEvent) => {
      if (
        ev.key === null ||
        ev.key?.startsWith("subflow.invoices.") ||
        ev.key?.startsWith("subflow.payments.")
      )
        load();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
    // customerIds identity is stable per render; stringify size to re-run if set changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerIds.size]);

  return { invoices, payments, financeReady, financeError };
}

export function CustomerPortalOverview() {
  const { user } = useAuth();
  const { quotations, subscriptions, customers, plans, isReady, storageError, refresh } =
    useLifecycle();

  const email = user?.email.toLowerCase();
  const customerIds = new Set(
    customers
      .filter((c) => c.email.toLowerCase() === email)
      .map((c) => c.id),
  );

  const ownCustomers = customers.filter((c) => customerIds.has(c.id));
  const ownQuotations = quotations
    .filter((q) => customerIds.has(q.customer_id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const ownSubscriptions = subscriptions
    .filter((s) => customerIds.has(s.customer_id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const { invoices: ownInvoices, payments: ownPayments, financeReady, financeError } =
    useCustomerFinance(customerIds);

  // Outstanding balance: sum of all confirmed invoice remaining balances
  const outstandingCents = financeReady
    ? ownInvoices
        .filter((inv) => inv.status === "confirmed")
        .reduce((sum, inv) => sum + getInvoiceBalance(inv), 0)
    : null;

  // Upcoming billing: active subscriptions with a next_billing_date
  const upcomingBilling = ownSubscriptions
    .filter((s) => s.status === "active" && s.next_billing_date)
    .sort((a, b) =>
      (a.next_billing_date ?? "").localeCompare(b.next_billing_date ?? ""),
    );

  return (
    <PageContainer>
      <LifecycleDemoNotice />
      {storageError ? <LifecycleStorageError message={storageError} onRetry={refresh} /> : null}
      <PageHeader
        eyebrow="Customer portal"
        title={`Welcome${user?.firstName ? `, ${user.firstName}` : ""}`}
        description="Review the quotations, subscriptions, invoices and payments associated with your customer profile."
      />

      {/* Account profile */}
      <section
        aria-label="Customer account"
        className="flex items-start gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f0efff] text-[#635bff]">
          <CircleUserRound size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Account profile</h2>
              <p className="mt-1 break-all text-sm text-slate-600">{user?.email}</p>
              <p className="mt-2 text-xs text-slate-400">
                Signed in as a customer. Records are matched by the email on your customer profile.
              </p>
            </div>
            {outstandingCents !== null && outstandingCents > 0 ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500">
                  Outstanding balance
                </p>
                <p className="mt-1 text-xl font-semibold text-rose-700">
                  {formatInr(outstandingCents / 100)}
                </p>
                <p className="mt-0.5 text-[11px] text-rose-400">Demo figure only</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Upcoming billing */}
      {upcomingBilling.length > 0 ? (
        <section
          aria-label="Upcoming billing"
          className="rounded-xl border border-blue-200 bg-blue-50 p-5"
        >
          <div className="flex items-center gap-2 pb-3">
            <Repeat2 size={16} className="shrink-0 text-blue-600" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-blue-900">Upcoming billing</h2>
            <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              Demo simulation
            </span>
          </div>
          <div className="space-y-2">
            {upcomingBilling.slice(0, 3).map((sub) => {
              const plan = plans.find((p) => p.id === sub.plan_id);
              const amount =
                sub.lines.reduce(
                  (sum, l) => sum + Math.round(Number(l.unit_price) * 100) * l.quantity,
                  0,
                ) / 100;
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800">{sub.subscription_number}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {plan?.name ?? "Plan"} · Next billing{" "}
                      {formatLifecycleDate(sub.next_billing_date)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-900">
                    {formatInr(amount)}
                    <span className="ml-1 text-[10px] font-normal text-slate-400">est.</span>
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {!isReady ? (
        <LifecycleLoading label="your records" />
      ) : storageError ? null : (
        <>
          {/* Quotations */}
          <section
            aria-labelledby="portal-quotations-heading"
            className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 id="portal-quotations-heading" className="text-sm font-semibold text-slate-900">
                  Your quotations
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {ownQuotations.length} quotation{ownQuotations.length === 1 ? "" : "s"}
                </p>
              </div>
              <Link href="/quotations" className="text-xs font-semibold text-[#635bff]">
                View all quotations
              </Link>
            </div>
            {ownQuotations.length ? (
              <div className="divide-y divide-slate-100">
                {ownQuotations.slice(0, 5).map((quotation) => {
                  const customer = customers.find((c) => c.id === quotation.customer_id);
                  return (
                    <Link
                      key={quotation.id}
                      href={`/quotations/${quotation.id}`}
                      className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
                          <FileText size={16} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {quotation.quotation_number}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {customerDisplayName(customer)} · Valid until{" "}
                            {formatLifecycleDate(quotation.valid_until)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <StatusBadge status={quotation.status} />
                        <span className="text-sm font-semibold text-slate-800">
                          {formatInr(quotation.grand_total)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No quotations yet"
                description={
                  ownCustomers.length
                    ? "Quotations for your customer profile will appear here."
                    : "No customer profile currently matches your signed-in email."
                }
              />
            )}
          </section>

          {/* Subscriptions */}
          <section
            aria-labelledby="portal-subscriptions-heading"
            className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2
                  id="portal-subscriptions-heading"
                  className="text-sm font-semibold text-slate-900"
                >
                  Your subscriptions
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {ownSubscriptions.length} subscription
                  {ownSubscriptions.length === 1 ? "" : "s"}
                </p>
              </div>
              <Link href="/subscriptions" className="text-xs font-semibold text-[#635bff]">
                View all subscriptions
              </Link>
            </div>
            {ownSubscriptions.length ? (
              <div className="divide-y divide-slate-100">
                {ownSubscriptions.slice(0, 5).map((subscription) => {
                  const customer = customers.find((c) => c.id === subscription.customer_id);
                  const plan = plans.find((p) => p.id === subscription.plan_id);
                  const recurring =
                    subscription.lines.reduce(
                      (sum, l) => sum + Math.round(Number(l.unit_price) * 100) * l.quantity,
                      0,
                    ) / 100;
                  return (
                    <Link
                      key={subscription.id}
                      href={`/subscriptions/${subscription.id}`}
                      className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                          <Repeat2 size={16} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {subscription.subscription_number}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {customerDisplayName(customer)} · {plan?.name ?? "Unavailable plan"} ·
                            Next billing {formatLifecycleDate(subscription.next_billing_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <StatusBadge status={subscription.status} />
                        <span className="text-sm font-semibold text-slate-800">
                          {formatInr(recurring)}
                          <span className="ml-1 text-[10px] font-normal text-slate-400">demo</span>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Repeat2}
                title="No subscriptions yet"
                description="Subscriptions associated with your customer profile will appear here."
              />
            )}
          </section>

          {/* Invoices */}
          <section
            aria-labelledby="portal-invoices-heading"
            className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2
                  id="portal-invoices-heading"
                  className="text-sm font-semibold text-slate-900"
                >
                  Your invoices
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {financeReady
                    ? `${ownInvoices.length} invoice${ownInvoices.length === 1 ? "" : "s"}`
                    : "Loading…"}
                </p>
              </div>
              <Link href="/invoices" className="text-xs font-semibold text-[#635bff]">
                View all invoices
              </Link>
            </div>
            {!financeReady ? (
              <div className="px-5 py-8 text-center text-xs text-slate-400">
                Loading invoice records…
              </div>
            ) : financeError ? (
              <div className="px-5 py-6">
                <p className="rounded-lg bg-rose-50 px-4 py-3 text-xs text-rose-700">
                  {financeError}
                </p>
              </div>
            ) : ownInvoices.length ? (
              <div className="divide-y divide-slate-100">
                {ownInvoices.slice(0, 5).map((invoice) => {
                  const balance = getInvoiceBalance(invoice);
                  return (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                          <ReceiptText size={16} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {invoice.invoice_number}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-400">
                            Due {formatLifecycleDate(invoice.due_date)} ·{" "}
                            {balance > 0
                              ? `${formatInr(balance / 100)} outstanding`
                              : "Fully paid"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <StatusBadge status={invoice.status} />
                        <span className="text-sm font-semibold text-slate-800">
                          {formatInr(invoice.grand_total)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={ReceiptText}
                title="No invoices yet"
                description="Invoices for your customer profile will appear here."
              />
            )}
          </section>

          {/* Payments */}
          <section
            aria-labelledby="portal-payments-heading"
            className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"
          >
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2
                  id="portal-payments-heading"
                  className="text-sm font-semibold text-slate-900"
                >
                  Your payments
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {financeReady
                    ? `${ownPayments.length} payment${ownPayments.length === 1 ? "" : "s"} recorded`
                    : "Loading…"}
                </p>
              </div>
              <Link href="/payments" className="text-xs font-semibold text-[#635bff]">
                View all payments
              </Link>
            </div>
            {!financeReady ? (
              <div className="px-5 py-8 text-center text-xs text-slate-400">
                Loading payment records…
              </div>
            ) : financeError ? (
              <div className="px-5 py-6">
                <p className="rounded-lg bg-rose-50 px-4 py-3 text-xs text-rose-700">
                  {financeError}
                </p>
              </div>
            ) : ownPayments.length ? (
              <div className="divide-y divide-slate-100">
                {ownPayments.slice(0, 5).map((payment) => (
                  <Link
                    key={payment.id}
                    href={`/payments/${payment.id}`}
                    className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                        <CreditCard size={16} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {payment.payment_reference}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {formatLifecycleDate(payment.payment_date, true)} ·{" "}
                          {payment.payment_method.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <StatusBadge status={payment.status} />
                      <span className="text-sm font-semibold text-slate-800">
                        {formatInr(payment.amount)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={WalletCards}
                title="No payments yet"
                description="Payment records for your customer profile will appear here."
              />
            )}
          </section>
        </>
      )}
    </PageContainer>
  );
}
