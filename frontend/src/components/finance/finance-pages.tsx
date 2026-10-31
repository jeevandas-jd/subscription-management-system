"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  Download,
  FileText,
  Plus,
  Printer,
  Search,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState, PageContainer, PageHeader, StatusBadge } from "@/components/shared/ui";
import { useLifecycle } from "@/components/lifecycle/lifecycle-provider";
import {
  customerDisplayName,
  formatInr,
  formatLifecycleDate,
  lifecycleInputClass,
  LifecycleLoading,
} from "@/components/lifecycle/lifecycle-shared";
import { useAuth } from "@/lib/auth/auth-context";
import {
  cancelInvoice,
  confirmInvoice,
  createInvoice,
  getInvoiceBalance,
  getInvoices,
} from "@/lib/finance/invoice-service";
import { getPayments, recordPayment } from "@/lib/finance/payment-service";
import type {
  Invoice,
  InvoiceCreatePayload,
  InvoiceStatus,
  Payment,
  PaymentCreatePayload,
  PaymentMethod,
  PaymentStatus,
} from "@/types/finance";
import type { Customer } from "@/types/customer";

const pageSize = 8;
const today = () => new Date().toISOString().slice(0, 10);
const paymentMethods: PaymentMethod[] = ["cash", "bank_transfer", "upi", "card", "online", "other"];
const invoiceStatuses: InvoiceStatus[] = ["draft", "confirmed", "paid", "cancelled"];

function useFinanceRecords() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(() => {
    try {
      setInvoices(getInvoices());
      setPayments(getPayments());
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Finance demo data could not be loaded.");
    } finally {
      setReady(true);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key?.startsWith("subflow.invoices.") || event.key?.startsWith("subflow.payments.")) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);
  return { invoices, payments, ready, error, refresh };
}

function isStaff(role?: string) {
  return role === "ADMIN" || role === "STAFF";
}

function ownCustomerIds(customers: Customer[], role?: string, email?: string) {
  if (role !== "CUSTOMER") return null;
  return new Set(customers.filter((customer) => customer.email.toLowerCase() === email?.toLowerCase()).map((customer) => customer.id));
}

function belongsToUser(customerId: string, ids: Set<string> | null) {
  return ids === null || ids.has(customerId);
}

function customerById(customers: Customer[], id: string) {
  return customers.find((customer) => customer.id === id);
}

function subscriptionName(subscriptions: { id: number; subscription_number: string }[], id: number | null) {
  return id === null ? "One-time invoice" : subscriptions.find((subscription) => subscription.id === id)?.subscription_number ?? `Subscription ${id}`;
}

function DemoFinanceNotice() {
  return (
    <div role="note" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
      <span className="mt-0.5 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">Demo only</span>
      <p className="text-xs leading-5 text-amber-800">Invoice totals, payment records, and billing previews are local examples saved in this browser. No real billing, payment collection, tax calculation, or backend integration occurs.</p>
    </div>
  );
}

function FinanceError({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-rose-800">Saved finance data is unavailable</p><p className="mt-1 text-xs leading-5 text-rose-700">{message}</p></div><button type="button" onClick={retry} className="h-9 shrink-0 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700">Try again</button></div>;
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return <label className="relative"><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-600 sm:w-auto"><option value="all">All {label.replace("Filter by ", "").toLowerCase()}</option>{options.map(([option, title]) => <option key={option} value={option}>{title}</option>)}</select></label>;
}

function SearchBox({ value, onChange, placeholder, label }: { value: string; onChange: (value: string) => void; placeholder: string; label: string }) {
  return <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 sm:w-[230px]"><Search size={15} aria-hidden="true" /><input value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} placeholder={placeholder} className="w-full bg-transparent text-xs outline-none" /></label>;
}

function DateFilter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] text-slate-500"><span>{label}</span><input type="date" aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="w-[116px] text-xs text-slate-600 outline-none" /></label>;
}

function SortButton({ label, active, descending, onClick }: { label: string; active: boolean; descending: boolean; onClick: () => void }) {
  const Icon = active ? (descending ? ArrowDownUp : ArrowUp) : ArrowUpDown;
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-left hover:text-slate-700">{label}<Icon size={13} aria-hidden="true" /></button>;
}

function Pagination({ page, pages, total, onChange }: { page: number; pages: number; total: number; onChange: (page: number) => void }) {
  return <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5"><span>{total ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}` : "No results"}</span><div className="flex items-center gap-2"><button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className="h-8 rounded-md border border-slate-200 px-3 disabled:opacity-40">Previous</button><span>Page {page} of {pages}</span><button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)} className="h-8 rounded-md border border-slate-200 px-3 disabled:opacity-40">Next</button></div></div>;
}

function MiniStat({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-[11px] text-slate-400">{note}</p></article>;
}

export function InvoiceListing() {
  const { invoices: allInvoices, payments, ready, error, refresh } = useFinanceRecords();
  const { subscriptions, customers } = useLifecycle();
  const { user } = useAuth();
  const mine = ownCustomerIds(customers, user?.role, user?.email);
  const invoices = allInvoices.filter((invoice) => belongsToUser(invoice.customer_id, mine));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<"issue_date" | "grand_total" | "due_date">("issue_date");
  const [descending, setDescending] = useState(true);
  const [page, setPage] = useState(1);
  const search = query.trim().toLowerCase();
  const filtered = invoices
    .filter((invoice) => status === "all" || invoice.status === status || (status === "overdue" && isOverdue(invoice)))
    .filter((invoice) => !from || invoice.due_date >= from)
    .filter((invoice) => !to || invoice.due_date <= to)
    .filter((invoice) => !search || invoice.invoice_number.toLowerCase().includes(search) ||
      customerById(customers, invoice.customer_id)?.name.toLowerCase().includes(search) ||
      customerById(customers, invoice.customer_id)?.companyName?.toLowerCase().includes(search) ||
      subscriptionName(subscriptions, invoice.subscription_id).toLowerCase().includes(search))
    .toSorted((left, right) => {
      const compared = sortKey === "grand_total" ? Number(left.grand_total) - Number(right.grand_total) : left[sortKey].localeCompare(right[sortKey]);
      return descending ? -compared : compared;
    });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const openInvoices = invoices.filter((invoice) => !["paid", "cancelled"].includes(invoice.status));
  const outstandingCents = openInvoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
  const collectedCents = payments.filter((payment) => payment.status === "recorded" && belongsToUser(payment.customer_id, mine)).reduce((sum, payment) => sum + Math.round(Number(payment.amount) * 100), 0);
  const overdueCount = invoices.filter(isOverdue).length;
  const sortBy = (key: typeof sortKey) => {
    if (sortKey === key) setDescending((value) => !value);
    else { setSortKey(key); setDescending(key !== "grand_total"); }
    setPage(1);
  };
  const selectStatus = (value: string) => { setStatus(value); setPage(1); };
  const visibleSubscriptions = subscriptions.filter((subscription) =>
    belongsToUser(subscription.customer_id, mine) && ["confirmed", "active"].includes(subscription.status));

  return <PageContainer>
    <DemoFinanceNotice />
    {error ? <FinanceError message={error} retry={refresh} /> : null}
    <PageHeader eyebrow="Accounts receivable" title="Invoices" description={user?.role === "CUSTOMER" ? "View invoices associated with your customer profile." : "Review invoice balances and a simulated recurring billing schedule."} action={isStaff(user?.role) ? <Link href="/invoices/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white hover:bg-[#5148e5]"><Plus size={16} aria-hidden="true" />Create invoice</Link> : undefined} />
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Billing overview">
      <MiniStat label="Outstanding" value={ready ? formatInr(outstandingCents / 100) : "—"} note="Unpaid invoice balances" />
      <MiniStat label="Collected (demo)" value={ready ? formatInr(collectedCents / 100) : "—"} note="Recorded payments in this browser" />
      <MiniStat label="Overdue" value={ready ? overdueCount.toLocaleString("en-IN") : "—"} note="Past due with a remaining balance" />
      <MiniStat label="Recurring preview" value={ready ? visibleSubscriptions.length.toLocaleString("en-IN") : "—"} note="Confirmed or active subscriptions" />
    </section>
    {isStaff(user?.role) ? <section className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#635bff]"><CalendarDays size={17} aria-hidden="true" /></span><div><h2 className="text-sm font-semibold text-slate-900">Recurring billing preview</h2><p className="mt-1 text-xs leading-5 text-slate-600">{visibleSubscriptions.length} confirmed or active subscription{visibleSubscriptions.length === 1 ? "" : "s"} available for a manual demo invoice run. No invoices are automatically generated or payments charged.</p></div></div><Link href="/invoices/new" className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 sm:mt-0">Prepare invoice run <ArrowUp size={14} className="rotate-45" aria-hidden="true" /></Link></section> : null}
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between sm:px-5"><div><h2 className="text-sm font-semibold text-slate-900">Invoice register <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{ready ? invoices.length : "—"}</span></h2><p className="mt-1 text-xs text-slate-500">Overdue and partial-payment conditions are derived from due date and balance.</p></div><div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><SearchBox value={query} onChange={(value) => { setQuery(value); setPage(1); }} label="Search invoices" placeholder="Invoice, customer, subscription..." /><SelectFilter label="Filter by status" value={status} onChange={selectStatus} options={[...invoiceStatuses.map((value) => [value, titleCase(value)] as [string, string]), ["overdue", "Overdue"]]} /><DateFilter label="Due from" value={from} onChange={(value) => { setFrom(value); setPage(1); }} /><DateFilter label="Due to" value={to} onChange={(value) => { setTo(value); setPage(1); }} /></div></div>
      {!ready ? <LifecycleLoading label="invoices" /> : visible.length === 0 ? <EmptyState icon={FileText} title={invoices.length ? "No invoices match these filters" : "No invoices yet"} description={invoices.length ? "Adjust your search or filters to see matching invoices." : "Create a demo invoice from an active or confirmed subscription."} /> : <div className="overflow-x-auto"><table className="w-full min-w-[860px] border-collapse text-left"><caption className="sr-only">Invoice register</caption><thead><tr className="border-y border-slate-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400"><th className="px-5 py-3">Invoice</th><th className="py-3 pr-4">Customer</th><th className="py-3 pr-4">Due</th><th className="py-3 pr-4"><SortButton label="Total" active={sortKey === "grand_total"} descending={descending} onClick={() => sortBy("grand_total")} /></th><th className="py-3 pr-4">Balance</th><th className="py-3 pr-4">Status</th><th className="py-3 pr-5"><SortButton label="Issued" active={sortKey === "issue_date"} descending={descending} onClick={() => sortBy("issue_date")} /></th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((invoice) => <tr key={invoice.id} className="text-sm text-slate-700"><td className="px-5 py-3.5"><Link href={`/invoices/${invoice.id}`} className="font-semibold text-slate-900 hover:text-[#635bff]">{invoice.invoice_number}</Link><span className="mt-1 block text-[11px] text-slate-400">{subscriptionName(subscriptions, invoice.subscription_id)}</span></td><td className="py-3.5 pr-4">{customerDisplayName(customerById(customers, invoice.customer_id))}</td><td className="py-3.5 pr-4 whitespace-nowrap">{formatLifecycleDate(invoice.due_date)}{isOverdue(invoice) ? <span className="mt-1 block text-[10px] font-semibold text-rose-600">Overdue</span> : null}</td><td className="py-3.5 pr-4 whitespace-nowrap">{formatInr(invoice.grand_total)}</td><td className="py-3.5 pr-4 whitespace-nowrap font-medium">{formatInr(getInvoiceBalance(invoice) / 100)}</td><td className="py-3.5 pr-4"><StatusBadge status={isOverdue(invoice) ? "overdue" : invoice.status} /></td><td className="py-3.5 pr-5 whitespace-nowrap">{formatLifecycleDate(invoice.issue_date)}</td></tr>)}</tbody></table></div>}
      {ready && filtered.length > 0 ? <Pagination page={currentPage} pages={totalPages} total={filtered.length} onChange={setPage} /> : null}
    </section>
  </PageContainer>;
}

function isOverdue(invoice: Invoice) {
  return !["paid", "cancelled", "draft"].includes(invoice.status) && getInvoiceBalance(invoice) > 0 && invoice.due_date < today();
}

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function InvoiceCreateForm() {
  const router = useRouter();
  const { subscriptions, customers } = useLifecycle();
  const { user } = useAuth();
  const { invoices, ready, error, refresh } = useFinanceRecords();
  const [subscriptionId, setSubscriptionId] = useState("");
  const [periodStart, setPeriodStart] = useState(today());
  const [periodEnd, setPeriodEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const eligible = subscriptions.filter((item) => ["confirmed", "active"].includes(item.status) && customers.some((customer) => customer.id === item.customer_id));
  const selected = subscriptions.find((item) => String(item.id) === subscriptionId);
  const sourceInvoices = invoices;
  const duplicate = selected && sourceInvoices.some((invoice) => invoice.subscription_id === selected.id && invoice.billing_period_start === periodStart && invoice.billing_period_end === periodEnd);
  if (!isStaff(user?.role)) return <PageContainer><PageHeader title="Invoice access restricted" description="Only staff can create demo invoices." /><Link href="/invoices" className="text-sm font-semibold text-[#635bff]">Back to invoices</Link></PageContainer>;
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload: InvoiceCreatePayload = {
        subscription_id: Number(subscriptionId),
        billing_period_start: periodStart,
        billing_period_end: periodEnd,
        notes,
      };
      const invoice = createInvoice(payload);
      refresh();
      router.push(`/invoices/${invoice.id}`);
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Invoice could not be created.");
      setSaving(false);
    }
  }
  return <PageContainer><DemoFinanceNotice />{error ? <FinanceError message={error} retry={refresh} /> : null}<PageHeader eyebrow="Billing workspace" title="Create invoice" description="Prepare a draft invoice from a confirmed or active subscription. Totals are generated locally from its saved line snapshot." action={<Link href="/invoices" className="inline-flex h-9 items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={15} />Invoices</Link>} />
    {!ready ? <LifecycleLoading label="subscription billing options" /> : <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5"><section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-sm font-semibold text-slate-900">Billing source</h2><p className="mt-1 text-xs leading-5 text-slate-500">This demo form follows the documented subscription and billing-period fields; due dates are estimated from saved payment terms.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Subscription"><select required value={subscriptionId} onChange={(event) => setSubscriptionId(event.target.value)} className={lifecycleInputClass}><option value="">Select a subscription</option>{eligible.map((item) => <option key={item.id} value={item.id}>{item.subscription_number} · {customerDisplayName(customerById(customers, item.customer_id))}</option>)}</select></Field><Field label="Billing period start"><input required type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} className={lifecycleInputClass} /></Field><Field label="Billing period end"><input required type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} className={lifecycleInputClass} /></Field><Field label="Notes"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#a5a0ff] sm:col-span-2" placeholder="Optional invoice notes" /></Field></div></section>
        {selected ? <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-sm font-semibold text-slate-900">Subscription snapshot</h2><p className="mt-1 text-xs text-slate-500">{customerDisplayName(customerById(customers, selected.customer_id))} · {selected.lines.length} line item{selected.lines.length === 1 ? "" : "s"}</p><div className="mt-4 divide-y divide-slate-100">{selected.lines.map((line) => <div key={line.id} className="flex justify-between gap-4 py-3 text-xs"><span className="text-slate-600">Product {line.product_id} × {line.quantity}</span><span className="font-semibold text-slate-900">{formatInr(line.line_total)}</span></div>)}</div>{duplicate ? <p role="alert" className="mt-3 text-xs font-medium text-rose-700">An invoice already exists for this subscription and period.</p> : null}</section> : null}</div>
      <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">Create draft</h2><p className="text-xs leading-5 text-slate-500">Invoice lines and amounts are copied as a historical snapshot; confirm or cancel the draft from its detail page.</p>{formError ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs leading-5 text-rose-700">{formError}</p> : null}<button disabled={saving || !eligible.length || Boolean(duplicate)} className="h-10 w-full rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white hover:bg-[#5148e5] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Creating…" : "Create draft invoice"}</button><p className="text-[11px] leading-5 text-slate-400">Mock-only localStorage. No automatic billing or real payment request is sent.</p></aside>
    </form>}</PageContainer>;
}

export function InvoiceDetails({ id }: { id: number }) {
  const { invoices, payments, ready, error, refresh } = useFinanceRecords();
  const { subscriptions, customers } = useLifecycle();
  const { user } = useAuth();
  const [cancelReason, setCancelReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [actionError, setActionError] = useState("");
  const [version, setVersion] = useState(0);
  const mine = ownCustomerIds(customers, user?.role, user?.email);
  const invoice = invoices.find((item) => item.id === id);
  const relatedPayments = payments.filter((payment) => payment.invoice_id === id && payment.status === "recorded");
  function perform(action: () => unknown) {
    try {
      action();
      setActionError("");
      setShowCancel(false);
      refresh();
      setVersion((value) => value + 1);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "This invoice action could not be completed.");
    }
  }
  if (!ready) return <PageContainer><LifecycleLoading label="invoice details" /></PageContainer>;
  if (error) return <PageContainer><FinanceError message={error} retry={refresh} /></PageContainer>;
  if (!invoice || !belongsToUser(invoice.customer_id, mine)) return <PageContainer><EmptyState icon={FileText} title="Invoice not found" description="This invoice does not exist or is not available to your customer profile." /><Link href="/invoices" className="text-sm font-semibold text-[#635bff]">Back to invoices</Link></PageContainer>;
  void version;
  const customer = customerById(customers, invoice.customer_id);
  const balance = getInvoiceBalance(invoice);
  const canManage = isStaff(user?.role);
  return <PageContainer><DemoFinanceNotice /><PageHeader eyebrow={invoice.invoice_number} title="Invoice details" description={`${customerDisplayName(customer)} · ${subscriptionName(subscriptions, invoice.subscription_id)}`} action={<div className="flex flex-wrap gap-2"><Link href="/invoices" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"><ArrowLeft size={14} />Invoices</Link><button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"><Printer size={14} />Print / Save PDF</button></div>} />
    {actionError ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{actionError}</p> : null}
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7 print:border-0 print:p-0"><div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Invoice</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{invoice.invoice_number}</h2><p className="mt-2 text-xs text-slate-500">Issued {formatLifecycleDate(invoice.issue_date)} · Due {formatLifecycleDate(invoice.due_date)}</p></div><div className="flex items-center gap-3"><StatusBadge status={isOverdue(invoice) ? "overdue" : invoice.status} />{canManage && invoice.status === "draft" ? <button type="button" onClick={() => perform(() => confirmInvoice(invoice.id))} className="h-9 rounded-lg bg-[#635bff] px-3 text-xs font-semibold text-white">Confirm invoice</button> : null}{canManage && ["draft", "confirmed"].includes(invoice.status) && Number(invoice.amount_paid) === 0 ? <button type="button" onClick={() => setShowCancel((value) => !value)} className="h-9 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700">Cancel</button> : null}</div></div>
        {showCancel ? <form onSubmit={(event) => { event.preventDefault(); perform(() => cancelInvoice(invoice.id, cancelReason)); }} className="my-4 flex flex-col gap-2 rounded-lg border border-rose-100 bg-rose-50/50 p-3 sm:flex-row"><input required value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} aria-label="Invoice cancellation reason" placeholder="Reason for cancellation" className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 text-xs" /><button className="h-9 rounded-md bg-rose-600 px-3 text-xs font-semibold text-white">Confirm cancellation</button><button type="button" onClick={() => setShowCancel(false)} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs">Keep invoice</button></form> : null}
        <div className="grid gap-4 py-5 text-xs sm:grid-cols-2"><div><p className="font-semibold text-slate-400">Bill to</p><p className="mt-2 font-semibold text-slate-900">{customerDisplayName(customer)}</p><p className="mt-1 text-slate-500">{customer?.email}</p><p className="mt-1 text-slate-500">{customer?.billingAddress}, {customer?.city}</p></div><div><p className="font-semibold text-slate-400">Billing period</p><p className="mt-2 text-slate-700">{invoice.billing_period_start ? `${formatLifecycleDate(invoice.billing_period_start)} – ${formatLifecycleDate(invoice.billing_period_end)}` : "One-time service"}</p>{invoice.subscription_id ? <Link href={`/subscriptions/${invoice.subscription_id}`} className="mt-2 inline-block font-semibold text-[#635bff] hover:underline">{subscriptionName(subscriptions, invoice.subscription_id)}</Link> : <p className="mt-2 text-slate-500">One-time invoice</p>}</div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-xs"><thead className="border-y border-slate-100 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="py-3">Description</th><th className="py-3 text-right">Qty</th><th className="py-3 text-right">Unit price</th><th className="py-3 text-right">Line total</th></tr></thead><tbody className="divide-y divide-slate-100">{invoice.lines.map((line) => <tr key={line.id}><td className="py-3 text-slate-700">{line.description}</td><td className="py-3 text-right">{line.quantity}</td><td className="py-3 text-right">{formatInr(line.unit_price)}</td><td className="py-3 text-right font-semibold">{formatInr(line.line_total)}</td></tr>)}</tbody></table></div>
        <div className="ml-auto mt-5 max-w-xs space-y-2 text-xs"><MoneyRow label="Subtotal" amount={invoice.subtotal} /><MoneyRow label="Discount" amount={invoice.discount_total} /><MoneyRow label="Tax (demo)" amount={invoice.tax_total} /><MoneyRow label="Invoice total" amount={invoice.grand_total} strong /><MoneyRow label="Payments received" amount={invoice.amount_paid} /><MoneyRow label="Balance due" amount={(balance / 100).toFixed(2)} strong /></div>
        {invoice.cancel_reason ? <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">Cancellation reason: {invoice.cancel_reason}</p> : null}
        {invoice.notes ? <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">{invoice.notes}</p> : null}
      </article>
      <aside className="space-y-4"><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">Payment activity</h2>{relatedPayments.length ? <div className="mt-3 divide-y divide-slate-100">{relatedPayments.map((payment) => <Link href={`/payments/${payment.id}`} key={payment.id} className="flex items-center justify-between gap-3 py-3 text-xs"><span><span className="block font-semibold text-slate-800">{payment.payment_reference}</span><span className="mt-1 block text-slate-400">{formatLifecycleDate(payment.payment_date, true)}</span></span><span className="font-semibold text-slate-900">{formatInr(payment.amount)}</span></Link>)}</div> : <p className="mt-3 text-xs leading-5 text-slate-500">No recorded payments yet.</p>}{canManage && invoice.status === "confirmed" && balance > 0 ? <Link href={`/payments/new?invoice=${invoice.id}`} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#635bff] px-3 text-xs font-semibold text-white"><Plus size={14} />Record payment</Link> : null}</section><section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">PDF preview</h2><p className="mt-2 text-xs leading-5 text-slate-500">Use your browser’s print dialog and choose “Save as PDF” for a local copy of this invoice page.</p><button type="button" onClick={() => window.print()} className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600"><Download size={14} />Print / Save as PDF</button></section></aside>
    </section><style jsx global>{`@media print { body { background: white !important; } aside, header, footer, nav, button, a[href="/invoices"] { display: none !important; } main { padding: 0 !important; } }`}</style>
  </PageContainer>;
}

function MoneyRow({ label, amount, strong = false }: { label: string; amount: string; strong?: boolean }) {
  return <div className={`flex justify-between gap-4 ${strong ? "border-t border-slate-100 pt-2 font-semibold text-slate-950" : "text-slate-500"}`}><span>{label}</span><span>{formatInr(amount)}</span></div>;
}

export function PaymentListing() {
  const { invoices, payments: allPayments, ready, error, refresh } = useFinanceRecords();
  const { customers } = useLifecycle();
  const { user } = useAuth();
  const mine = ownCustomerIds(customers, user?.role, user?.email);
  const payments = allPayments.filter((payment) => belongsToUser(payment.customer_id, mine));
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<"payment_date" | "amount">("payment_date");
  const [descending, setDescending] = useState(true);
  const [page, setPage] = useState(1);
  const search = query.trim().toLowerCase();
  const filtered = payments
    .filter((payment) => method === "all" || payment.payment_method === method)
    .filter((payment) => status === "all" || payment.status === status)
    .filter((payment) => !from || payment.payment_date.slice(0, 10) >= from)
    .filter((payment) => !to || payment.payment_date.slice(0, 10) <= to)
    .filter((payment) => !search || payment.payment_reference.toLowerCase().includes(search) ||
      customerById(customers, payment.customer_id)?.name.toLowerCase().includes(search) ||
      invoices.find((invoice) => invoice.id === payment.invoice_id)?.invoice_number.toLowerCase().includes(search))
    .toSorted((left, right) => {
      const compared = sortKey === "amount" ? Number(left.amount) - Number(right.amount) : left.payment_date.localeCompare(right.payment_date);
      return descending ? -compared : compared;
    });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const collected = payments.filter((payment) => payment.status === "recorded").reduce((sum, payment) => sum + Math.round(Number(payment.amount) * 100), 0);
  return <PageContainer><DemoFinanceNotice />{error ? <FinanceError message={error} retry={refresh} /> : null}<PageHeader eyebrow="Accounts receivable" title="Payments" description={user?.role === "CUSTOMER" ? "View payment history associated with your customer profile." : "Review recorded demo payments and the invoices they are allocated against."} action={isStaff(user?.role) ? <Link href="/payments/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white hover:bg-[#5148e5]"><Plus size={16} />Record payment</Link> : undefined} />
    <section className="grid gap-3 sm:grid-cols-3"><MiniStat label="Payments" value={ready ? payments.length.toLocaleString("en-IN") : "—"} note="Payment records in this browser" /><MiniStat label="Recorded amount" value={ready ? formatInr(collected / 100) : "—"} note="Recorded payments only" /><MiniStat label="Payment methods" value={ready ? new Set(payments.map((payment) => payment.payment_method)).size.toLocaleString("en-IN") : "—"} note="Methods used in the demo data" /></section>
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white"><div className="flex flex-col gap-4 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between sm:px-5"><div><h2 className="text-sm font-semibold text-slate-900">Payment register <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{ready ? payments.length : "—"}</span></h2></div><div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><SearchBox value={query} onChange={(value) => { setQuery(value); setPage(1); }} label="Search payments" placeholder="Reference, customer, invoice..." /><SelectFilter label="Filter by method" value={method} onChange={(value) => { setMethod(value); setPage(1); }} options={paymentMethods.map((value) => [value, titleCase(value)])} /><SelectFilter label="Filter by status" value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={(["recorded", "pending", "failed", "reversed"] as PaymentStatus[]).map((value) => [value, titleCase(value)])} /><DateFilter label="From" value={from} onChange={(value) => { setFrom(value); setPage(1); }} /><DateFilter label="To" value={to} onChange={(value) => { setTo(value); setPage(1); }} /></div></div>
      {!ready ? <LifecycleLoading label="payments" /> : visible.length === 0 ? <EmptyState icon={WalletCards} title={payments.length ? "No payments match these filters" : "No payments yet"} description={payments.length ? "Adjust your search or filters to see matching payments." : "Recorded payments will appear here after staff enters them."} /> : <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left"><caption className="sr-only">Payment register</caption><thead><tr className="border-y border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><th className="px-5 py-3">Reference</th><th className="py-3 pr-4">Customer</th><th className="py-3 pr-4">Invoice</th><th className="py-3 pr-4">Method</th><th className="py-3 pr-4"><SortButton label="Payment date" active={sortKey === "payment_date"} descending={descending} onClick={() => { setSortKey("payment_date"); setDescending((v) => sortKey === "payment_date" ? !v : true); setPage(1); }} /></th><th className="py-3 pr-4"><SortButton label="Amount" active={sortKey === "amount"} descending={descending} onClick={() => { setSortKey("amount"); setDescending((v) => sortKey === "amount" ? !v : true); setPage(1); }} /></th><th className="py-3 pr-5">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((payment) => <tr key={payment.id} className="text-sm text-slate-700"><td className="px-5 py-3.5"><Link href={`/payments/${payment.id}`} className="font-semibold text-slate-900 hover:text-[#635bff]">{payment.payment_reference}</Link></td><td className="py-3.5 pr-4">{customerDisplayName(customerById(customers, payment.customer_id))}</td><td className="py-3.5 pr-4"><Link className="text-[#635bff] hover:underline" href={`/invoices/${payment.invoice_id}`}>{invoices.find((invoice) => invoice.id === payment.invoice_id)?.invoice_number ?? `Invoice ${payment.invoice_id}`}</Link></td><td className="py-3.5 pr-4">{titleCase(payment.payment_method)}</td><td className="py-3.5 pr-4 whitespace-nowrap">{formatLifecycleDate(payment.payment_date, true)}</td><td className="py-3.5 pr-4 whitespace-nowrap font-semibold">{formatInr(payment.amount)}</td><td className="py-3.5 pr-5"><StatusBadge status={payment.status} /></td></tr>)}</tbody></table></div>}
      {ready && filtered.length ? <Pagination page={currentPage} pages={totalPages} total={filtered.length} onChange={setPage} /> : null}
    </section>
  </PageContainer>;
}

export function PaymentCreateForm({ initialInvoiceId = "" }: { initialInvoiceId?: string }) {
  const router = useRouter();
  const { customers } = useLifecycle();
  const { user } = useAuth();
  const { invoices, ready, error, refresh } = useFinanceRecords();
  const [invoiceId, setInvoiceId] = useState(initialInvoiceId);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const available = invoices.filter((invoice) => invoice.status === "confirmed" && getInvoiceBalance(invoice) > 0);
  const selected = invoices.find((invoice) => String(invoice.id) === invoiceId);
  const balance = selected ? getInvoiceBalance(selected) : 0;
  if (!isStaff(user?.role)) return <PageContainer><PageHeader title="Payment access restricted" description="Only staff can record a demo payment." /><Link href="/payments" className="text-sm font-semibold text-[#635bff]">Back to payments</Link></PageContainer>;
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload: PaymentCreatePayload = {
        invoice_id: Number(invoiceId),
        amount,
        payment_method: method,
        payment_date: paymentDate,
        reference,
        notes,
      };
      const payment = recordPayment(payload);
      refresh();
      router.push(`/payments/${payment.id}`);
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : "Payment could not be recorded.");
      setSaving(false);
    }
  }
  return <PageContainer><DemoFinanceNotice />{error ? <FinanceError message={error} retry={refresh} /> : null}<PageHeader eyebrow="Accounts receivable" title="Record payment" description="Record an amount against a confirmed invoice balance. This only updates local demo records." action={<Link href="/payments" className="inline-flex h-9 items-center gap-2 text-xs font-semibold text-slate-500"><ArrowLeft size={15} />Payments</Link>} />
    {!ready ? <LifecycleLoading label="open invoices" /> : <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><h2 className="text-sm font-semibold text-slate-900">Payment details</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Invoice"><select required value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)} className={lifecycleInputClass}><option value="">Select an open invoice</option>{available.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · {customerDisplayName(customerById(customers, invoice.customer_id))} · balance {formatInr(getInvoiceBalance(invoice) / 100)}</option>)}</select></Field><Field label="Payment method"><select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)} className={lifecycleInputClass}>{paymentMethods.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></Field><Field label="Amount"><input required inputMode="decimal" min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} className={lifecycleInputClass} placeholder="0.00" /></Field><Field label="Payment date"><input required type="datetime-local" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} className={lifecycleInputClass} /></Field><Field label="Unique payment reference"><input required value={reference} onChange={(event) => setReference(event.target.value)} className={lifecycleInputClass} placeholder="e.g. TXN-2026-001" /></Field><Field label="Notes"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" placeholder="Optional payment notes" /></Field></div></section><aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">Invoice balance</h2>{selected ? <><p className="text-xs text-slate-500">{selected.invoice_number} · {customerDisplayName(customerById(customers, selected.customer_id))}</p><MoneyRow label="Invoice total" amount={selected.grand_total} /><MoneyRow label="Previously paid" amount={selected.amount_paid} /><MoneyRow label="Balance available" amount={(balance / 100).toFixed(2)} strong /></> : <p className="text-xs leading-5 text-slate-500">Choose an invoice to review its available balance.</p>}{formError ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs leading-5 text-rose-700">{formError}</p> : null}<button disabled={saving || !available.length} className="h-10 w-full rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Recording…" : "Record payment"}</button><p className="text-[11px] leading-5 text-slate-400">Duplicate references and overpayments are rejected by the local service.</p></aside></form>}</PageContainer>;
}

export function PaymentDetails({ id }: { id: number }) {
  const { invoices, payments, ready, error, refresh } = useFinanceRecords();
  const { customers } = useLifecycle();
  const { user } = useAuth();
  const mine = ownCustomerIds(customers, user?.role, user?.email);
  const payment = payments.find((item) => item.id === id);
  const invoice = payment ? invoices.find((item) => item.id === payment.invoice_id) : undefined;
  if (!ready) return <PageContainer><LifecycleLoading label="payment details" /></PageContainer>;
  if (error) return <PageContainer><FinanceError message={error} retry={refresh} /></PageContainer>;
  if (!payment || !belongsToUser(payment.customer_id, mine)) return <PageContainer><EmptyState icon={WalletCards} title="Payment not found" description="This payment does not exist or is not available to your customer profile." /><Link href="/payments" className="text-sm font-semibold text-[#635bff]">Back to payments</Link></PageContainer>;
  return <PageContainer><DemoFinanceNotice /><PageHeader eyebrow="Payment record" title={payment.payment_reference} description={`Recorded ${formatLifecycleDate(payment.payment_date, true)}`} action={<Link href="/payments" className="inline-flex h-9 items-center gap-2 text-xs font-semibold text-slate-500"><ArrowLeft size={15} />Payments</Link>} />
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><h2 className="text-sm font-semibold text-slate-900">Payment details</h2><StatusBadge status={payment.status} /></div><dl className="mt-4 grid gap-4 sm:grid-cols-2">{[["Reference", payment.payment_reference], ["Customer", customerDisplayName(customerById(customers, payment.customer_id))], ["Method", titleCase(payment.payment_method)], ["Payment date", formatLifecycleDate(payment.payment_date, true)], ["Amount", formatInr(payment.amount)], ["Notes", payment.notes || "—"]].map(([label, value]) => <div key={label}><dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 text-sm text-slate-700">{value}</dd></div>)}</dl></article><aside className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">Allocated invoice</h2>{invoice ? <><Link href={`/invoices/${invoice.id}`} className="mt-3 block text-sm font-semibold text-[#635bff] hover:underline">{invoice.invoice_number}</Link><p className="mt-1 text-xs text-slate-500">Current invoice status: {titleCase(invoice.status)}</p><div className="mt-4"><MoneyRow label="Invoice total" amount={invoice.grand_total} /><MoneyRow label="Balance remaining" amount={(getInvoiceBalance(invoice) / 100).toFixed(2)} strong /></div></> : <p className="mt-3 text-xs text-slate-500">The linked invoice is unavailable.</p>}</aside></section>
  </PageContainer>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-slate-700">{label}<span className="mt-1.5 block">{children}</span></label>;
}
