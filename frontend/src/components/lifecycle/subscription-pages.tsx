"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  FilterX,
  Plus,
  Repeat2,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { ReactNode } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { EmptyState, PageContainer, PageHeader, StatusBadge } from "@/components/shared/ui";
import { useLifecycle } from "@/components/lifecycle/lifecycle-provider";
import {
  CustomerSelect,
  LifecycleDemoNotice,
  LifecycleField,
  LifecycleLoading,
  LifecyclePagination,
  LifecycleSection,
  LifecycleStorageError,
  PlanSelect,
  ProductSelect,
  customerDisplayName,
  demoLineAmount,
  formatInr,
  formatLifecycleDate,
  lifecycleInputClass,
} from "@/components/lifecycle/lifecycle-shared";
import { useAuth } from "@/lib/auth/auth-context";
import type { Customer } from "@/types/customer";
import type { BillingInterval, ProductVariant, SubscriptionPlan } from "@/types/catalog";
import type {
  Subscription,
  SubscriptionAction,
  SubscriptionCreatePayload,
  SubscriptionStatus,
} from "@/types/subscription";

const pageSize = 8;
const today = () => new Date().toISOString().slice(0, 10);
const statuses: SubscriptionStatus[] = ["draft", "quotation", "confirmed", "active", "paused", "closed"];
const intervals: BillingInterval[] = ["daily", "weekly", "monthly", "yearly"];
type SortKey = "start_date" | "amount" | "status";

function customerFor(subscription: Subscription, customers: Customer[]) {
  return customers.find((customer) => customer.id === subscription.customer_id);
}

function visibleSubscriptions(
  subscriptions: Subscription[],
  customers: Customer[],
  role: string | undefined,
  email: string | undefined,
) {
  if (role !== "CUSTOMER") return subscriptions;
  const ownIds = new Set(customers.filter((customer) => customer.email.toLowerCase() === email?.toLowerCase()).map((customer) => customer.id));
  return subscriptions.filter((subscription) => ownIds.has(subscription.customer_id));
}

function recurringAmount(subscription: Subscription) {
  return demoLineAmount(subscription.lines);
}

export function SubscriptionListing() {
  const { subscriptions, customers, plans, isReady, storageError, refresh } = useLifecycle();
  const { user } = useAuth();
  const rows = visibleSubscriptions(subscriptions, customers, user?.role, user?.email);
  const canCreate = user?.role === "ADMIN" || user?.role === "STAFF";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | SubscriptionStatus>("all");
  const [interval, setInterval] = useState<"all" | BillingInterval>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("start_date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return rows
      .filter((subscription) => status === "all" || subscription.status === status)
      .filter((subscription) => interval === "all" || plans.find((plan) => plan.id === subscription.plan_id)?.billing_interval === interval)
      .filter((subscription) => !from || subscription.start_date >= from)
      .filter((subscription) => !to || subscription.start_date <= to)
      .filter((subscription) => {
        const customer = customerFor(subscription, customers);
        return !search || subscription.subscription_number.toLowerCase().includes(search) ||
          customer?.name.toLowerCase().includes(search) ||
          customer?.companyName?.toLowerCase().includes(search);
      })
      .toSorted((left, right) => {
        const comparison = sortKey === "start_date"
          ? left.start_date.localeCompare(right.start_date)
          : sortKey === "amount"
            ? Number(recurringAmount(left)) - Number(recurringAmount(right))
            : left.status.localeCompare(right.status);
        return direction === "asc" ? comparison : -comparison;
      });
  }, [rows, customers, plans, query, status, interval, from, to, sortKey, direction]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function changeSort(key: SortKey) {
    if (sortKey === key) setDirection((value) => value === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setDirection(key === "status" ? "asc" : "desc");
    }
    setPage(1);
  }
  function clearFilters() {
    setQuery("");
    setStatus("all");
    setInterval("all");
    setFrom("");
    setTo("");
    setPage(1);
  }
  const filteredOn = Boolean(query || status !== "all" || interval !== "all" || from || to);

  return <PageContainer>
    <LifecycleDemoNotice />
    {storageError ? <LifecycleStorageError message={storageError} onRetry={refresh} /> : null}
    <PageHeader eyebrow="Recurring revenue" title="Subscriptions" description={user?.role === "CUSTOMER" ? "View subscriptions associated with your customer profile." : "Track subscription status, billing cadence, and lifecycle actions."} action={canCreate ? <Link href="/subscriptions/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white hover:bg-[#5148e5]"><Plus size={16} aria-hidden="true" />New subscription</Link> : undefined} />
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Subscription summary">
      <Summary label="Subscriptions" value={isReady ? rows.length.toLocaleString("en-IN") : "—"} />
      <Summary label="Active" value={isReady ? rows.filter((item) => item.status === "active").length.toLocaleString("en-IN") : "—"} />
      <Summary label="Paused" value={isReady ? rows.filter((item) => item.status === "paused").length.toLocaleString("en-IN") : "—"} />
    </section>
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between sm:px-5">
        <div><h2 className="text-sm font-semibold text-slate-900">Subscription register <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{isReady ? rows.length : "—"}</span></h2><p className="mt-1 text-xs text-slate-500">Recurring values below are local demo estimates.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 sm:w-[230px]"><Search size={15} aria-hidden="true" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} aria-label="Search subscriptions" placeholder="Number or customer..." className="w-full bg-transparent text-xs outline-none" /></label>
          <Select label="Filter by subscription status" value={status} onChange={(value) => { setStatus(value as "all" | SubscriptionStatus); setPage(1); }} options={[["all", "All statuses"], ...statuses.map((item) => [item, titleCase(item)] as [string, string])]} />
          <Select label="Filter by billing interval" value={interval} onChange={(value) => { setInterval(value as "all" | BillingInterval); setPage(1); }} options={[["all", "All intervals"], ...intervals.map((item) => [item, titleCase(item)] as [string, string])]} />
          <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] text-slate-500"><span>From</span><input type="date" aria-label="Subscription start from" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className="w-[116px] text-xs text-slate-600 outline-none" /></label>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] text-slate-500"><span>To</span><input type="date" aria-label="Subscription start to" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} className="w-[116px] text-xs text-slate-600 outline-none" /></label>
          {filteredOn ? <button type="button" onClick={clearFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600"><FilterX size={14} />Clear</button> : null}
        </div>
      </div>
      {!isReady ? <LifecycleLoading label="subscriptions" /> : storageError ? null : filtered.length === 0 ? <EmptyState icon={Repeat2} title={filteredOn ? "No matching subscriptions" : "No subscriptions yet"} description={filteredOn ? "Adjust the search or filters to find another subscription." : "Create a subscription to begin tracking a customer plan."} /> : <>
        <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left"><caption className="sr-only">Customer subscriptions</caption><thead><tr className="border-y border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <th scope="col" className="py-3 pl-5 pr-4">Subscription</th><th scope="col" className="py-3 pr-4">Customer</th><th scope="col" className="py-3 pr-4">Plan</th><th scope="col" className="py-3 pr-4">Status</th><th scope="col" className="py-3 pr-4"><SortButton label="Start date" sortKey="start_date" currentKey={sortKey} direction={direction} onClick={() => changeSort("start_date")} /></th><th scope="col" className="py-3 pr-4">Next billing</th><th scope="col" className="py-3 pr-4"><SortButton label="Recurring amount" sortKey="amount" currentKey={sortKey} direction={direction} onClick={() => changeSort("amount")} /></th><th scope="col" className="py-3 pr-5 text-right">Open</th>
        </tr></thead><tbody className="divide-y divide-slate-100">{visible.map((subscription) => {
          const customer = customerFor(subscription, customers);
          const plan = plans.find((item) => item.id === subscription.plan_id);
          return <tr key={subscription.id} className="text-sm text-slate-700"><td className="py-3.5 pl-5 pr-4"><Link href={`/subscriptions/${subscription.id}`} className="font-semibold text-slate-900 hover:text-[#5148e5]">{subscription.subscription_number}</Link><p className="mt-1 text-xs text-slate-400">{subscription.lines.length} line item{subscription.lines.length === 1 ? "" : "s"}</p></td><td className="py-3.5 pr-4"><p className="font-medium">{customerDisplayName(customer)}</p><p className="mt-1 text-xs text-slate-400">{customer?.email ?? "Customer unavailable"}</p></td><td className="py-3.5 pr-4"><p className="font-medium">{plan?.name ?? "Unavailable plan"}</p><p className="mt-1 text-xs text-slate-400">{plan ? `${titleCase(plan.billing_interval)} × ${plan.billing_interval_count}` : "—"}</p></td><td className="py-3.5 pr-4"><StatusBadge status={subscription.status} /></td><td className="py-3.5 pr-4 text-xs text-slate-500">{formatLifecycleDate(subscription.start_date)}</td><td className="py-3.5 pr-4 text-xs text-slate-500">{formatLifecycleDate(subscription.next_billing_date)}</td><td className="py-3.5 pr-4"><p className="font-semibold text-slate-900">{formatInr(recurringAmount(subscription))}</p><p className="mt-1 text-[10px] text-slate-400">demo estimate</p></td><td className="py-3.5 pr-5 text-right"><Link href={`/subscriptions/${subscription.id}`} className="text-xs font-semibold text-[#635bff]">Details</Link></td></tr>;
        })}</tbody></table></div>
        <LifecyclePagination page={currentPage} totalPages={totalPages} count={filtered.length} pageSize={pageSize} onChange={setPage} noun="subscriptions" />
      </>}
    </section>
  </PageContainer>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <article className="rounded-xl border border-slate-200/80 bg-white p-5"><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p></article>;
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return <label className="relative flex h-10 items-center"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-full appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-3 pr-8 text-xs font-medium text-slate-600 outline-none">{options.map(([key, name]) => <option value={key} key={key}>{name}</option>)}</select><ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute right-2.5 text-slate-400" /></label>;
}

function SortButton({ label, sortKey, currentKey, direction, onClick }: { label: string; sortKey: SortKey; currentKey: SortKey; direction: "asc" | "desc"; onClick: () => void }) {
  const Icon = sortKey !== currentKey ? ArrowDownUp : direction === "asc" ? ArrowUp : ArrowDown;
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 hover:text-slate-700">{label}<Icon size={13} aria-hidden="true" /></button>;
}

const subscriptionLineSchema = z.object({
  product_id: z.number().int().positive("Choose a product."),
  variant_id: z.number().int().positive().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least one."),
  unit_price: z.string().regex(/^\d+(?:\.\d{1,2})?$/, "Enter a valid non-negative unit price."),
});
const subscriptionFormSchema = z.object({
  customer_id: z.string().min(1, "Select a customer."),
  plan_id: z.number().int().positive("Select a plan."),
  start_date: z.iso.date("Choose a valid start date."),
  expiry_date: z.union([z.literal(""), z.iso.date("Choose a valid expiry date.")]),
  payment_terms: z.string().max(255, "Use 255 characters or fewer."),
  lines: z.array(subscriptionLineSchema).min(1, "Add at least one line item."),
}).superRefine((values, context) => {
  if (values.expiry_date && values.expiry_date < values.start_date) {
    context.addIssue({ code: "custom", message: "Expiry date must be on or after the start date.", path: ["expiry_date"] });
  }
});
type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

const emptySubscriptionLine = {
  product_id: 0,
  variant_id: null as number | null,
  quantity: 1,
  unit_price: "",
};

function valuesFromSubscription(subscription: Subscription): SubscriptionFormValues {
  return {
    customer_id: subscription.customer_id,
    plan_id: subscription.plan_id,
    start_date: subscription.start_date,
    expiry_date: subscription.expiry_date ?? "",
    payment_terms: subscription.payment_terms,
    lines: subscription.lines.map(({ product_id, variant_id, quantity, unit_price }) => ({ product_id, variant_id, quantity, unit_price })),
  };
}

export function SubscriptionForm({ mode, subscription }: { mode: "create" | "edit"; subscription?: Subscription }) {
  const router = useRouter();
  const { customers, products, variants, plans, createSubscription, updateSubscription, notify } = useLifecycle();
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: subscription ? valuesFromSubscription(subscription) : {
      customer_id: "",
      plan_id: 0,
      start_date: today(),
      expiry_date: "",
      payment_terms: "",
      lines: [{ ...emptySubscriptionLine }],
    },
    mode: "onBlur",
  });
  const lineArray = useFieldArray({ control: form.control, name: "lines" });
  const lines = useWatch({ control: form.control, name: "lines" }) ?? [];
  const selectedCustomerId = useWatch({ control: form.control, name: "customer_id" }) ?? "";
  const selectedPlanId = Number(useWatch({ control: form.control, name: "plan_id" })) || 0;
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const demoAmount = demoLineAmount(lines.filter((line) => line && line.unit_price && Number.isFinite(Number(line.unit_price))));

  function changeProduct(index: number, rawId: string) {
    const id = Number(rawId);
    const product = products.find((item) => item.id === id);
    form.setValue(`lines.${index}.product_id`, id || 0, { shouldValidate: true });
    form.setValue(`lines.${index}.variant_id`, null);
    form.setValue(`lines.${index}.unit_price`, product?.sales_price ?? "");
  }
  function changeVariant(index: number, rawId: string, productId: number) {
    const variantId = rawId ? Number(rawId) : null;
    form.setValue(`lines.${index}.variant_id`, variantId, { shouldValidate: true });
    const product = products.find((item) => item.id === productId);
    const variant = variants.find((item) => item.id === variantId && item.product_id === productId);
    const cents = Math.round(Number(product?.sales_price ?? 0) * 100) + Math.round(Number(variant?.additional_price ?? 0) * 100);
    form.setValue(`lines.${index}.unit_price`, (cents / 100).toFixed(2), { shouldValidate: true });
  }
  function changePlan(rawId: string) {
    const planId = Number(rawId) || 0;
    form.setValue("plan_id", planId, { shouldValidate: true });
    const nextPlan = plans.find((plan) => plan.id === planId);
    if (nextPlan) {
      lines.forEach((line, index) => {
        if ((line?.quantity ?? 0) < nextPlan.minimum_quantity) {
          form.setValue(`lines.${index}.quantity`, nextPlan.minimum_quantity, { shouldValidate: true });
        }
      });
    }
  }

  function submit(values: SubscriptionFormValues) {
    try {
      const payload: SubscriptionCreatePayload = {
        customer_id: values.customer_id,
        plan_id: values.plan_id,
        start_date: values.start_date,
        expiry_date: values.expiry_date || null,
        payment_terms: values.payment_terms.trim(),
        lines: values.lines.map((line) => ({
          product_id: line.product_id,
          variant_id: line.variant_id,
          quantity: line.quantity,
          unit_price: Number(line.unit_price).toFixed(2),
        })),
      };
      const saved = mode === "create"
        ? createSubscription(payload)
        : subscription ? updateSubscription(subscription.id, {
          start_date: payload.start_date,
          expiry_date: payload.expiry_date,
          payment_terms: payload.payment_terms,
          lines: payload.lines,
        }) : null;
      if (!saved) {
        form.setError("root.server", { message: "Subscription details are unavailable. Return to the register and try again." });
        return;
      }
      notify(mode === "create" ? "Demo subscription created" : "Demo subscription updated", `${saved.subscription_number} was saved in this browser.`);
      router.push(`/subscriptions/${saved.id}`);
    } catch (error) {
      form.setError("root.server", { message: error instanceof Error ? error.message : "The subscription could not be saved." });
    }
  }

  const editing = mode === "edit";
  return <PageContainer>
    <LifecycleDemoNotice />
    <PageHeader eyebrow="Subscription register" title={editing ? "Edit subscription" : "New subscription"} description={editing ? `Update draft ${subscription?.subscription_number ?? "subscription"}. Customer and plan are fixed after creation.` : "Start a sample subscription from catalogue products and an existing plan."} action={<Link href={subscription ? `/subscriptions/${subscription.id}` : "/subscriptions"} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"><ArrowLeft size={15} />{editing ? "Cancel" : "Subscriptions"}</Link>} />
    <form onSubmit={form.handleSubmit(submit)} noValidate className="mx-auto max-w-[1100px] space-y-5">
      <LifecycleSection title="Customer and plan" description="Customer, plan, and dates follow the documented subscription structure.">
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <CustomerSelect customers={customers} value={selectedCustomerId} disabled={editing} onChange={(value) => form.setValue("customer_id", value, { shouldValidate: true })} error={form.formState.errors.customer_id?.message} />
          <PlanSelect plans={plans} value={selectedPlanId ? String(selectedPlanId) : ""} disabled={editing} onChange={changePlan} error={form.formState.errors.plan_id?.message} />
          <LifecycleField id="subscription-start" label="Start date" required error={form.formState.errors.start_date?.message}><input id="subscription-start" type="date" {...form.register("start_date")} className={lifecycleInputClass} /></LifecycleField>
          <LifecycleField id="subscription-expiry" label="Expiry date" error={form.formState.errors.expiry_date?.message}><input id="subscription-expiry" type="date" {...form.register("expiry_date")} className={lifecycleInputClass} /><p className="mt-1 text-[11px] text-slate-400">Leave blank for no expiry.</p></LifecycleField>
          <LifecycleField id="subscription-terms" label="Payment terms" error={form.formState.errors.payment_terms?.message} className="sm:col-span-2"><input id="subscription-terms" {...form.register("payment_terms")} placeholder="Net 30" className={lifecycleInputClass} /></LifecycleField>
        </div>
      </LifecycleSection>
      <LifecycleSection title="Subscription items" description="Unit prices are stored as decimal strings; the recurring estimate is calculated for this demo only.">
        <div className="space-y-4 p-5 sm:p-6">
          {lineArray.fields.map((field, index) => {
            const productId = Number(lines[index]?.product_id) || 0;
            const availableVariants = variants.filter((variant) => variant.product_id === productId);
            const lineError = form.formState.errors.lines?.[index];
            return <div key={field.id} className="rounded-xl border border-slate-200 p-4"><div className="mb-4 flex items-center justify-between"><p className="text-xs font-semibold text-slate-700">Line {index + 1}</p>{lineArray.fields.length > 1 ? <button type="button" onClick={() => lineArray.remove(index)} aria-label={`Remove line ${index + 1}`} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button> : null}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ProductSelect products={products} value={productId ? String(productId) : ""} onChange={(value) => changeProduct(index, value)} error={lineError?.product_id?.message} />
              <LifecycleField id={`subscription-variant-${index}`} label="Product variant"><select id={`subscription-variant-${index}`} value={lines[index]?.variant_id ?? ""} disabled={!productId || availableVariants.length === 0} onChange={(event) => changeVariant(index, event.target.value, productId)} className={lifecycleInputClass}><option value="">{availableVariants.length ? "No variant" : "No variants"}</option>{availableVariants.map((variant: ProductVariant) => <option value={variant.id} key={variant.id}>{variant.name} (+{formatInr(variant.additional_price)})</option>)}</select></LifecycleField>
              <LifecycleField id={`subscription-quantity-${index}`} label={`Quantity${selectedPlan ? ` (min ${selectedPlan.minimum_quantity})` : ""}`} required error={lineError?.quantity?.message}><input id={`subscription-quantity-${index}`} type="number" min={selectedPlan?.minimum_quantity ?? 1} step="1" {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })} className={lifecycleInputClass} /></LifecycleField>
              <LifecycleField id={`subscription-price-${index}`} label="Unit price (INR)" required error={lineError?.unit_price?.message}><input id={`subscription-price-${index}`} inputMode="decimal" {...form.register(`lines.${index}.unit_price`)} className={lifecycleInputClass} /></LifecycleField>
              <div><span className="mb-1.5 block text-xs font-semibold text-slate-700">Demo line total</span><p className="flex h-10 items-center rounded-lg bg-slate-50 px-3 text-sm font-semibold text-slate-800">{formatInr((Math.round(Number(lines[index]?.unit_price || 0) * 100) * (Number(lines[index]?.quantity) || 0) / 100).toFixed(2))}</p></div>
            </div></div>;
          })}
          <button type="button" onClick={() => lineArray.append({ ...emptySubscriptionLine })} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Plus size={14} />Add item</button>
          {form.formState.errors.lines?.message ? <p role="alert" className="text-xs text-rose-600">{form.formState.errors.lines.message}</p> : null}
        </div>
      </LifecycleSection>
      <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex justify-between gap-3 text-sm font-semibold text-slate-900"><span>Demo recurring amount</span><span>{formatInr(demoAmount)}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">Computed from quoted unit price × quantity. Not a backend calculation or billing commitment.</p></div>
      {form.formState.errors.root?.server?.message ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{form.formState.errors.root.server.message}</p> : null}
      <div className="flex justify-end gap-2"><Link href={subscription ? `/subscriptions/${subscription.id}` : "/subscriptions"} className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600">Cancel</Link><button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white hover:bg-[#5148e5]">{editing ? "Save changes" : "Save draft subscription"}</button></div>
    </form>
  </PageContainer>;
}

export function SubscriptionEditScreen({ id }: { id: number }) {
  const { subscriptions, isReady, storageError, refresh } = useLifecycle();
  const { user } = useAuth();
  if (!isReady) return <PageContainer><LifecycleDemoNotice /><LifecycleLoading label="subscription" /></PageContainer>;
  if (storageError) return <PageContainer><LifecycleDemoNotice /><LifecycleStorageError message={storageError} onRetry={refresh} /></PageContainer>;
  const subscription = subscriptions.find((item) => item.id === id);
  if (!subscription || user?.role === "CUSTOMER") return <PageContainer><LifecycleDemoNotice /><EmptyState icon={Repeat2} title="Subscription not available" description="This subscription cannot be edited from your account." /><Link href="/subscriptions" className="text-sm font-semibold text-[#635bff]">Return to subscriptions</Link></PageContainer>;
  if (subscription.status !== "draft" && subscription.status !== "quotation") return <PageContainer><LifecycleDemoNotice /><EmptyState icon={Repeat2} title="Subscription is read-only" description="Only draft or quotation subscriptions can be edited in this demo workflow." /><Link href={`/subscriptions/${id}`} className="text-sm font-semibold text-[#635bff]">View subscription</Link></PageContainer>;
  return <SubscriptionForm mode="edit" subscription={subscription} />;
}

type PendingAction = { action: SubscriptionAction; label: string };

function actionAvailability(subscription: Subscription, plan?: SubscriptionPlan): PendingAction[] {
  const actions: PendingAction[] = [];
  if (subscription.status === "draft" || subscription.status === "quotation") actions.push({ action: "confirm", label: "Confirm" });
  if (subscription.status === "active" && plan?.allow_pause) actions.push({ action: "pause", label: "Pause" });
  if (subscription.status === "paused" && plan?.allow_pause) actions.push({ action: "resume", label: "Resume" });
  if (subscription.status === "active" && plan?.allow_renewal) actions.push({ action: "renew", label: "Renew" });
  if (["confirmed", "active", "paused"].includes(subscription.status)) actions.push({ action: "close", label: "Close" });
  return actions;
}

export function SubscriptionDetails({ id }: { id: number }) {
  const { subscriptions, quotations, customers, products, variants, plans, isReady, storageError, refresh, actOnSubscription, notify } = useLifecycle();
  const { user } = useAuth();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  if (!isReady) return <PageContainer><LifecycleDemoNotice /><LifecycleLoading label="subscription" /></PageContainer>;
  if (storageError) return <PageContainer><LifecycleDemoNotice /><LifecycleStorageError message={storageError} onRetry={refresh} /></PageContainer>;
  const subscription = subscriptions.find((item) => item.id === id);
  if (!subscription) return <PageContainer><LifecycleDemoNotice /><EmptyState icon={Repeat2} title="Subscription not found" description="This record is not available in the local subscription register." /><Link href="/subscriptions" className="text-sm font-semibold text-[#635bff]">Return to subscriptions</Link></PageContainer>;
  const customer = customerFor(subscription, customers);
  if (user?.role === "CUSTOMER" && customer?.email.toLowerCase() !== user.email.toLowerCase()) {
    return <PageContainer><LifecycleDemoNotice /><EmptyState icon={Repeat2} title="Subscription not found" description="This subscription is not associated with your customer account." /><Link href="/subscriptions" className="text-sm font-semibold text-[#635bff]">Return to your subscriptions</Link></PageContainer>;
  }
  const plan = plans.find((item) => item.id === subscription.plan_id);
  const quotation = subscription.quotation_id ? quotations.find((item) => item.id === subscription.quotation_id) : undefined;
  const actions = user?.role === "CUSTOMER" ? [] : actionAvailability(subscription, plan);

  function completeAction() {
    if (!pending) return;
    setActionError(null);
    try {
      const updated = actOnSubscription(id, pending.action);
      notify(`${pending.label} complete`, `${updated.subscription_number} is now ${updated.status}.`);
      setPending(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The lifecycle action could not be completed.";
      setActionError(message);
      notify("Lifecycle action failed", message, "error");
    }
  }

  return <PageContainer>
    <LifecycleDemoNotice />
    <PageHeader eyebrow="Subscription" title={subscription.subscription_number} description="Billing profile, linked catalogue items, and subscription lifecycle." action={<div className="flex flex-wrap gap-2"><Link href="/subscriptions" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600"><ArrowLeft size={14} />Subscriptions</Link>{user?.role !== "CUSTOMER" && (subscription.status === "draft" || subscription.status === "quotation") ? <Link href={`/subscriptions/${id}/edit`} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#635bff] px-3 text-xs font-semibold text-white">Edit draft</Link> : null}</div>} />
    {actionError ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</p> : null}
    <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
      <div className="space-y-5">
        <LifecycleSection title="Subscription overview" description="Customer and lifecycle information from the local demo record.">
          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Status"><StatusBadge status={subscription.status} /></Detail>
            <Detail label="Customer">{customerDisplayName(customer)}<p className="mt-1 text-xs text-slate-400">{customer?.email}</p></Detail>
            <Detail label="Plan">{plan?.name ?? "Unavailable plan"}<p className="mt-1 text-xs text-slate-400">{plan ? `${titleCase(plan.billing_interval)} × ${plan.billing_interval_count}` : "—"}</p></Detail>
            <Detail label="Start date">{formatLifecycleDate(subscription.start_date)}</Detail>
            <Detail label="Expiry date">{formatLifecycleDate(subscription.expiry_date)}</Detail>
            <Detail label="Next billing date">{formatLifecycleDate(subscription.next_billing_date)}</Detail>
            <Detail label="Payment terms">{subscription.payment_terms || "Not specified"}</Detail>
            <Detail label="Created">{formatLifecycleDate(subscription.created_at, true)}</Detail>
            <Detail label="Closed">{formatLifecycleDate(subscription.closed_at, true)}</Detail>
          </div>
        </LifecycleSection>
        <LifecycleSection title="Subscription items" description="Unit prices are preserved snapshots in the mock data.">
          <div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left"><caption className="sr-only">Subscription line items</caption><thead><tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><th className="py-3 pl-5 pr-4">Product / variant</th><th className="py-3 pr-4">Quantity</th><th className="py-3 pr-4">Unit price</th><th className="py-3 pr-5 text-right">Demo line amount</th></tr></thead><tbody className="divide-y divide-slate-100">{subscription.lines.map((line) => {
            const product = products.find((item) => item.id === line.product_id);
            const variant = variants.find((item) => item.id === line.variant_id);
            return <tr key={line.id} className="text-sm"><td className="py-4 pl-5 pr-4 font-medium text-slate-800">{product?.name ?? "Unavailable product"}{variant ? <p className="mt-1 text-xs text-slate-400">{variant.name}</p> : null}</td><td className="py-4 pr-4 text-slate-600">{line.quantity}</td><td className="py-4 pr-4 text-slate-600">{formatInr(line.unit_price)}</td><td className="py-4 pr-5 text-right font-semibold text-slate-900">{formatInr(line.line_total)}</td></tr>;
          })}</tbody></table></div>
        </LifecycleSection>
      </div>
      <aside className="h-fit space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">Demo recurring amount</h2><p className="mt-3 text-2xl font-semibold text-slate-950">{formatInr(recurringAmount(subscription))}</p><p className="mt-2 text-xs leading-5 text-slate-500">Estimated from line snapshots; not an invoice or backend billing calculation.</p></div>
        {quotation ? <div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">Source quotation</h2><p className="mt-2 text-xs text-slate-500">Converted from {quotation.quotation_number}</p><Link href={`/quotations/${quotation.id}`} className="mt-3 inline-block text-xs font-semibold text-[#635bff]">View quotation</Link></div> : null}
        {actions.length ? <div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">Lifecycle actions</h2><p className="mt-1 text-xs leading-5 text-slate-500">Actions are gated by this status and the selected plan settings.</p><div className="mt-4 grid grid-cols-2 gap-2">{actions.map((action) => <button key={action.action} type="button" onClick={() => setPending(action)} className={`h-9 rounded-lg border px-3 text-xs font-semibold transition ${action.action === "close" ? "border-rose-200 text-rose-700 hover:bg-rose-50" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>{action.label}</button>)}</div></div> : null}
      </aside>
    </div>
    {pending ? <ActionDialog pending={pending} subscription={subscription} onCancel={() => setPending(null)} onConfirm={completeAction} /> : null}
  </PageContainer>;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-800">{children}</dd></div>;
}

function ActionDialog({ pending, subscription, onCancel, onConfirm }: { pending: PendingAction; subscription: Subscription; onCancel: () => void; onConfirm: () => void }) {
  const descriptions: Record<SubscriptionAction, string> = {
    confirm: "The draft will move to confirmed status. This demo does not initiate billing.",
    pause: "The active subscription will be paused. Billing schedule automation is not implemented.",
    resume: "The paused subscription will return to active status.",
    renew: "The plan interval will extend the current expiry and next billing date in demo data.",
    close: "The subscription will be marked closed and its next billing date cleared.",
  };
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><section role="alertdialog" aria-modal="true" aria-labelledby="subscription-action-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="subscription-action-title" className="text-lg font-semibold text-slate-900">{pending.label} subscription?</h2><p className="mt-2 text-sm leading-6 text-slate-500">{descriptions[pending.action]}</p><p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">{subscription.subscription_number} · current status: {subscription.status}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onCancel} className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600">Cancel</button><button type="button" onClick={onConfirm} className={`h-10 rounded-lg px-4 text-xs font-semibold text-white ${pending.action === "close" ? "bg-rose-600 hover:bg-rose-700" : "bg-[#635bff] hover:bg-[#5148e5]"}`}>Confirm {pending.label.toLowerCase()}</button></div></section></div>;
}
