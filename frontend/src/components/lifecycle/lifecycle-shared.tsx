"use client";

import type { ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
} from "lucide-react";
import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { EmptyState, LoadingSkeleton } from "@/components/shared/ui";
import type { Customer } from "@/types/customer";
import type { Product, SubscriptionPlan } from "@/types/catalog";

export const lifecycleInputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#a5a0ff] focus:ring-2 focus:ring-[#635bff]/10";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export function formatInr(value: string | number) {
  const amount = Number(value);
  return Number.isFinite(amount) ? currencyFormatter.format(amount) : "—";
}

export function formatLifecycleDate(value?: string | null, withTime = false) {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", withTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function demoLineAmount(lines: { quantity: number; unit_price: string }[]) {
  return (
    lines.reduce((sum, line) => sum + Math.round(Number(line.unit_price) * 100) * line.quantity, 0) /
    100
  ).toFixed(2);
}

export function customerDisplayName(customer?: Customer) {
  return customer
    ? customer.companyName
      ? `${customer.name} · ${customer.companyName}`
      : customer.name
    : "Unknown customer";
}

export function LifecycleDemoNotice() {
  return (
    <div role="note" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
      <span className="mt-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">Demo data</span>
      <p className="text-xs leading-5 text-amber-800">Quotations and subscriptions are saved in this browser only. Totals and lifecycle updates are examples, not backend-verified billing decisions.</p>
    </div>
  );
}

export function LifecycleStorageError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2.5">
        <CircleAlert size={16} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
        <div><p className="text-sm font-semibold text-rose-800">Saved workflow data is unavailable</p><p className="mt-1 text-xs leading-5 text-rose-700">{message}</p></div>
      </div>
      <button type="button" onClick={onRetry} className="h-9 shrink-0 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100">Try again</button>
    </div>
  );
}

export function LifecycleLoading({ label }: { label: string }) {
  return <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5" aria-label={`Loading ${label}`}><LoadingSkeleton className="h-8 w-1/3" /><LoadingSkeleton className="h-16" /><LoadingSkeleton className="h-16" /><LoadingSkeleton className="h-16" /></div>;
}

export function CustomerSelect({
  customers,
  value,
  onChange,
  error,
  disabled = false,
}: {
  customers: Customer[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={`${id}-customer`} className="mb-1.5 block text-xs font-semibold text-slate-700">Customer <span className="text-rose-500" aria-hidden="true">*</span></label>
      <div className="relative">
        <select id={`${id}-customer`} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={`${lifecycleInputClass} appearance-none pr-9`}>
          <option value="">Select a customer</option>
          {customers.map((customer) => <option value={customer.id} key={customer.id}>{customerDisplayName(customer)}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function ProductSelect({
  products,
  value,
  onChange,
  error,
}: {
  products: Product[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={`${id}-product`} className="mb-1.5 block text-xs font-semibold text-slate-700">Product <span className="text-rose-500" aria-hidden="true">*</span></label>
      <div className="relative">
        <select id={`${id}-product`} value={value} onChange={(event) => onChange(event.target.value)} className={`${lifecycleInputClass} appearance-none pr-9`}>
          <option value="">Select a product</option>
          {products.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function PlanSelect({
  plans,
  value,
  onChange,
  error,
  disabled = false,
}: {
  plans: SubscriptionPlan[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const activePlans = plans.filter((plan) => plan.is_active !== false || String(plan.id) === value);
  return (
    <div>
      <label htmlFor={`${id}-plan`} className="mb-1.5 block text-xs font-semibold text-slate-700">Subscription plan <span className="text-rose-500" aria-hidden="true">*</span></label>
      <div className="relative">
        <select id={`${id}-plan`} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={`${lifecycleInputClass} appearance-none pr-9`}>
          <option value="">Select a plan</option>
          {activePlans.map((plan) => <option value={plan.id} key={plan.id}>{plan.name}{plan.is_active === false ? " (inactive)" : ""}</option>)}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function LifecycleField({
  id,
  label,
  required,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return <div className={className}><label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">{label}{required ? <span className="ml-1 text-rose-500" aria-hidden="true">*</span> : null}</label>{children}{error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : null}</div>;
}

export function LifecycleSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return <section className="rounded-xl border border-slate-200/80 bg-white"><div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="text-sm font-semibold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-500">{description}</p></div>{children}</section>;
}

export function LifecyclePagination({
  page,
  totalPages,
  count,
  pageSize,
  onChange,
  noun,
}: {
  page: number;
  totalPages: number;
  count: number;
  pageSize: number;
  onChange: (page: number) => void;
  noun: string;
}) {
  const first = count ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(page * pageSize, count);
  return <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5"><p>Showing <span className="font-semibold text-slate-700">{first}–{last}</span> of {count} {noun}</p><div className="flex items-center gap-3"><span>Page {page} of {totalPages}</span><div className="flex gap-1"><button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page" className="grid size-8 place-items-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={15} /></button><button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Next page" className="grid size-8 place-items-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size={15} /></button></div></div></div>;
}

export function LifecycleEmpty({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return <EmptyState icon={icon} title={title} description={description} />;
}
