"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  FilterX,
  Pencil,
  Plus,
  Repeat2,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  EmptyState,
  LoadingSkeleton,
  PageContainer,
  PageHeader,
  StatusBadge,
} from "@/components/shared/ui";
import { usePlans } from "@/components/catalog/catalog-provider";
import {
  CatalogDemoNotice,
  ConfirmDeleteDialog,
} from "@/components/catalog/product-pages";
import { useAuth } from "@/lib/auth/auth-context";
import { canManageCatalog } from "@/lib/auth/permissions";
import type {
  BillingInterval,
  PlanCreatePayload,
  SubscriptionPlan,
} from "@/types/catalog";

const pageSize = 8;
const intervalLabels: Record<BillingInterval, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string | null | undefined) {
  if (!value) return "No end date";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

type PlanIntervalFilter = "all" | BillingInterval;
type PlanStatusFilter = "all" | "active" | "inactive";
type PlanSort = "name" | "available_from";

export function PlanListing() {
  const { plans, isReady, storageError, refresh, remove, notify } = usePlans();
  const { user } = useAuth();
  const canManage = Boolean(user && canManageCatalog(user.role));
  const [query, setQuery] = useState("");
  const [interval, setInterval] = useState<PlanIntervalFilter>("all");
  const [status, setStatus] = useState<PlanStatusFilter>("all");
  const [sortKey, setSortKey] = useState<PlanSort>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<SubscriptionPlan | null>(null);

  const filteredPlans = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return plans
      .filter((plan) => interval === "all" || plan.billing_interval === interval)
      .filter((plan) => status === "all" || (plan.is_active !== undefined && plan.is_active === (status === "active")))
      .filter((plan) => !search || [plan.name, plan.description ?? ""].some((value) => value.toLocaleLowerCase().includes(search)))
      .toSorted((left, right) => {
        const comparison = sortKey === "name"
          ? left.name.localeCompare(right.name)
          : left.available_from.localeCompare(right.available_from);
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [plans, query, interval, status, sortKey, sortDirection]);
  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visiblePlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasFilters = query.trim().length > 0 || interval !== "all" || status !== "all";

  function changeSort(key: PlanSort) {
    if (sortKey === key) setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setInterval("all");
    setStatus("all");
    setPage(1);
  }

  function confirmDelete() {
    if (!deleting) return;
    try {
      remove(deleting.id);
      notify("Sample plan removed", `${deleting.name} was removed from this browser's demo catalogue.`);
      setDeleting(null);
    } catch (error) {
      notify("Plan could not be removed", error instanceof Error ? error.message : "Please try again.", "error");
    }
  }

  return <PageContainer>
    <CatalogDemoNotice />
    {storageError ? <StorageError message={storageError} onRetry={refresh} /> : null}
    <PageHeader eyebrow="Catalogue" title="Subscription plans" description="Configure billing cadence and subscription lifecycle rules." action={canManage ? <Link href="/plans/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white shadow-sm shadow-[#635bff]/20 transition hover:bg-[#5148e5]"><Plus size={16} aria-hidden="true" />Add plan</Link> : undefined} />

    <section className="grid gap-4 sm:grid-cols-3" aria-label="Plan summary">
      <SummaryCard label="Total plans" value={isReady ? plans.length.toLocaleString("en-IN") : "—"} />
      <SummaryCard label="Active plans" value={isReady ? plans.filter((plan) => plan.is_active === true).length.toLocaleString("en-IN") : "—"} />
      <SummaryCard label="Billing intervals" value={isReady ? new Set(plans.map((plan) => plan.billing_interval)).size.toLocaleString("en-IN") : "—"} />
    </section>

    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div><div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-slate-900">Available plans</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{isReady ? plans.length : "—"}</span></div><p className="mt-1 text-xs text-slate-500">Lifecycle options shown are sample settings.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex h-10 min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 focus-within:border-[#a5a0ff] focus-within:ring-2 focus-within:ring-[#635bff]/10 sm:w-[230px]"><Search size={16} aria-hidden="true" /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search plans..." aria-label="Search plans" className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" /></label>
          <SelectFilter label="Filter by billing interval" value={interval} onChange={(value) => { setInterval(value as PlanIntervalFilter); setPage(1); }} options={[["all", "All intervals"], ["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"], ["yearly", "Yearly"]]} />
          <SelectFilter label="Filter by plan status" value={status} onChange={(value) => { setStatus(value as PlanStatusFilter); setPage(1); }} options={[["all", "All statuses"], ["active", "Active"], ["inactive", "Inactive"]]} />
          {hasFilters ? <button type="button" onClick={clearFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><FilterX size={14} aria-hidden="true" />Clear</button> : null}
        </div>
      </div>
      {!isReady ? <div className="space-y-4 p-5" aria-label="Loading plans">{Array.from({ length: 5 }, (_, index) => <LoadingSkeleton key={index} className="h-12" />)}</div> : storageError ? null : filteredPlans.length === 0 ? <EmptyState icon={Repeat2} title={hasFilters ? "No matching plans" : "No plans yet"} description={hasFilters ? "Try a different search or filter." : "Create a plan to define your subscription billing cadence."} /> : <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse text-left">
            <caption className="sr-only">Subscription plans</caption>
            <thead><tr className="border-y border-slate-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              <th scope="col" className="py-3 pl-5 pr-4"><SortButton label="Plan" onClick={() => changeSort("name")} active={sortKey === "name"} direction={sortDirection} /></th>
              <th scope="col" className="py-3 pr-4">Billing interval</th>
              <th scope="col" className="py-3 pr-4">Minimum quantity</th>
              <th scope="col" className="py-3 pr-4"><SortButton label="Available from" onClick={() => changeSort("available_from")} active={sortKey === "available_from"} direction={sortDirection} /></th>
              <th scope="col" className="py-3 pr-4">Available until</th>
              <th scope="col" className="py-3 pr-4">Status</th>
              <th scope="col" className="py-3 pr-5 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {visiblePlans.map((plan) => <tr key={plan.id} className="text-sm text-slate-700">
                <td className="py-3.5 pl-5 pr-4"><Link href={`/plans/${plan.id}`} className="font-semibold text-slate-900 hover:text-[#5148e5]">{plan.name}</Link><p className="mt-1 text-xs text-slate-400">{plan.description ?? "Subscription plan"}</p></td>
                <td className="py-3.5 pr-4"><span className="font-medium">{intervalLabels[plan.billing_interval]}</span><span className="text-slate-500"> × {plan.billing_interval_count}</span></td>
                <td className="py-3.5 pr-4">{plan.minimum_quantity}</td>
                <td className="py-3.5 pr-4 text-xs text-slate-500">{formatDate(plan.available_from)}</td>
                <td className="py-3.5 pr-4 text-xs text-slate-500">{formatDate(plan.available_until)}</td>
                <td className="py-3.5 pr-4">{plan.is_active === undefined ? "—" : <StatusBadge status={plan.is_active ? "Active" : "Inactive"} />}</td>
                <td className="py-3.5 pr-5 text-right"><PlanActions plan={plan} canManage={canManage} onDelete={() => setDeleting(plan)} /></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} count={filteredPlans.length} onPage={setPage} />
      </>}
    </section>
    {deleting ? <ConfirmDeleteDialog name={deleting.name} kind="plan" onCancel={() => setDeleting(null)} onConfirm={confirmDelete} /> : null}
  </PageContainer>;
}

function StorageError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="alert"><div><p className="text-sm font-semibold text-rose-800">Plan data is unavailable</p><p className="mt-1 text-xs leading-5 text-rose-700">{message}</p></div><button type="button" onClick={onRetry} className="h-9 shrink-0 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100">Try again</button></div>;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <article className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f0efff] text-[#635bff]"><Repeat2 size={18} aria-hidden="true" /></span><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold text-slate-950">{value}</p></div></article>;
}

function SelectFilter({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return <label className="relative flex h-10 items-center"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-full w-full appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-3 pr-9 text-xs font-medium text-slate-600 outline-none focus:border-[#a5a0ff] focus:ring-2 focus:ring-[#635bff]/10 sm:w-[145px]">{options.map(([optionValue, text]) => <option value={optionValue} key={optionValue}>{text}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 text-slate-400" size={14} aria-hidden="true" /></label>;
}

function SortButton({ label, onClick, active, direction }: { label: string; onClick: () => void; active: boolean; direction: "asc" | "desc" }) {
  const Icon = active ? direction === "asc" ? ArrowUp : ArrowDown : ArrowDownUp;
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 hover:text-slate-700">{label}<Icon size={13} aria-hidden="true" /></button>;
}

function Pagination({ currentPage, totalPages, count, onPage }: { currentPage: number; totalPages: number; count: number; onPage: (page: number) => void }) {
  const first = count ? (currentPage - 1) * pageSize + 1 : 0;
  const last = Math.min(currentPage * pageSize, count);
  return <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5"><p>Showing <span className="font-semibold text-slate-700">{first}–{last}</span> of {count} plans</p><div className="flex items-center gap-3"><span>Page {currentPage} of {totalPages}</span><div className="flex gap-1"><button type="button" onClick={() => onPage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page" className="grid size-8 place-items-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={15} /></button><button type="button" onClick={() => onPage(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page" className="grid size-8 place-items-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size={15} /></button></div></div></div>;
}

function PlanActions({ plan, canManage, onDelete }: { plan: SubscriptionPlan; canManage: boolean; onDelete: () => void }) {
  return <DropdownMenu label={`Actions for ${plan.name}`} trigger={<span className="inline-grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Ellipsis size={17} aria-hidden="true" /></span>}>
    <Link href={`/plans/${plan.id}`} className="block rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">View details</Link>
    {canManage ? <><Link href={`/plans/${plan.id}/edit`} className="block rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit plan</Link><button type="button" onClick={onDelete} className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50">Delete plan</button></> : null}
  </DropdownMenu>;
}

const planFormSchema = z.object({
  name: z.string().trim().min(2, "Enter a plan name.").max(255, "Use 255 characters or fewer."),
  billing_interval: z.enum(["daily", "weekly", "monthly", "yearly"]),
  billing_interval_count: z.number().int().min(1, "Enter an interval count of at least 1."),
  minimum_quantity: z.number().int().min(1, "Minimum quantity must be at least 1."),
  available_from: z.string().min(1, "Choose an availability start date."),
  available_until: z.string(),
  auto_close: z.boolean(),
  allow_early_close: z.boolean(),
  allow_pause: z.boolean(),
  allow_renewal: z.boolean(),
}).superRefine((values, context) => {
  if (values.available_until && values.available_until < values.available_from) {
    context.addIssue({ code: "custom", message: "End date must be on or after the start date.", path: ["available_until"] });
  }
});
type PlanFormValues = z.infer<typeof planFormSchema>;

const emptyPlanValues: PlanFormValues = {
  name: "",
  billing_interval: "monthly",
  billing_interval_count: 1,
  minimum_quantity: 1,
  available_from: new Date().toISOString().slice(0, 10),
  available_until: "",
  auto_close: false,
  allow_early_close: true,
  allow_pause: true,
  allow_renewal: true,
};

export function PlanForm({ mode, plan }: { mode: "create" | "edit"; plan?: SubscriptionPlan }) {
  const router = useRouter();
  const { create, update, notify } = usePlans();
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: plan ? {
      name: plan.name,
      billing_interval: plan.billing_interval,
      billing_interval_count: plan.billing_interval_count,
      minimum_quantity: plan.minimum_quantity,
      available_from: plan.available_from,
      available_until: plan.available_until ?? "",
      auto_close: plan.auto_close,
      allow_early_close: plan.allow_early_close,
      allow_pause: plan.allow_pause,
      allow_renewal: plan.allow_renewal,
    } : emptyPlanValues,
    mode: "onBlur",
  });

  function submit(values: PlanFormValues) {
    try {
      const payload: PlanCreatePayload = {
        name: values.name.trim(),
        billing_interval: values.billing_interval,
        billing_interval_count: values.billing_interval_count,
        minimum_quantity: values.minimum_quantity,
        available_from: values.available_from,
        available_until: values.available_until || null,
        auto_close: values.auto_close,
        allow_early_close: values.allow_early_close,
        allow_pause: values.allow_pause,
        allow_renewal: values.allow_renewal,
      };
      const saved = mode === "create"
        ? create(payload)
        : plan ? update(plan.id, payload) : null;
      if (!saved) {
        form.setError("root.server", { message: "Plan details are unavailable. Return to the plan list and try again." });
        return;
      }
      notify(mode === "create" ? "Sample plan added" : "Sample plan updated", `${saved.name} was saved in this browser's demo catalogue.`);
      router.push(`/plans/${saved.id}`);
    } catch (error) {
      form.setError("root.server", { message: error instanceof Error ? error.message : "The plan could not be saved." });
    }
  }

  return <PageContainer>
    <CatalogDemoNotice />
    <PageHeader eyebrow="Subscription plans" title={mode === "create" ? "Add plan" : "Edit plan"} description={mode === "create" ? "Set billing frequency, availability, and subscription rules." : `Update the sample settings for ${plan?.name ?? "this plan"}.`} action={<Link href={plan ? `/plans/${plan.id}` : "/plans"} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"><ArrowLeft size={15} aria-hidden="true" />{mode === "create" ? "Back to plans" : "Cancel"}</Link>} />
    <form onSubmit={form.handleSubmit(submit)} noValidate className="mx-auto max-w-[920px] space-y-5">
      <section className="rounded-xl border border-slate-200/80 bg-white">
        <SectionHeading title="Plan details" description="These fields match the documented plan create and update payload." />
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <FormField id="plan-name" label="Plan name" required error={form.formState.errors.name?.message} className="sm:col-span-2"><input id="plan-name" {...form.register("name")} className={inputClass} /></FormField>
          <FormField id="plan-billing-interval" label="Billing interval" required error={form.formState.errors.billing_interval?.message}><select id="plan-billing-interval" {...form.register("billing_interval")} className={inputClass}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></FormField>
          <FormField id="plan-interval-count" label="Billing interval count" required error={form.formState.errors.billing_interval_count?.message}><input id="plan-interval-count" type="number" min="1" step="1" {...form.register("billing_interval_count", { valueAsNumber: true })} className={inputClass} /></FormField>
          <FormField id="plan-minimum-quantity" label="Minimum quantity" required error={form.formState.errors.minimum_quantity?.message}><input id="plan-minimum-quantity" type="number" min="1" step="1" {...form.register("minimum_quantity", { valueAsNumber: true })} className={inputClass} /></FormField>
          <FormField id="plan-available-from" label="Available from" required error={form.formState.errors.available_from?.message}><input id="plan-available-from" type="date" {...form.register("available_from")} className={inputClass} /></FormField>
          <FormField id="plan-available-until" label="Available until" error={form.formState.errors.available_until?.message}><input id="plan-available-until" type="date" {...form.register("available_until")} className={inputClass} /><p className="mt-1 text-[11px] text-slate-400">Leave blank for no end date.</p></FormField>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200/80 bg-white">
        <SectionHeading title="Subscription options" description="Define lifecycle actions available to subscriptions using this plan." />
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
          <ToggleField id="plan-auto-close" label="Automatically close" description="Close the subscription when its configured term ends." register={form.register("auto_close")} />
          <ToggleField id="plan-early-close" label="Allow early close" description="Let a subscription be closed before its term ends." register={form.register("allow_early_close")} />
          <ToggleField id="plan-pause" label="Allow pause" description="Allow a subscription on this plan to be paused." register={form.register("allow_pause")} />
          <ToggleField id="plan-renewal" label="Allow renewal" description="Allow subscriptions to renew on this plan." register={form.register("allow_renewal")} />
        </div>
      </section>
      {form.formState.errors.root?.server?.message ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{form.formState.errors.root.server.message}</p> : null}
      <div className="flex justify-end gap-2"><Link href={plan ? `/plans/${plan.id}` : "/plans"} className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link><button type="submit" disabled={form.formState.isSubmitting} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white hover:bg-[#5148e5] disabled:opacity-60"><Check size={15} aria-hidden="true" />{mode === "create" ? "Add sample plan" : "Save changes"}</button></div>
    </form>
  </PageContainer>;
}

export function PlanDetails({ id }: { id: number }) {
  const { plans, isReady, storageError, refresh } = usePlans();
  const { user } = useAuth();
  const canManage = Boolean(user && canManageCatalog(user.role));
  if (!isReady) return <PageContainer><CatalogDemoNotice /><LoadingSkeleton className="h-72" /></PageContainer>;
  if (storageError) return <PageContainer><CatalogDemoNotice /><StorageError message={storageError} onRetry={refresh} /></PageContainer>;
  const plan = plans.find((record) => record.id === id);
  if (!plan) return <PageContainer><CatalogDemoNotice /><EmptyState icon={Repeat2} title="Plan not found" description="This plan may have been removed from the local demo catalogue." /><Link href="/plans" className="text-sm font-semibold text-[#635bff]">Return to plans</Link></PageContainer>;

  return <PageContainer>
    <CatalogDemoNotice />
    <PageHeader eyebrow="Subscription plans" title={plan.name} description="Billing schedule, availability, and lifecycle options saved in this browser." action={<div className="flex flex-wrap gap-2"><Link href="/plans" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><ArrowLeft size={15} aria-hidden="true" />Plans</Link>{canManage ? <Link href={`/plans/${id}/edit`} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#635bff] px-3 text-xs font-semibold text-white hover:bg-[#5148e5]"><Pencil size={14} aria-hidden="true" />Edit plan</Link> : null}</div>} />
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-xl border border-slate-200/80 bg-white">
        <SectionHeading title="Billing configuration" description="Sample plan details" />
        <dl className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <DetailItem label="Billing interval" value={`${intervalLabels[plan.billing_interval]} × ${plan.billing_interval_count}`} />
          <DetailItem label="Minimum quantity" value={String(plan.minimum_quantity)} />
          <DetailItem label="Available from" value={formatDate(plan.available_from)} />
          <DetailItem label="Available until" value={formatDate(plan.available_until)} />
          <DetailItem label="Status" value={plan.is_active === undefined ? "Not provided" : plan.is_active ? "Active" : "Inactive"} />
          <DetailItem label="Created" value={plan.created_at ? new Date(plan.created_at).toLocaleDateString("en-IN") : "Not provided"} />
          {plan.description ? <div className="sm:col-span-2"><dt className="text-xs font-medium text-slate-500">Description</dt><dd className="mt-1 text-sm leading-6 text-slate-800">{plan.description}</dd></div> : null}
        </dl>
      </section>
      <section className="rounded-xl border border-slate-200/80 bg-white">
        <SectionHeading title="Subscription options" description="Rules applied when subscriptions use this plan." />
        <dl className="divide-y divide-slate-100 px-5 sm:px-6">{[
          ["Automatically close", plan.auto_close],
          ["Allow early close", plan.allow_early_close],
          ["Allow pause", plan.allow_pause],
          ["Allow renewal", plan.allow_renewal],
        ].map(([label, enabled]) => <div className="flex items-center justify-between gap-4 py-4" key={String(label)}><dt className="text-sm text-slate-600">{label}</dt><dd><StatusBadge status={enabled ? "Enabled" : "Disabled"} /></dd></div>)}</dl>
      </section>
    </div>
  </PageContainer>;
}

export function PlanEditScreen({ id }: { id: number }) {
  const { plans, isReady, storageError, refresh } = usePlans();
  if (!isReady) return <PageContainer><CatalogDemoNotice /><LoadingSkeleton className="h-72" /></PageContainer>;
  if (storageError) return <PageContainer><CatalogDemoNotice /><StorageError message={storageError} onRetry={refresh} /></PageContainer>;
  const plan = plans.find((record) => record.id === id);
  if (!plan) return <PageContainer><CatalogDemoNotice /><EmptyState icon={Repeat2} title="Plan not found" description="This plan may have been removed from the local demo catalogue." /><Link href="/plans" className="text-sm font-semibold text-[#635bff]">Return to plans</Link></PageContainer>;
  return <PlanForm mode="edit" plan={plan} />;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd></div>;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f0efff] text-[#635bff]"><CalendarDays size={17} aria-hidden="true" /></span><div><h2 className="text-sm font-semibold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-500">{description}</p></div></div>;
}

function ToggleField({ id, label, description, register }: { id: string; label: string; description: string; register: ReturnType<ReturnType<typeof useForm<PlanFormValues>>["register"]> }) {
  return <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300"><input id={id} type="checkbox" {...register} className="mt-0.5 size-4 rounded border-slate-300 text-[#635bff] focus:ring-[#635bff]" /><span><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span></span></label>;
}

function FormField({ id, label, required, error, className = "", children }: { id: string; label: string; required?: boolean; error?: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">{label}{required ? <span className="ml-1 text-rose-500" aria-hidden="true">*</span> : null}</label>{children}{error ? <p className="mt-1.5 text-xs text-rose-600" id={`${id}-error`}>{error}</p> : null}</div>;
}

const inputClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#a5a0ff] focus:ring-2 focus:ring-[#635bff]/10";
