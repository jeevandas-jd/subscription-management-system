"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowLeft,
  ArrowUp,
  Boxes,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Ellipsis,
  FilterX,
  Layers3,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
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
import { useProducts } from "@/components/catalog/catalog-provider";
import { useAuth } from "@/lib/auth/auth-context";
import { canManageCatalog } from "@/lib/auth/permissions";
import type {
  Product,
  ProductCreatePayload,
  ProductType,
  ProductVariant,
  VariantCreatePayload,
} from "@/types/catalog";

const pageSize = 8;
const productTypeLabels: Record<ProductType, string> = {
  service: "Service",
  physical: "Physical",
  digital: "Digital",
};
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

function formatPrice(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? currencyFormatter.format(amount) : value;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function CatalogDemoNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950" role="note">
      <span className="mt-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
        Demo data
      </span>
      <p className="text-xs leading-5 text-amber-800">
        Catalogue records are stored in this browser only. Product and plan changes are not sent to the backend.
      </p>
    </div>
  );
}

function StorageError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="alert">
      <div>
        <p className="text-sm font-semibold text-rose-800">Catalogue data is unavailable</p>
        <p className="mt-1 text-xs leading-5 text-rose-700">{message}</p>
      </div>
      <button type="button" onClick={onRetry} className="h-9 shrink-0 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100">
        Try again
      </button>
    </div>
  );
}

type ProductFilter = "all" | ProductType;
type ProductSort = "name" | "sales_price" | "created_at";

export function ProductListing() {
  const { products, variants, isReady, storageError, refresh, remove, notify } = useProducts();
  const { user } = useAuth();
  const canManage = Boolean(user && canManageCatalog(user.role));
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ProductFilter>("all");
  const [sortKey, setSortKey] = useState<ProductSort>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return products
      .filter((product) => type === "all" || product.type === type)
      .filter((product) => !search || [product.name, product.notes].some((value) => value.toLocaleLowerCase().includes(search)))
      .toSorted((left, right) => {
        const comparison =
          sortKey === "name"
            ? left.name.localeCompare(right.name)
            : sortKey === "sales_price"
              ? Number(left.sales_price) - Number(right.sales_price)
              : (left.created_at ?? "").localeCompare(right.created_at ?? "");
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [products, query, sortDirection, sortKey, type]);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasFilters = query.trim().length > 0 || type !== "all";

  function sortBy(key: ProductSort) {
    if (sortKey === key) setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDirection(key === "name" ? "asc" : "desc");
    }
    setPage(1);
  }

  function sortIcon(key: ProductSort) {
    if (sortKey !== key) return <ArrowDownUp size={13} aria-hidden="true" />;
    return sortDirection === "asc" ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />;
  }

  function clearFilters() {
    setQuery("");
    setType("all");
    setPage(1);
  }

  function confirmDelete() {
    if (!deleting) return;
    try {
      remove(deleting.id);
      notify("Sample product removed", `${deleting.name} was removed from this browser's demo catalogue.`);
      setDeleting(null);
    } catch (error) {
      notify("Product could not be removed", error instanceof Error ? error.message : "Please try again.", "error");
    }
  }

  return (
    <PageContainer>
      <CatalogDemoNotice />
      {storageError ? <StorageError message={storageError} onRetry={refresh} /> : null}
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Manage the products and services offered in your subscription catalogue."
        action={canManage ? (
          <Link href="/products/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white shadow-sm shadow-[#635bff]/20 transition hover:bg-[#5148e5]">
            <Plus size={16} aria-hidden="true" />
            Add product
          </Link>
        ) : undefined}
      />

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Product summary">
        <SummaryCard icon={Package} label="Products" value={isReady ? products.length.toLocaleString("en-IN") : "—"} />
        <SummaryCard icon={Layers3} label="Variants" value={isReady ? variants.length.toLocaleString("en-IN") : "—"} />
        <SummaryCard icon={Check} label="Active products" value={isReady ? products.filter((product) => product.is_active === true).length.toLocaleString("en-IN") : "—"} />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Product catalogue</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{isReady ? products.length : "—"}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Prices are sample values and are not used for billing.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-10 min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 focus-within:border-[#a5a0ff] focus-within:ring-2 focus-within:ring-[#635bff]/10 sm:w-[250px]">
              <Search size={16} aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search products..." aria-label="Search products" className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
            </label>
            <label className="relative flex h-10 items-center">
              <span className="sr-only">Filter by product type</span>
              <select value={type} onChange={(event) => { setType(event.target.value as ProductFilter); setPage(1); }} className="h-full w-full appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-3 pr-9 text-xs font-medium text-slate-600 outline-none focus:border-[#a5a0ff] focus:ring-2 focus:ring-[#635bff]/10 sm:w-[150px]">
                <option value="all">All types</option>
                <option value="service">Service</option>
                <option value="physical">Physical</option>
                <option value="digital">Digital</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 text-slate-400" size={14} aria-hidden="true" />
            </label>
            {hasFilters ? <button type="button" onClick={clearFilters} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><FilterX size={14} aria-hidden="true" />Clear</button> : null}
          </div>
        </div>
        {!isReady ? (
          <div className="space-y-4 p-5" aria-label="Loading products">{Array.from({ length: 5 }, (_, index) => <LoadingSkeleton key={index} className="h-12" />)}</div>
        ) : storageError ? null : filteredProducts.length === 0 ? (
          <EmptyState icon={Package} title={hasFilters ? "No matching products" : "No products yet"} description={hasFilters ? "Try a different search or product type." : "Create a product to start building your catalogue."} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left">
                <caption className="sr-only">Products and product variants</caption>
                <thead><tr className="border-y border-slate-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  <th scope="col" className="py-3 pl-5 pr-4"><SortButton label="Product" onClick={() => sortBy("name")} icon={sortIcon("name")} /></th>
                  <th scope="col" className="py-3 pr-4">Type</th>
                  <th scope="col" className="py-3 pr-4"><SortButton label="Sales price" onClick={() => sortBy("sales_price")} icon={sortIcon("sales_price")} /></th>
                  <th scope="col" className="py-3 pr-4">Cost price</th>
                  <th scope="col" className="py-3 pr-4">Variants</th>
                  <th scope="col" className="py-3 pr-4">Status</th>
                  <th scope="col" className="py-3 pr-4"><SortButton label="Created" onClick={() => sortBy("created_at")} icon={sortIcon("created_at")} /></th>
                  <th scope="col" className="py-3 pr-5 text-right">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleProducts.map((product) => (
                    <tr className="text-sm text-slate-700" key={product.id}>
                      <td className="py-3.5 pl-5 pr-4"><Link className="font-semibold text-slate-900 hover:text-[#5148e5]" href={`/products/${product.id}`}>{product.name}</Link><p className="mt-1 max-w-[250px] truncate text-xs text-slate-400">{product.notes || "No notes"}</p></td>
                      <td className="py-3.5 pr-4"><span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{productTypeLabels[product.type]}</span></td>
                      <td className="py-3.5 pr-4 font-medium">{formatPrice(product.sales_price)}</td>
                      <td className="py-3.5 pr-4 text-slate-500">{formatPrice(product.cost_price)}</td>
                      <td className="py-3.5 pr-4">{variants.filter((variant) => variant.product_id === product.id).length}</td>
                      <td className="py-3.5 pr-4">{product.is_active === undefined ? "—" : <StatusBadge status={product.is_active ? "Active" : "Inactive"} />}</td>
                      <td className="py-3.5 pr-4 text-xs text-slate-500">{formatDate(product.created_at)}</td>
                      <td className="py-3.5 pr-5 text-right"><ProductActions product={product} canManage={canManage} onDelete={() => setDeleting(product)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} count={filteredProducts.length} pageSize={pageSize} onPage={setPage} />
          </>
        )}
      </section>
      {deleting ? <ConfirmDeleteDialog name={deleting.name} kind="product" onCancel={() => setDeleting(null)} onConfirm={confirmDelete} /> : null}
    </PageContainer>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return <article className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f0efff] text-[#635bff]"><Icon size={18} aria-hidden="true" /></span><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold text-slate-950">{value}</p></div></article>;
}

function SortButton({ label, onClick, icon }: { label: string; onClick: () => void; icon: React.ReactNode }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 hover:text-slate-700">{label}{icon}</button>;
}

function Pagination({ currentPage, totalPages, count, pageSize: size, onPage }: { currentPage: number; totalPages: number; count: number; pageSize: number; onPage: (page: number) => void }) {
  const first = count ? (currentPage - 1) * size + 1 : 0;
  const last = Math.min(currentPage * size, count);
  return <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5"><p>Showing <span className="font-semibold text-slate-700">{first}–{last}</span> of {count} products</p><div className="flex items-center gap-3"><span>Page {currentPage} of {totalPages}</span><div className="flex gap-1"><button type="button" onClick={() => onPage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page" className="grid size-8 place-items-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={15} /></button><button type="button" onClick={() => onPage(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page" className="grid size-8 place-items-center rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size={15} /></button></div></div></div>;
}

function ProductActions({ product, canManage, onDelete }: { product: Product; canManage: boolean; onDelete: () => void }) {
  return <DropdownMenu label={`Actions for ${product.name}`} trigger={<span className="inline-grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Ellipsis size={17} aria-hidden="true" /></span>}>
    <Link href={`/products/${product.id}`} className="block rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">View details</Link>
    {canManage ? <><Link href={`/products/${product.id}/edit`} className="block rounded-md px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit product</Link><button type="button" onClick={onDelete} className="block w-full rounded-md px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50">Delete product</button></> : null}
  </DropdownMenu>;
}

export function ConfirmDeleteDialog({ name, kind, onCancel, onConfirm }: { name: string; kind: "product" | "plan"; onCancel: () => void; onConfirm: () => void }) {
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLButtonElement>("[data-autofocus]")?.focus();
  }, []);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;
    const buttons = Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>("button:not([disabled])"));
    const first = buttons[0];
    const last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <section ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" onKeyDown={handleKeyDown} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4"><span className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><Trash2 size={19} aria-hidden="true" /></span><button type="button" onClick={onCancel} aria-label="Close confirmation" className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X size={17} /></button></div>
      <h2 id="delete-title" className="mt-4 text-lg font-semibold text-slate-900">Delete {kind}?</h2>
      <p id="delete-description" className="mt-2 text-sm leading-6 text-slate-500">Remove <span className="font-semibold text-slate-700">{name}</span> from this browser&apos;s demo data? This does not contact the backend. A live backend must validate financial and subscription references before deletion.</p>
      <div className="mt-6 flex justify-end gap-2"><button type="button" data-autofocus onClick={onCancel} className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button type="button" onClick={onConfirm} className="h-10 rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-700">Delete sample</button></div>
    </section>
  </div>;
}

const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(255, "Use 255 characters or fewer."),
  type: z.enum(["service", "physical", "digital"]),
  sales_price: z.string().trim().regex(/^\d+(?:\.\d{1,2})?$/, "Enter a non-negative amount with up to 2 decimal places."),
  cost_price: z.string().trim().regex(/^\d+(?:\.\d{1,2})?$/, "Enter a non-negative amount with up to 2 decimal places."),
  notes: z.string().trim().max(2000, "Notes must be 2,000 characters or fewer."),
});
type ProductFormValues = z.infer<typeof productSchema>;

export function ProductForm({ mode, product }: { mode: "create" | "edit"; product?: Product }) {
  const router = useRouter();
  const { create, update, notify } = useProducts();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      type: product.type,
      sales_price: product.sales_price,
      cost_price: product.cost_price,
      notes: product.notes,
    } : { name: "", type: "service", sales_price: "", cost_price: "", notes: "" },
    mode: "onBlur",
  });

  function submit(values: ProductFormValues) {
    try {
      const payload: ProductCreatePayload = {
        name: values.name.trim(),
        type: values.type,
        sales_price: Number(values.sales_price).toFixed(2),
        cost_price: Number(values.cost_price).toFixed(2),
        notes: values.notes.trim(),
      };
      const saved = mode === "create"
        ? create(payload)
        : product ? update(product.id, payload) : null;
      if (!saved) {
        form.setError("root.server", { message: "Product details are unavailable. Return to the product list and try again." });
        return;
      }
      notify(mode === "create" ? "Sample product added" : "Sample product updated", `${saved.name} was saved in this browser's demo catalogue.`);
      router.push(`/products/${saved.id}`);
    } catch (error) {
      form.setError("root.server", { message: error instanceof Error ? error.message : "The product could not be saved." });
    }
  }

  return <PageContainer>
    <CatalogDemoNotice />
    <PageHeader eyebrow="Product catalogue" title={mode === "create" ? "Add product" : "Edit product"} description={mode === "create" ? "Add a product or service to the sample catalogue." : `Update ${product?.name ?? "this product"} in the sample catalogue.`} action={<Link href={product ? `/products/${product.id}` : "/products"} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100"><ArrowLeft size={15} aria-hidden="true" />{mode === "create" ? "Back to products" : "Cancel"}</Link>} />
    <form onSubmit={form.handleSubmit(submit)} noValidate className="mx-auto max-w-[900px] space-y-5">
      <section className="rounded-xl border border-slate-200/80 bg-white">
        <SectionHeading icon={Package} title="Product information" description="Prices use decimal strings with two fractional digits in the API contract." />
        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <FormField id="product-name" label="Product name" required error={form.formState.errors.name?.message}><input id="product-name" autoComplete="off" {...form.register("name")} className={inputClass} /></FormField>
          <FormField id="product-type" label="Product type" required error={form.formState.errors.type?.message}><select id="product-type" {...form.register("type")} className={inputClass}><option value="service">Service</option><option value="physical">Physical</option><option value="digital">Digital</option></select></FormField>
          <FormField id="product-sales-price" label="Sales price" required error={form.formState.errors.sales_price?.message}><div className="relative"><CircleDollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input id="product-sales-price" inputMode="decimal" placeholder="1000.00" {...form.register("sales_price")} className={`${inputClass} pl-9`} /></div></FormField>
          <FormField id="product-cost-price" label="Cost price" required error={form.formState.errors.cost_price?.message}><div className="relative"><CircleDollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input id="product-cost-price" inputMode="decimal" placeholder="400.00" {...form.register("cost_price")} className={`${inputClass} pl-9`} /></div></FormField>
          <FormField id="product-notes" label="Notes" error={form.formState.errors.notes?.message} className="sm:col-span-2"><textarea id="product-notes" rows={4} {...form.register("notes")} className={`${inputClass} h-auto py-3`} /></FormField>
        </div>
      </section>
      {form.formState.errors.root?.server?.message ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{form.formState.errors.root.server.message}</p> : null}
      <div className="flex justify-end gap-2"><Link href={product ? `/products/${product.id}` : "/products"} className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link><button type="submit" disabled={form.formState.isSubmitting} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white hover:bg-[#5148e5] disabled:opacity-60"><Check size={15} aria-hidden="true" />{mode === "create" ? "Add sample product" : "Save changes"}</button></div>
    </form>
  </PageContainer>;
}

export function ProductDetails({ id }: { id: number }) {
  const { products, variants, isReady, storageError, refresh, addVariant, notify } = useProducts();
  const { user } = useAuth();
  const canManage = Boolean(user && canManageCatalog(user.role));
  const product = products.find((record) => record.id === id);
  const productVariants = variants.filter((variant) => variant.product_id === id);
  const [showVariantForm, setShowVariantForm] = useState(false);

  if (!isReady) return <PageContainer><CatalogDemoNotice /><LoadingSkeleton className="h-72" /></PageContainer>;
  if (storageError) return <PageContainer><CatalogDemoNotice /><StorageError message={storageError} onRetry={refresh} /></PageContainer>;
  if (!product) return <PageContainer><CatalogDemoNotice /><EmptyState icon={Package} title="Product not found" description="This product may have been removed from the local demo catalogue." /><Link href="/products" className="text-sm font-semibold text-[#635bff]">Return to products</Link></PageContainer>;

  function submitVariant(data: VariantCreatePayload) {
    try {
      addVariant(id, data);
      notify("Sample variant added", `${data.name} was added to ${product?.name ?? "the product"} in this browser.`);
      setShowVariantForm(false);
    } catch (error) {
      notify("Variant could not be added", error instanceof Error ? error.message : "Please try again.", "error");
    }
  }

  return <PageContainer>
    <CatalogDemoNotice />
    <PageHeader eyebrow="Product catalogue" title={product.name} description="Product details and the variants currently saved in this browser." action={<div className="flex flex-wrap gap-2"><Link href="/products" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"><ArrowLeft size={15} aria-hidden="true" />Products</Link>{canManage ? <Link href={`/products/${id}/edit`} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#635bff] px-3 text-xs font-semibold text-white hover:bg-[#5148e5]"><Pencil size={14} aria-hidden="true" />Edit product</Link> : null}</div>} />
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-xl border border-slate-200/80 bg-white">
        <SectionHeading icon={Package} title="Product information" description="Sample catalogue record" />
        <dl className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <DetailItem label="Name" value={product.name} />
          <DetailItem label="Type" value={productTypeLabels[product.type]} />
          <DetailItem label="Sales price" value={formatPrice(product.sales_price)} />
          <DetailItem label="Cost price" value={formatPrice(product.cost_price)} />
          <DetailItem label="Status" value={product.is_active === undefined ? "Not provided" : product.is_active ? "Active" : "Inactive"} />
          <DetailItem label="Created" value={formatDate(product.created_at)} />
          <div className="sm:col-span-2"><dt className="text-xs font-medium text-slate-500">Notes</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-800">{product.notes || "No notes provided."}</dd></div>
        </dl>
      </section>
      <section className="rounded-xl border border-slate-200/80 bg-white">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div><h2 className="text-sm font-semibold text-slate-900">Variants</h2><p className="mt-1 text-xs text-slate-500">{productVariants.length} variant{productVariants.length === 1 ? "" : "s"}</p></div>
          {canManage ? <button type="button" onClick={() => setShowVariantForm((value) => !value)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">{showVariantForm ? <X size={14} /> : <Plus size={14} />}{showVariantForm ? "Cancel" : "Add variant"}</button> : null}
        </div>
        {showVariantForm && canManage ? <VariantForm onCancel={() => setShowVariantForm(false)} onSubmit={submitVariant} /> : null}
        {productVariants.length ? <ul className="divide-y divide-slate-100">{productVariants.map((variant) => <VariantRow key={variant.id} variant={variant} />)}</ul> : <div className="px-5 py-10 text-center"><span className="mx-auto grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-500"><Boxes size={18} aria-hidden="true" /></span><p className="mt-3 text-sm font-medium text-slate-700">No variants yet</p><p className="mt-1 text-xs text-slate-500">{canManage ? "Add a variant to describe a product option." : "No sample options are configured."}</p></div>}
      </section>
    </div>
  </PageContainer>;
}

export function ProductEditScreen({ id }: { id: number }) {
  const { products, isReady, storageError, refresh } = useProducts();
  if (!isReady) return <PageContainer><CatalogDemoNotice /><LoadingSkeleton className="h-72" /></PageContainer>;
  if (storageError) return <PageContainer><CatalogDemoNotice /><StorageError message={storageError} onRetry={refresh} /></PageContainer>;
  const product = products.find((record) => record.id === id);
  if (!product) return <PageContainer><CatalogDemoNotice /><EmptyState icon={Package} title="Product not found" description="This product may have been removed from the local demo catalogue." /><Link href="/products" className="text-sm font-semibold text-[#635bff]">Return to products</Link></PageContainer>;
  return <ProductForm mode="edit" product={product} />;
}

const variantSchema = z.object({
  name: z.string().trim().min(1, "Enter a variant name.").max(100, "Use 100 characters or fewer."),
  additional_price: z.string().trim().regex(/^\d+(?:\.\d{1,2})?$/, "Enter a non-negative amount with up to 2 decimal places."),
});
type VariantFormValues = z.infer<typeof variantSchema>;

function VariantForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (data: VariantCreatePayload) => void }) {
  const form = useForm<VariantFormValues>({ resolver: zodResolver(variantSchema), defaultValues: { name: "", additional_price: "0.00" }, mode: "onBlur" });
  return <form onSubmit={form.handleSubmit((values) => onSubmit({ name: values.name.trim(), additional_price: Number(values.additional_price).toFixed(2) }))} noValidate className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-[1fr_180px_auto] sm:items-end">
    <FormField id="variant-name" label="Variant name" required error={form.formState.errors.name?.message}><input id="variant-name" {...form.register("name")} className={inputClass} /></FormField>
    <FormField id="variant-additional-price" label="Additional price" required error={form.formState.errors.additional_price?.message}><input id="variant-additional-price" inputMode="decimal" {...form.register("additional_price")} className={inputClass} /></FormField>
    <div className="flex gap-2 sm:pb-0.5"><button type="button" onClick={onCancel} className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-white">Cancel</button><button type="submit" className="h-10 rounded-lg bg-[#635bff] px-3 text-xs font-semibold text-white hover:bg-[#5148e5]">Add</button></div>
  </form>;
}

function VariantRow({ variant }: { variant: ProductVariant }) {
  return <li className="flex items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{variant.name}</p><p className="mt-1 text-xs text-slate-400">Added {formatDate(variant.created_at)}</p></div><div className="text-right"><p className="text-sm font-semibold text-slate-900">+{formatPrice(variant.additional_price)}</p>{variant.is_active !== undefined ? <p className="mt-1 text-[10px] text-slate-400">{variant.is_active ? "Active" : "Inactive"}</p> : null}</div></li>;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd></div>;
}

const inputClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#a5a0ff] focus:ring-2 focus:ring-[#635bff]/10";

function FormField({ id, label, required, error, className = "", children }: { id: string; label: string; required?: boolean; error?: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">{label}{required ? <span className="ml-1 text-rose-500" aria-hidden="true">*</span> : null}</label>{children}{error ? <p className="mt-1.5 text-xs text-rose-600" id={`${id}-error`}>{error}</p> : null}</div>;
}

function SectionHeading({ icon: Icon, title, description }: { icon: typeof Package; title: string; description: string }) {
  return <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f0efff] text-[#635bff]"><Icon size={17} aria-hidden="true" /></span><div><h2 className="text-sm font-semibold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-500">{description}</p></div></div>;
}
