"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowLeft,
  ArrowUp,
  FileText,
  FilterX,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
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
  demoLineAmount,
  customerDisplayName,
  formatInr,
  formatLifecycleDate,
  lifecycleInputClass,
} from "@/components/lifecycle/lifecycle-shared";
import { useAuth } from "@/lib/auth/auth-context";
import type { Customer } from "@/types/customer";
import type { ProductVariant } from "@/types/catalog";
import type {
  Quotation,
  QuotationCreatePayload,
  QuotationStatus,
} from "@/types/quotation";

const pageSize = 8;
const today = () => new Date().toISOString().slice(0, 10);
const quotationStatuses: QuotationStatus[] = ["draft", "sent", "accepted", "rejected", "expired", "converted"];
type SortKey = "created_at" | "grand_total" | "status";

function customerFor(quotation: Quotation, customers: Customer[]) {
  return customers.find((customer) => customer.id === quotation.customer_id);
}

function visibleQuotations(
  quotations: Quotation[],
  customers: Customer[],
  role: string | undefined,
  email: string | undefined,
) {
  if (role !== "CUSTOMER") return quotations;
  const ownIds = new Set(customers.filter((customer) => customer.email.toLowerCase() === email?.toLowerCase()).map((customer) => customer.id));
  return quotations.filter((quotation) => ownIds.has(quotation.customer_id));
}

export function QuotationListing() {
  const { quotations, customers, isReady, storageError, refresh } = useLifecycle();
  const { user } = useAuth();
  const rows = visibleQuotations(quotations, customers, user?.role, user?.email);
  const canCreate = user?.role === "ADMIN" || user?.role === "STAFF";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | QuotationStatus>("all");
  const [from, setFrom] = useState("");
  const [until, setUntil] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return rows
      .filter((quotation) => status === "all" || quotation.status === status)
      .filter((quotation) => !from || quotation.created_at.slice(0, 10) >= from)
      .filter((quotation) => !until || quotation.created_at.slice(0, 10) <= until)
      .filter((quotation) => {
        const customer = customerFor(quotation, customers);
        return !search || quotation.quotation_number.toLowerCase().includes(search) ||
          customer?.name.toLowerCase().includes(search) ||
          customer?.companyName?.toLowerCase().includes(search);
      })
      .toSorted((left, right) => {
        const comparison = sortKey === "created_at"
          ? left.created_at.localeCompare(right.created_at)
          : sortKey === "grand_total"
            ? Number(left.grand_total) - Number(right.grand_total)
            : left.status.localeCompare(right.status);
        return direction === "asc" ? comparison : -comparison;
      });
  }, [rows, customers, query, status, from, until, sortKey, direction]);
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
    setFrom("");
    setUntil("");
    setPage(1);
  }

  const filteredOn = Boolean(query || status !== "all" || from || until);
  return <PageContainer>
    <LifecycleDemoNotice />
    {storageError ? <LifecycleStorageError message={storageError} onRetry={refresh} /> : null}
    <PageHeader eyebrow="Sales" title="Quotations" description={user?.role === "CUSTOMER" ? "Review quotations prepared for your customer account." : "Prepare and track customer quotations before subscription conversion."} action={canCreate ? <Link href="/quotations/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white hover:bg-[#5148e5]"><Plus size={16} aria-hidden="true" />New quotation</Link> : undefined} />
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Quotation summary">
      <Summary label="Quotations" value={isReady ? rows.length.toLocaleString("en-IN") : "—"} />
      <Summary label="Awaiting response" value={isReady ? rows.filter((quote) => quote.status === "sent").length.toLocaleString("en-IN") : "—"} />
      <Summary label="Accepted" value={isReady ? rows.filter((quote) => quote.status === "accepted").length.toLocaleString("en-IN") : "—"} />
    </section>
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between sm:px-5">
        <div><h2 className="text-sm font-semibold text-slate-900">Quotation register <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{isReady ? rows.length : "—"}</span></h2><p className="mt-1 text-xs text-slate-500">The API contract does not define send/accept/reject action routes.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 sm:w-[230px]"><Search size={15} aria-hidden="true" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} aria-label="Search quotations" placeholder="Number or customer..." className="w-full bg-transparent text-xs outline-none" /></label>
          <Select label="Filter by quotation status" value={status} onChange={(value) => { setStatus(value as "all" | QuotationStatus); setPage(1); }} options={[["all", "All statuses"], ...quotationStatuses.map((item) => [item, titleCase(item)] as [string, string])]} />
          <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] text-slate-500"><span>From</span><input type="date" aria-label="Quotation date from" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className="w-[116px] text-xs text-slate-600 outline-none" /></label>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] text-slate-500"><span>To</span><input type="date" aria-label="Quotation date to" value={until} onChange={(event) => { setUntil(event.target.value); setPage(1); }} className="w-[116px] text-xs text-slate-600 outline-none" /></label>
          {filteredOn ? <button type="button" onClick={clearFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600"><FilterX size={14} />Clear</button> : null}
        </div>
      </div>
      {!isReady ? <LifecycleLoading label="quotations" /> : storageError ? null : filtered.length === 0 ? <EmptyState icon={FileText} title={filteredOn ? "No matching quotations" : "No quotations yet"} description={filteredOn ? "Adjust the search or filters to find another quotation." : "Create a quotation to start a sales conversation."} /> : <>
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left">
          <caption className="sr-only">Customer quotations</caption>
          <thead><tr className="border-y border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            <th scope="col" className="py-3 pl-5 pr-4"><SortButton label="Quotation" sortKey="created_at" currentKey={sortKey} direction={direction} onClick={() => changeSort("created_at")} /></th>
            <th scope="col" className="py-3 pr-4">Customer</th>
            <th scope="col" className="py-3 pr-4"><SortButton label="Status" sortKey="status" currentKey={sortKey} direction={direction} onClick={() => changeSort("status")} /></th>
            <th scope="col" className="py-3 pr-4">Valid until</th>
            <th scope="col" className="py-3 pr-4"><SortButton label="Amount" sortKey="grand_total" currentKey={sortKey} direction={direction} onClick={() => changeSort("grand_total")} /></th>
            <th scope="col" className="py-3 pr-4">Tax / discount</th>
            <th scope="col" className="py-3 pr-5 text-right">Open</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">{visible.map((quote) => {
            const customer = customerFor(quote, customers);
            return <tr key={quote.id} className="text-sm text-slate-700">
              <td className="py-3.5 pl-5 pr-4"><Link href={`/quotations/${quote.id}`} className="font-semibold text-slate-900 hover:text-[#5148e5]">{quote.quotation_number}</Link><p className="mt-1 text-xs text-slate-400">Created {formatLifecycleDate(quote.created_at)}</p></td>
              <td className="py-3.5 pr-4"><p className="font-medium">{customerDisplayName(customer)}</p><p className="mt-1 text-xs text-slate-400">{customer?.email ?? "Customer unavailable"}</p></td>
              <td className="py-3.5 pr-4"><StatusBadge status={quote.status} /></td>
              <td className="py-3.5 pr-4 text-xs text-slate-500">{formatLifecycleDate(quote.valid_until)}</td>
              <td className="py-3.5 pr-4"><p className="font-semibold text-slate-900">{formatInr(quote.grand_total)}</p><p className="mt-1 text-[10px] text-slate-400">demo total</p></td>
              <td className="py-3.5 pr-4 text-xs text-slate-500">{formatInr(quote.tax_total)} / {formatInr(quote.discount_total)}</td>
              <td className="py-3.5 pr-5 text-right"><Link href={`/quotations/${quote.id}`} className="text-xs font-semibold text-[#635bff] hover:text-[#5148e5]">Details</Link></td>
            </tr>;
          })}</tbody>
        </table></div>
        <LifecyclePagination page={currentPage} totalPages={totalPages} count={filtered.length} pageSize={pageSize} onChange={setPage} noun="quotations" />
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
  return <label className="relative flex h-10 items-center"><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-full appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-3 pr-8 text-xs font-medium text-slate-600 outline-none">{options.map(([key, name]) => <option value={key} key={key}>{name}</option>)}</select><span aria-hidden="true" className="pointer-events-none absolute right-2.5 text-slate-400">⌄</span></label>;
}

function SortButton({ label, sortKey, currentKey, direction, onClick }: { label: string; sortKey: SortKey; currentKey: SortKey; direction: "asc" | "desc"; onClick: () => void }) {
  const Icon = sortKey !== currentKey ? ArrowDownUp : direction === "asc" ? ArrowUp : ArrowDown;
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 hover:text-slate-700">{label}<Icon size={13} aria-hidden="true" /></button>;
}

const quoteLineSchema = z.object({
  product_id: z.number().int().positive("Choose a product."),
  variant_id: z.number().int().positive().nullable(),
  plan_id: z.number().int().positive("Choose a plan."),
  quantity: z.number().int().min(1, "Quantity must be at least one."),
  unit_price: z.string().regex(/^\d+(?:\.\d{1,2})?$/, "Enter a valid non-negative unit price."),
});
const quotationFormSchema = z.object({
  customer_id: z.string().min(1, "Select a customer."),
  valid_until: z.string().min(1, "Choose an expiry date.").refine((value) => value >= today(), "Expiry date cannot be in the past."),
  payment_terms: z.string().max(255, "Use 255 characters or fewer."),
  lines: z.array(quoteLineSchema).min(1, "Add at least one line item."),
});
type QuotationFormValues = z.infer<typeof quotationFormSchema>;

const emptyQuotationLine = {
  product_id: 0,
  variant_id: null as number | null,
  plan_id: 0,
  quantity: 1,
  unit_price: "",
};

function valuesFromQuotation(quotation: Quotation): QuotationFormValues {
  return {
    customer_id: quotation.customer_id,
    valid_until: quotation.valid_until,
    payment_terms: quotation.payment_terms,
    lines: quotation.lines.map(({ product_id, variant_id, plan_id, quantity, unit_price }) => ({
      product_id,
      variant_id,
      plan_id,
      quantity,
      unit_price,
    })),
  };
}

export function QuotationForm({ mode, quotation }: { mode: "create" | "edit"; quotation?: Quotation }) {
  const router = useRouter();
  const { customers, products, variants, plans, createQuotation, updateQuotation, notify } = useLifecycle();
  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: quotation ? valuesFromQuotation(quotation) : {
      customer_id: "",
      valid_until: "",
      payment_terms: "",
      lines: [{ ...emptyQuotationLine }],
    },
    mode: "onBlur",
  });
  const lineArray = useFieldArray({ control: form.control, name: "lines" });
  const watchedLines = useWatch({ control: form.control, name: "lines" }) ?? [];
  const watchedCustomerId = useWatch({ control: form.control, name: "customer_id" }) ?? "";
  const watchProducts = watchedLines;
  const demoAmount = demoLineAmount(watchedLines.filter((line) => line && line.unit_price && Number.isFinite(Number(line.unit_price))));

  function lineProductChanged(index: number, rawId: string) {
    const id = Number(rawId);
    const product = products.find((item) => item.id === id);
    form.setValue(`lines.${index}.product_id`, id || 0, { shouldValidate: true });
    form.setValue(`lines.${index}.variant_id`, null);
    form.setValue(`lines.${index}.unit_price`, product?.sales_price ?? "");
  }

  function lineVariantChanged(index: number, rawId: string, productId: number) {
    const variantId = rawId ? Number(rawId) : null;
    form.setValue(`lines.${index}.variant_id`, variantId, { shouldValidate: true });
    const product = products.find((item) => item.id === productId);
    const variant = variants.find((item) => item.id === variantId && item.product_id === productId);
    const cents = Math.round(Number(product?.sales_price ?? 0) * 100) + Math.round(Number(variant?.additional_price ?? 0) * 100);
    form.setValue(`lines.${index}.unit_price`, (cents / 100).toFixed(2), { shouldValidate: true });
  }

  function submit(values: QuotationFormValues) {
    try {
      const payload: QuotationCreatePayload = {
        customer_id: values.customer_id,
        valid_until: values.valid_until,
        payment_terms: values.payment_terms.trim(),
        lines: values.lines.map((line) => ({
          product_id: line.product_id,
          variant_id: line.variant_id,
          plan_id: line.plan_id,
          quantity: line.quantity,
          unit_price: Number(line.unit_price).toFixed(2),
        })),
      };
      const saved = mode === "create"
        ? createQuotation(payload)
        : quotation ? updateQuotation(quotation.id, payload) : null;
      if (!saved) {
        form.setError("root.server", { message: "Quotation details are unavailable. Return to the register and try again." });
        return;
      }
      notify(mode === "create" ? "Demo quotation created" : "Demo quotation updated", `${saved.quotation_number} was saved in this browser.`);
      router.push(`/quotations/${saved.id}`);
    } catch (error) {
      form.setError("root.server", { message: error instanceof Error ? error.message : "The quotation could not be saved." });
    }
  }

  return <PageContainer>
    <LifecycleDemoNotice />
    <PageHeader eyebrow="Quotation register" title={mode === "create" ? "New quotation" : "Edit quotation"} description={mode === "create" ? "Prepare a sample offer using customers, products, and plans already in the catalogue." : `Update draft ${quotation?.quotation_number ?? "quotation"}.`} action={<Link href={quotation ? `/quotations/${quotation.id}` : "/quotations"} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"><ArrowLeft size={15} aria-hidden="true" />{mode === "create" ? "Quotations" : "Cancel"}</Link>} />
    <form onSubmit={form.handleSubmit(submit)} noValidate className="mx-auto max-w-[1100px] space-y-5">
      <LifecycleSection title="Customer and validity" description="Quotation date is the created timestamp; the contract provides a validity end date.">
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <CustomerSelect customers={customers} value={watchedCustomerId} onChange={(value) => form.setValue("customer_id", value, { shouldValidate: true })} error={form.formState.errors.customer_id?.message} />
          <LifecycleField id="quotation-valid-until" label="Valid until" required error={form.formState.errors.valid_until?.message}><input id="quotation-valid-until" type="date" min={today()} {...form.register("valid_until")} className={lifecycleInputClass} /></LifecycleField>
          <LifecycleField id="quotation-payment-terms" label="Payment terms" error={form.formState.errors.payment_terms?.message} className="sm:col-span-2"><input id="quotation-payment-terms" placeholder="Net 30" {...form.register("payment_terms")} className={lifecycleInputClass} /></LifecycleField>
        </div>
      </LifecycleSection>
      <LifecycleSection title="Line items" description="Each line references an existing product, optional variant, plan, quantity, and quoted unit price.">
        <div className="space-y-4 p-5 sm:p-6">
          {lineArray.fields.map((field, index) => {
            const currentProduct = Number(watchProducts?.[index]?.product_id) || 0;
            const availableVariants = variants.filter((variant) => variant.product_id === currentProduct);
            const lineError = form.formState.errors.lines?.[index];
            return <div key={field.id} className="rounded-xl border border-slate-200 p-4">
              <div className="mb-4 flex items-center justify-between"><p className="text-xs font-semibold text-slate-700">Line {index + 1}</p>{lineArray.fields.length > 1 ? <button type="button" onClick={() => lineArray.remove(index)} aria-label={`Remove line ${index + 1}`} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button> : null}</div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ProductSelect products={products} value={currentProduct ? String(currentProduct) : ""} onChange={(value) => lineProductChanged(index, value)} error={lineError?.product_id?.message} />
                <LifecycleField id={`quotation-variant-${index}`} label="Product variant"><select id={`quotation-variant-${index}`} value={watchProducts?.[index]?.variant_id ?? ""} disabled={!currentProduct || availableVariants.length === 0} onChange={(event) => lineVariantChanged(index, event.target.value, currentProduct)} className={lifecycleInputClass}><option value="">{availableVariants.length ? "No variant" : "No variants"}</option>{availableVariants.map((variant: ProductVariant) => <option value={variant.id} key={variant.id}>{variant.name} (+{formatInr(variant.additional_price)})</option>)}</select></LifecycleField>
                <PlanSelect plans={plans} value={watchProducts?.[index]?.plan_id ? String(watchProducts[index].plan_id) : ""} onChange={(value) => form.setValue(`lines.${index}.plan_id`, Number(value) || 0, { shouldValidate: true })} error={lineError?.plan_id?.message} />
                <LifecycleField id={`quotation-quantity-${index}`} label="Quantity" required error={lineError?.quantity?.message}><input id={`quotation-quantity-${index}`} type="number" min="1" step="1" {...form.register(`lines.${index}.quantity`, { valueAsNumber: true })} className={lifecycleInputClass} /></LifecycleField>
                <LifecycleField id={`quotation-unit-price-${index}`} label="Quoted unit price (INR)" required error={lineError?.unit_price?.message}><input id={`quotation-unit-price-${index}`} inputMode="decimal" {...form.register(`lines.${index}.unit_price`)} className={lifecycleInputClass} /></LifecycleField>
                <div><span className="mb-1.5 block text-xs font-semibold text-slate-700">Demo line total</span><p className="flex h-10 items-center rounded-lg bg-slate-50 px-3 text-sm font-semibold text-slate-800">{formatInr((Math.round(Number(watchProducts?.[index]?.unit_price || 0) * 100) * (Number(watchProducts?.[index]?.quantity) || 0) / 100).toFixed(2))}</p></div>
              </div>
            </div>;
          })}
          <button type="button" onClick={() => lineArray.append({ ...emptyQuotationLine })} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Plus size={14} />Add line item</button>
          {form.formState.errors.lines?.message ? <p role="alert" className="text-xs text-rose-600">{form.formState.errors.lines.message}</p> : null}
        </div>
      </LifecycleSection>
      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">Totals and calculation note</h2><p className="mt-2 text-xs leading-5 text-slate-500">The contract defines quotation totals but no quotation tax/discount input fields. This demo calculates a line subtotal only; tax and discount are 0.00 and no result is an authoritative financial quote.</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex justify-between text-xs text-slate-500"><span>Demo subtotal</span><span>{formatInr(demoAmount)}</span></div><div className="mt-3 flex justify-between text-xs text-slate-500"><span>Demo discount</span><span>{formatInr("0.00")}</span></div><div className="mt-3 flex justify-between text-xs text-slate-500"><span>Demo tax</span><span>{formatInr("0.00")}</span></div><div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-slate-900"><span>Demo total</span><span>{formatInr(demoAmount)}</span></div></div>
      </section>
      {form.formState.errors.root?.server?.message ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{form.formState.errors.root.server.message}</p> : null}
      <div className="flex justify-end gap-2"><Link href={quotation ? `/quotations/${quotation.id}` : "/quotations"} className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link><button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white hover:bg-[#5148e5]">{mode === "create" ? "Save draft quotation" : "Save changes"}</button></div>
    </form>
  </PageContainer>;
}

export function QuotationEditScreen({ id }: { id: number }) {
  const { quotations, isReady, storageError, refresh } = useLifecycle();
  const { user } = useAuth();
  if (!isReady) return <PageContainer><LifecycleDemoNotice /><LifecycleLoading label="quotation" /></PageContainer>;
  if (storageError) return <PageContainer><LifecycleDemoNotice /><LifecycleStorageError message={storageError} onRetry={refresh} /></PageContainer>;
  const quote = quotations.find((item) => item.id === id);
  if (!quote || user?.role === "CUSTOMER") {
    return <PageContainer><LifecycleDemoNotice /><EmptyState icon={FileText} title="Quotation not available" description="This quotation cannot be edited from your account." /><Link href="/quotations" className="text-sm font-semibold text-[#635bff]">Return to quotations</Link></PageContainer>;
  }
  if (quote.status !== "draft") return <PageContainer><LifecycleDemoNotice /><EmptyState icon={FileText} title="Quotation is read-only" description="Only draft quotations can be edited in this demo workflow." /><Link href={`/quotations/${id}`} className="text-sm font-semibold text-[#635bff]">View quotation</Link></PageContainer>;
  return <QuotationForm mode="edit" quotation={quote} />;
}

export function QuotationDetails({ id }: { id: number }) {
  const { quotations, subscriptions, customers, products, variants, plans, isReady, storageError, refresh, convertQuotation, notify } = useLifecycle();
  const { user } = useAuth();
  const [showConversion, setShowConversion] = useState(false);
  const [startDate, setStartDate] = useState(today());
  const [expiryDate, setExpiryDate] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  if (!isReady) return <PageContainer><LifecycleDemoNotice /><LifecycleLoading label="quotation" /></PageContainer>;
  if (storageError) return <PageContainer><LifecycleDemoNotice /><LifecycleStorageError message={storageError} onRetry={refresh} /></PageContainer>;
  const quotation = quotations.find((item) => item.id === id);
  if (!quotation) return <PageContainer><LifecycleDemoNotice /><EmptyState icon={FileText} title="Quotation not found" description="This record is not available in the local quotation register." /><Link href="/quotations" className="text-sm font-semibold text-[#635bff]">Return to quotations</Link></PageContainer>;
  const currentQuotation = quotation;
  const customer = customerFor(currentQuotation, customers);
  if (user?.role === "CUSTOMER" && customer?.email.toLowerCase() !== user.email.toLowerCase()) {
    return <PageContainer><LifecycleDemoNotice /><EmptyState icon={FileText} title="Quotation not found" description="This quotation is not associated with your customer account." /><Link href="/quotations" className="text-sm font-semibold text-[#635bff]">Return to your quotations</Link></PageContainer>;
  }
  const canManage = user?.role === "ADMIN" || user?.role === "STAFF";
  const linkedSubscription = currentQuotation.converted_subscription_id
    ? subscriptions.find((item) => item.id === currentQuotation.converted_subscription_id)
    : undefined;
  const hasMultiplePlans = new Set(currentQuotation.lines.map((line) => line.plan_id)).size !== 1;
  const mayConvert = canManage && currentQuotation.status === "accepted" &&
    currentQuotation.converted_subscription_id === null && currentQuotation.valid_until >= today() && !hasMultiplePlans;

  function convert() {
    setActionError(null);
    try {
      const subscription = convertQuotation(id, startDate, expiryDate);
      notify("Quotation converted", `${currentQuotation.quotation_number} created ${subscription.subscription_number}.`);
      setShowConversion(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The quotation could not be converted.";
      setActionError(message);
      notify("Conversion could not be completed", message, "error");
    }
  }

  return <PageContainer>
    <LifecycleDemoNotice />
    <PageHeader eyebrow="Quotation" title={quotation.quotation_number} description="Customer offer and itemized demo totals." action={<div className="flex flex-wrap gap-2"><Link href="/quotations" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><ArrowLeft size={14} />Quotations</Link>{canManage && quotation.status === "draft" ? <Link href={`/quotations/${id}/edit`} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#635bff] px-3 text-xs font-semibold text-white hover:bg-[#5148e5]">Edit draft</Link> : null}{mayConvert ? <button type="button" onClick={() => { setExpiryDate(quotation.valid_until); setShowConversion(true); }} className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700">Convert to subscription</button> : null}</div>} />
    {actionError ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</p> : null}
    {quotation.status === "accepted" && !mayConvert && !linkedSubscription ? <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">{quotation.valid_until < today() ? "This accepted quotation has expired and cannot be converted." : hasMultiplePlans ? "This demo can convert only quotations whose line items use the same subscription plan." : "This quotation is not available for conversion."}</p> : null}
    {linkedSubscription ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"><p className="text-sm font-medium text-emerald-900">Converted to subscription <span className="font-bold">{linkedSubscription.subscription_number}</span></p><Link href={`/subscriptions/${linkedSubscription.id}`} className="text-xs font-semibold text-emerald-800 underline">View subscription</Link></div> : null}
    <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
      <div className="space-y-5">
        <LifecycleSection title="Quotation and customer" description="Current record status and contact details.">
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <Detail label="Status"><StatusBadge status={quotation.status} /></Detail>
            <Detail label="Customer">{customerDisplayName(customer)}<p className="mt-1 text-xs text-slate-400">{customer?.email}</p></Detail>
            <Detail label="Quotation date">{formatLifecycleDate(quotation.created_at, true)}</Detail>
            <Detail label="Valid until">{formatLifecycleDate(quotation.valid_until)}</Detail>
            <Detail label="Payment terms">{quotation.payment_terms || "Not specified"}</Detail>
            <Detail label="Updated">{formatLifecycleDate(quotation.updated_at, true)}</Detail>
          </div>
        </LifecycleSection>
        <LifecycleSection title="Quoted items" description="Prices are preserved snapshots from the demo quotation.">
          <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><caption className="sr-only">Quotation line items</caption><thead><tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><th className="py-3 pl-5 pr-4">Product / variant</th><th className="py-3 pr-4">Plan</th><th className="py-3 pr-4">Quantity</th><th className="py-3 pr-4">Unit price</th><th className="py-3 pr-5 text-right">Line total</th></tr></thead><tbody className="divide-y divide-slate-100">{quotation.lines.map((line) => {
            const product = products.find((item) => item.id === line.product_id);
            const variant = variants.find((item) => item.id === line.variant_id);
            const plan = plans.find((item) => item.id === line.plan_id);
            return <tr key={line.id} className="text-sm"><td className="py-4 pl-5 pr-4 font-medium text-slate-800">{product?.name ?? "Unavailable product"}{variant ? <p className="mt-1 text-xs text-slate-400">{variant.name}</p> : null}</td><td className="py-4 pr-4 text-slate-600">{plan?.name ?? "Unavailable plan"}</td><td className="py-4 pr-4 text-slate-600">{line.quantity}</td><td className="py-4 pr-4 text-slate-600">{formatInr(line.unit_price)}</td><td className="py-4 pr-5 text-right font-semibold text-slate-900">{formatInr(line.line_total)}</td></tr>;
          })}</tbody></table></div>
        </LifecycleSection>
        <LifecycleSection title="Activity & status history" description="Chronological record of status changes and events.">
          <div className="p-5 space-y-3">
            <div className="flex items-start gap-3 text-xs">
              <span className="size-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Quotation created (draft)</p>
                <p className="text-slate-400 mt-0.5">{formatLifecycleDate(quotation.created_at, true)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-xs">
              <span className="size-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">Current status: <span className="capitalize">{quotation.status}</span></p>
                <p className="text-slate-400 mt-0.5">Last updated {formatLifecycleDate(quotation.updated_at, true)} · Valid until {formatLifecycleDate(quotation.valid_until)}</p>
              </div>
            </div>
            {linkedSubscription ? (
              <div className="flex items-start gap-3 text-xs">
                <span className="size-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">Converted into subscription {linkedSubscription.subscription_number}</p>
                  <p className="text-slate-400 mt-0.5">{formatLifecycleDate(quotation.updated_at, true)}</p>
                </div>
              </div>
            ) : null}
          </div>
        </LifecycleSection>
      </div>
      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-semibold text-slate-900">Demo totals</h2><p className="mt-1 text-xs leading-5 text-slate-500">Calculated locally for the demo only.</p><Totals label="Subtotal" value={quotation.subtotal} /><Totals label="Discount" value={quotation.discount_total} /><Totals label="Tax" value={quotation.tax_total} /><Totals label="Demo total" value={quotation.grand_total} total /><p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-400">No tax or discount inputs are defined in the quotation create contract. Actual totals must be calculated and verified by the backend.</p></aside>
    </div>
    {showConversion ? <ConversionDialog startDate={startDate} expiryDate={expiryDate} onStartDate={setStartDate} onExpiryDate={setExpiryDate} onCancel={() => setShowConversion(false)} onConfirm={convert} /> : null}
  </PageContainer>;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-800">{children}</dd></div>;
}

function Totals({ label, value, total = false }: { label: string; value: string; total?: boolean }) {
  return <div className={`mt-4 flex justify-between gap-3 ${total ? "border-t border-slate-100 pt-4 text-sm font-semibold text-slate-900" : "text-xs text-slate-500"}`}><span>{label}</span><span>{formatInr(value)}</span></div>;
}

function ConversionDialog({ startDate, expiryDate, onStartDate, onExpiryDate, onCancel, onConfirm }: { startDate: string; expiryDate: string; onStartDate: (value: string) => void; onExpiryDate: (value: string) => void; onCancel: () => void; onConfirm: () => void }) {
  const [error, setError] = useState<string | null>(null);
  function confirm() {
    if (!startDate || !expiryDate) {
      setError("Choose both a subscription start and expiry date.");
      return;
    }
    if (expiryDate < startDate) {
      setError("Expiry date must be on or after the start date.");
      return;
    }
    onConfirm();
  }
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><section role="alertdialog" aria-modal="true" aria-labelledby="convert-title" aria-describedby="convert-description" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="convert-title" className="text-lg font-semibold text-slate-900">Convert quotation?</h2><p id="convert-description" className="mt-2 text-sm leading-6 text-slate-500">This will create one confirmed demo subscription and mark this accepted quotation converted. The mock prevents a second conversion; no backend request is made.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><LifecycleField id="convert-start-date" label="Start date" required><input id="convert-start-date" type="date" value={startDate} onChange={(event) => onStartDate(event.target.value)} className={lifecycleInputClass} /></LifecycleField><LifecycleField id="convert-expiry-date" label="Expiry date" required><input id="convert-expiry-date" type="date" value={expiryDate} onChange={(event) => onExpiryDate(event.target.value)} className={lifecycleInputClass} /></LifecycleField></div>{error ? <p role="alert" className="mt-3 text-xs text-rose-600">{error}</p> : null}<div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onCancel} className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600">Cancel</button><button type="button" onClick={confirm} className="h-10 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white">Confirm conversion</button></div></section></div>;
}
