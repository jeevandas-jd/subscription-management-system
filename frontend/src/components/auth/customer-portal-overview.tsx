"use client";

import Link from "next/link";
import { CircleUserRound, FileText, Repeat2 } from "lucide-react";
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

export function CustomerPortalOverview() {
  const { user } = useAuth();
  const { quotations, subscriptions, customers, plans, isReady, storageError, refresh } = useLifecycle();
  const email = user?.email.toLowerCase();
  const customerIds = new Set(
    customers
      .filter((customer) => customer.email.toLowerCase() === email)
      .map((customer) => customer.id),
  );
  const ownCustomers = customers.filter((customer) => customerIds.has(customer.id));
  const ownQuotations = quotations
    .filter((quotation) => customerIds.has(quotation.customer_id))
    .sort((left, right) => right.created_at.localeCompare(left.created_at));
  const ownSubscriptions = subscriptions
    .filter((subscription) => customerIds.has(subscription.customer_id))
    .sort((left, right) => right.created_at.localeCompare(left.created_at));

  return (
    <PageContainer>
      <LifecycleDemoNotice />
      {storageError ? <LifecycleStorageError message={storageError} onRetry={refresh} /> : null}
      <PageHeader
        eyebrow="Customer portal"
        title={`Welcome${user?.firstName ? `, ${user.firstName}` : ""}`}
        description="Review the quotations and subscriptions associated with your customer profile."
      />
      <section
        aria-label="Customer account"
        className="flex items-start gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f0efff] text-[#635bff]">
          <CircleUserRound size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">Account profile</h2>
          <p className="mt-1 break-all text-sm text-slate-600">{user?.email}</p>
          <p className="mt-2 text-xs text-slate-400">
            Signed in as a customer. Records are matched by the email on your customer profile.
          </p>
        </div>
      </section>
      {!isReady ? <LifecycleLoading label="your quotations and subscriptions" /> : storageError ? null : <>
        <section aria-labelledby="portal-quotations-heading" className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div><h2 id="portal-quotations-heading" className="text-sm font-semibold text-slate-900">Your quotations</h2><p className="mt-1 text-xs text-slate-500">{ownQuotations.length} quotation{ownQuotations.length === 1 ? "" : "s"}</p></div>
            <Link href="/quotations" className="text-xs font-semibold text-[#635bff]">View all quotations</Link>
          </div>
          {ownQuotations.length ? <div className="divide-y divide-slate-100">{ownQuotations.slice(0, 5).map((quotation) => {
            const customer = customers.find((item) => item.id === quotation.customer_id);
            return <Link key={quotation.id} href={`/quotations/${quotation.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600"><FileText size={16} aria-hidden="true" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{quotation.quotation_number}</p><p className="mt-1 truncate text-xs text-slate-400">{customerDisplayName(customer)} · Valid until {formatLifecycleDate(quotation.valid_until)}</p></div></div><div className="flex items-center justify-between gap-5 sm:justify-end"><StatusBadge status={quotation.status} /><span className="text-sm font-semibold text-slate-800">{formatInr(quotation.grand_total)}</span></div></Link>;
          })}</div> : <EmptyState icon={FileText} title="No quotations yet" description={ownCustomers.length ? "Quotations for your customer profile will appear here." : "No customer profile currently matches your signed-in email."} />}
        </section>
        <section aria-labelledby="portal-subscriptions-heading" className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div><h2 id="portal-subscriptions-heading" className="text-sm font-semibold text-slate-900">Your subscriptions</h2><p className="mt-1 text-xs text-slate-500">{ownSubscriptions.length} subscription{ownSubscriptions.length === 1 ? "" : "s"}</p></div>
            <Link href="/subscriptions" className="text-xs font-semibold text-[#635bff]">View all subscriptions</Link>
          </div>
          {ownSubscriptions.length ? <div className="divide-y divide-slate-100">{ownSubscriptions.slice(0, 5).map((subscription) => {
            const customer = customers.find((item) => item.id === subscription.customer_id);
            const plan = plans.find((item) => item.id === subscription.plan_id);
            const recurring = subscription.lines.reduce((sum, line) => sum + Math.round(Number(line.unit_price) * 100) * line.quantity, 0) / 100;
            return <Link key={subscription.id} href={`/subscriptions/${subscription.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600"><Repeat2 size={16} aria-hidden="true" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{subscription.subscription_number}</p><p className="mt-1 truncate text-xs text-slate-400">{customerDisplayName(customer)} · {plan?.name ?? "Unavailable plan"} · Next billing {formatLifecycleDate(subscription.next_billing_date)}</p></div></div><div className="flex items-center justify-between gap-5 sm:justify-end"><StatusBadge status={subscription.status} /><span className="text-sm font-semibold text-slate-800">{formatInr(recurring)}<span className="ml-1 text-[10px] font-normal text-slate-400">demo</span></span></div></Link>;
          })}</div> : <EmptyState icon={Repeat2} title="No subscriptions yet" description="Subscriptions associated with your customer profile will appear here." />}
        </section>
      </>}
    </PageContainer>
  );
}
