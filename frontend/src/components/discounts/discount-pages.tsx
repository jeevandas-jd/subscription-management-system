"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowLeft,
  ArrowUp,
  BadgePercent,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { z } from "zod";
import {
  EmptyState,
  LoadingSkeleton,
  PageContainer,
  PageHeader,
} from "@/components/shared/ui";
import { discountStorageKey } from "@/data/mock-discounts";
import { getProducts } from "@/lib/products/product-service";
import {
  createDiscount,
  deleteDiscount,
  getDiscountById,
  getDiscounts,
  updateDiscount,
} from "@/lib/discounts/discount-service";
import { useAuth } from "@/lib/auth/auth-context";
import { canManageCatalog } from "@/lib/auth/permissions";
import type {
  Discount,
  DiscountCreatePayload,
  DiscountScope,
  DiscountType,
} from "@/types/discount";
import type { Product } from "@/types/catalog";

const pageSize = 8;
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

type DiscountStatus = "active" | "inactive" | "scheduled" | "expired";
type StatusFilter = "all" | DiscountStatus;
type SortKey = "name" | "code" | "value" | "starts_at" | "created_at";
type SortDirection = "asc" | "desc";

function getDiscountStatus(discount: Discount, now: number): DiscountStatus {
  if (!discount.is_active) return "inactive";
  if (new Date(discount.starts_at).getTime() > now) return "scheduled";
  if (discount.ends_at && new Date(discount.ends_at).getTime() < now) return "expired";
  return "active";
}

function formatMoney(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? currencyFormatter.format(amount) : value;
}

function formatDate(value: string | null) {
  if (!value) return "No end date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
}

function displayValue(discount: Pick<Discount, "discount_type" | "value">) {
  return discount.discount_type === "percentage"
    ? `${discount.value}%`
    : formatMoney(discount.value);
}

function compareDecimalStrings(left: string, right: string) {
  const [leftWhole = "0", leftFraction = ""] = left.split(".");
  const [rightWhole = "0", rightFraction = ""] = right.split(".");
  const normalizedLeft = leftWhole.replace(/^0+(?=\d)/, "");
  const normalizedRight = rightWhole.replace(/^0+(?=\d)/, "");
  if (normalizedLeft.length !== normalizedRight.length) {
    return normalizedLeft.length < normalizedRight.length ? -1 : 1;
  }
  const wholeComparison = normalizedLeft.localeCompare(normalizedRight);
  if (wholeComparison !== 0) return wholeComparison < 0 ? -1 : 1;
  const fractionComparison = leftFraction.padEnd(2, "0").localeCompare(rightFraction.padEnd(2, "0"));
  return fractionComparison < 0 ? -1 : fractionComparison > 0 ? 1 : 0;
}

function compareMoney(left: string, right: string) {
  return compareDecimalStrings(left, right);
}

function StatusPill({ status }: { status: DiscountStatus }) {
  const styles: Record<DiscountStatus, string> = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    inactive: "bg-slate-100 text-slate-600 ring-slate-500/15",
    scheduled: "bg-blue-50 text-blue-700 ring-blue-600/15",
    expired: "bg-amber-50 text-amber-700 ring-amber-600/15",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${styles[status]}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

function DemoNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950" role="note">
      <span className="mt-0.5 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
        Demo data
      </span>
      <p className="text-xs leading-5 text-amber-800">
        Discount records are stored in this browser only. Codes are a local demo field not present in the current API contract; discounts are not applied to quotations or invoices.
      </p>
    </div>
  );
}

function InlineAlert({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700" role="alert">
      {children}
    </div>
  );
}

function useDiscountRecords() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [asOf, setAsOf] = useState(0);

  const refresh = useCallback(() => {
    try {
      setDiscounts(getDiscounts());
      setProducts(getProducts());
      setStorageError(null);
      setAsOf(Date.now());
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? error.message
          : "Discount data could not be loaded.",
      );
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === discountStorageKey) refresh();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  return { discounts, products, isReady, storageError, refresh, setDiscounts, asOf };
}

function AccessMessage() {
  return (
    <PageContainer>
      <InlineAlert>Only administrators can create or edit discounts.</InlineAlert>
      <Link href="/discounts" className="text-sm font-semibold text-[#635bff] hover:underline">
        Return to discounts
      </Link>
    </PageContainer>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <span className="grid size-9 place-items-center rounded-xl bg-[#f0efff] text-[#635bff]">
          <Icon size={17} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
    </article>
  );
}

export function DiscountListing() {
  const { discounts, isReady, storageError, refresh, setDiscounts, asOf } =
    useDiscountRecords();
  const { user } = useAuth();
  const canManage = Boolean(user && canManageCatalog(user.role));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Discount | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const now = asOf;

  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return discounts
      .filter((discount) => status === "all" || getDiscountStatus(discount, now) === status)
      .filter(
        (discount) =>
          !search ||
          [discount.name, discount.code].some((value) =>
            value.toLocaleLowerCase().includes(search),
          ),
      )
      .toSorted((left, right) => {
        let comparison = 0;
        if (sortKey === "value") comparison = compareMoney(left.value, right.value);
        else if (sortKey === "starts_at") comparison = left.starts_at.localeCompare(right.starts_at);
        else if (sortKey === "created_at") comparison = left.created_at.localeCompare(right.created_at);
        else comparison = left[sortKey].localeCompare(right[sortKey]);
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [discounts, now, query, sortDirection, sortKey, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeCount = discounts.filter((discount) => getDiscountStatus(discount, now) === "active").length;
  const scheduledCount = discounts.filter((discount) => getDiscountStatus(discount, now) === "scheduled").length;
  const expiredCount = discounts.filter((discount) => getDiscountStatus(discount, now) === "expired").length;

  function changeSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(nextKey);
      setSortDirection(nextKey === "name" || nextKey === "code" ? "asc" : "desc");
    }
    setPage(1);
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return <ArrowDownUp size={13} aria-hidden="true" />;
    return sortDirection === "asc" ? (
      <ArrowUp size={13} aria-hidden="true" />
    ) : (
      <ArrowDown size={13} aria-hidden="true" />
    );
  }

  function toggleStatus(discount: Discount) {
    try {
      updateDiscount(discount.id, { is_active: !discount.is_active });
      setDiscounts(getDiscounts());
      setMessage({ text: `${discount.code} is now ${discount.is_active ? "inactive" : "active"}.`, error: false });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "The status could not be updated.",
        error: true,
      });
    }
  }

  function confirmDelete() {
    if (!deleting) return;
    try {
      deleteDiscount(deleting.id);
      setDiscounts(getDiscounts());
      setMessage({ text: `${deleting.code} was removed from this browser's demo data.`, error: false });
      setDeleting(null);
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : "The discount could not be deleted.",
        error: true,
      });
    }
  }

  return (
    <PageContainer>
      <DemoNotice />
      {storageError ? (
        <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p className="text-sm text-rose-800">{storageError}</p>
          <button type="button" onClick={refresh} className="h-9 shrink-0 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100">
            Try again
          </button>
        </div>
      ) : null}
      <PageHeader
        eyebrow="Billing configuration"
        title="Discounts"
        description="Manage discount definitions and their configured date, value, and product scope."
        action={canManage ? (
          <Link href="/discounts/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white shadow-sm shadow-[#635bff]/20 transition hover:bg-[#5148e5]">
            <Plus size={16} aria-hidden="true" />
            Add discount
          </Link>
        ) : undefined}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Discount summary">
        <SummaryCard icon={Tag} label="Total discounts" value={isReady ? discounts.length.toLocaleString("en-IN") : "—"} />
        <SummaryCard icon={BadgePercent} label="Active now" value={isReady ? activeCount.toLocaleString("en-IN") : "—"} />
        <SummaryCard icon={CalendarClock} label="Scheduled" value={isReady ? scheduledCount.toLocaleString("en-IN") : "—"} />
        <SummaryCard icon={Clock3} label="Expired" value={isReady ? expiredCount.toLocaleString("en-IN") : "—"} />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">Discount definitions</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{isReady ? filtered.length : "—"}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Values are configuration data only; no discount is calculated or applied.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-10 min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 focus-within:border-[#a5a0ff] focus-within:ring-2 focus-within:ring-[#635bff]/10 sm:w-[250px]">
              <Search size={16} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search name or code"
                aria-label="Search discounts by name or code"
                className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
            <label className="relative">
              <span className="sr-only">Filter by status</span>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as StatusFilter);
                  setPage(1);
                }}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-xs font-medium text-slate-600 outline-none focus:border-[#a5a0ff] focus:ring-2 focus:ring-[#635bff]/10 sm:w-[150px]"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">⌄</span>
            </label>
          </div>
        </div>

        {message ? (
          <div className={`mx-4 mt-4 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm sm:mx-5 ${message.error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`} role={message.error ? "alert" : "status"}>
            <span>{message.text}</span>
            <button type="button" onClick={() => setMessage(null)} aria-label="Dismiss message">
              <X size={15} />
            </button>
          </div>
        ) : null}

        {!isReady ? (
          <div className="space-y-3 p-5"><LoadingSkeleton className="h-10" /><LoadingSkeleton className="h-10" /><LoadingSkeleton className="h-10" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={BadgePercent}
              title={discounts.length ? "No matching discounts" : "No discounts yet"}
              description={discounts.length ? "Try a different search or status filter." : "Create a discount definition to start building your local demo catalogue."}
            />
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto px-5 md:block">
              <table className="w-full min-w-[880px] border-collapse text-left">
                <caption className="sr-only">Discount definitions</caption>
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {([
                      ["name", "Discount"],
                      ["code", "Code"],
                      ["value", "Value"],
                      ["starts_at", "Dates"],
                      ["created_at", "Created"],
                    ] as [SortKey, string][]).map(([key, label]) => (
                      <th key={key} scope="col" className="py-3 pr-4">
                        <button type="button" onClick={() => changeSort(key)} className="inline-flex items-center gap-1.5 hover:text-slate-700">
                          {label}{sortIcon(key)}
                        </button>
                      </th>
                    ))}
                    <th scope="col" className="py-3 pr-4">Status</th>
                    <th scope="col" className="py-3 pr-4">Scope</th>
                    <th scope="col" className="py-3 pr-4">Usage</th>
                    <th scope="col" className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((discount) => (
                    <tr key={discount.id} className="text-sm text-slate-700">
                      <td className="py-3.5 pr-4">
                        <Link href={`/discounts/${discount.id}`} className="font-semibold text-slate-900 hover:text-[#635bff]">{discount.name}</Link>
                        <p className="mt-1 text-xs text-slate-400">{discount.discount_type === "percentage" ? "Percentage" : "Fixed amount"} · min. quantity {discount.minimum_quantity}</p>
                      </td>
                      <td className="py-3.5 pr-4"><code className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{discount.code}</code></td>
                      <td className="py-3.5 pr-4 font-medium">{displayValue(discount)}<p className="mt-1 text-xs text-slate-400">Min. purchase {formatMoney(discount.minimum_purchase)}</p></td>
                      <td className="py-3.5 pr-4 text-xs text-slate-500">{formatDate(discount.starts_at)} – {formatDate(discount.ends_at)}</td>
                      <td className="py-3.5 pr-4 text-xs text-slate-500">{formatDate(discount.created_at)}</td>
                      <td className="py-3.5 pr-4"><StatusPill status={getDiscountStatus(discount, now)} /></td>
                      <td className="py-3.5 pr-4 text-xs capitalize text-slate-500">{discount.scope}</td>
                      <td className="py-3.5 pr-4 text-xs text-slate-500">{discount.usage_count}{discount.usage_limit === null ? " / ∞" : ` / ${discount.usage_limit}`}</td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={discount.is_active}
                            aria-label={`${discount.is_active ? "Deactivate" : "Activate"} ${discount.code}`}
                            title={canManage ? (discount.is_active ? "Deactivate" : "Activate") : "Admin only"}
                            disabled={!canManage}
                            onClick={() => toggleStatus(discount)}
                            className={`relative h-6 w-11 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${discount.is_active ? "bg-[#635bff]" : "bg-slate-300"}`}
                          >
                            <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all ${discount.is_active ? "left-[22px]" : "left-0.5"}`} />
                          </button>
                          <Link href={`/discounts/${discount.id}`} aria-label={`View ${discount.code}`} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Search size={15} /></Link>
                          {canManage ? <button type="button" onClick={() => setDeleting(discount)} aria-label={`Delete ${discount.code}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button> : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-4 md:hidden">
              {visible.map((discount) => (
                <article key={discount.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/discounts/${discount.id}`} className="font-semibold text-slate-900 hover:text-[#635bff]">{discount.name}</Link>
                      <code className="mt-1 block text-xs font-semibold text-slate-500">{discount.code}</code>
                    </div>
                    <StatusPill status={getDiscountStatus(discount, now)} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-slate-400">Value</p><p className="mt-1 font-semibold text-slate-800">{displayValue(discount)}</p></div>
                    <div><p className="text-slate-400">Scope</p><p className="mt-1 font-semibold capitalize text-slate-800">{discount.scope}</p></div>
                    <div><p className="text-slate-400">Starts</p><p className="mt-1 font-medium text-slate-700">{formatDate(discount.starts_at)}</p></div>
                    <div><p className="text-slate-400">Usage count</p><p className="mt-1 font-medium text-slate-700">{discount.usage_count}{discount.usage_limit === null ? " / ∞" : ` / ${discount.usage_limit}`}</p></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <button type="button" role="switch" aria-checked={discount.is_active} disabled={!canManage} onClick={() => toggleStatus(discount)} className="text-xs font-semibold text-[#635bff] disabled:text-slate-400">
                      {discount.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <div className="flex items-center gap-2">
                      <Link href={`/discounts/${discount.id}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`View ${discount.code}`}><Search size={15} /></Link>
                      {canManage ? <button type="button" onClick={() => setDeleting(discount)} aria-label={`Delete ${discount.code}`} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-slate-500">Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={14} />Previous</button>
                <span className="min-w-16 text-center text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
                <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight size={14} /></button>
              </div>
            </div>
          </>
        )}
      </section>

      {deleting ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDeleting(null);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="delete-discount-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Trash2 size={19} aria-hidden="true" /></div>
            <h2 id="delete-discount-title" className="mt-4 text-lg font-semibold text-slate-950">Delete {deleting.code}?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">This removes the discount definition from this browser’s demo data. It does not update a backend or affect any quotation or invoice.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleting(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={confirmDelete} className="h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700">Delete discount</button>
            </div>
          </section>
        </div>
      ) : null}
    </PageContainer>
  );
}

export function DiscountDetails({ id }: { id: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const canManage = Boolean(user && canManageCatalog(user.role));
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asOf, setAsOf] = useState(0);

  const refresh = useCallback(() => {
    try {
      setDiscount(getDiscountById(id) ?? null);
      setProducts(getProducts());
      setError(null);
      setAsOf(Date.now());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Discount data could not be loaded.");
    } finally {
      setIsReady(true);
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === discountStorageKey) refresh();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  function toggleStatus() {
    if (!discount) return;
    try {
      setDiscount(updateDiscount(discount.id, { is_active: !discount.is_active }));
      setError(null);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "The status could not be updated.");
    }
  }

  function removeDiscount() {
    if (!discount || !window.confirm(`Delete ${discount.code} from this browser's demo data?`)) return;
    try {
      deleteDiscount(discount.id);
      router.push("/discounts");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "The discount could not be deleted.");
    }
  }

  if (!isReady) {
    return <PageContainer><LoadingSkeleton className="h-36" /><LoadingSkeleton className="h-72" /></PageContainer>;
  }
  if (error && !discount) return <PageContainer><InlineAlert>{error}</InlineAlert><Link href="/discounts" className="text-sm font-semibold text-[#635bff]">Back to discounts</Link></PageContainer>;
  if (!discount) return <PageContainer><EmptyState icon={BadgePercent} title="Discount not found" description="It may have been removed from this browser’s demo data." /><Link href="/discounts" className="text-sm font-semibold text-[#635bff]">Back to discounts</Link></PageContainer>;

  return (
    <PageContainer>
      <DemoNotice />
      <Link href="/discounts" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />All discounts</Link>
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      <PageHeader
        eyebrow={`Discount · ${discount.code}`}
        title={discount.name}
        description="Review the configured discount fields. Eligibility and financial application are not evaluated in this demo."
        action={<div className="flex flex-wrap gap-2">
          {canManage ? <button type="button" role="switch" aria-checked={discount.is_active} onClick={toggleStatus} className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-xs font-semibold ${discount.is_active ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><span className={`size-2 rounded-full ${discount.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />{discount.is_active ? "Active" : "Inactive"}</button> : <StatusPill status={getDiscountStatus(discount, asOf)} />}
          {canManage ? <Link href={`/discounts/${discount.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={14} />Edit</Link> : null}
          {canManage ? <button type="button" onClick={removeDiscount} className="inline-flex h-10 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50"><Trash2 size={14} />Delete</button> : null}
        </div>}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Configuration</h2>
          <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <DetailField label="Code"><code className="rounded bg-slate-100 px-2 py-1 font-semibold">{discount.code}</code><p className="mt-1 text-xs text-slate-400">Local-only demo field</p></DetailField>
            <DetailField label="Status"><StatusPill status={getDiscountStatus(discount, asOf)} /></DetailField>
            <DetailField label="Discount type">{discount.discount_type === "percentage" ? "Percentage" : "Fixed amount"}</DetailField>
            <DetailField label="Value">{displayValue(discount)}</DetailField>
            <DetailField label="Minimum purchase">{formatMoney(discount.minimum_purchase)}</DetailField>
            <DetailField label="Minimum quantity">{discount.minimum_quantity}</DetailField>
            <DetailField label="Scope" className="capitalize">{discount.scope}</DetailField>
            <DetailField label="Usage count">{discount.usage_count}{discount.usage_limit === null ? " (no limit configured)" : ` of ${discount.usage_limit}`}</DetailField>
            <DetailField label="Starts at">{formatDateTime(discount.starts_at)}</DetailField>
            <DetailField label="Ends at">{discount.ends_at ? formatDateTime(discount.ends_at) : "No end date"}</DetailField>
          </dl>
        </section>
        <aside className="h-fit rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Configured products</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">Product links are configuration only; this demo does not evaluate eligibility.</p>
          {discount.scope !== "product" ? <p className="mt-4 text-sm text-slate-500">No product-specific configuration.</p> : discount.product_ids.length ? (
            <ul className="mt-4 space-y-3">
              {discount.product_ids.map((productId) => {
                const product = products.find((item) => item.id === productId);
                return <li key={productId} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-slate-500"><Tag size={15} /></span><span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-800">{product?.name ?? `Product #${productId}`}</span><span className="text-xs text-slate-400">ID {productId}</span></span></li>;
              })}
            </ul>
          ) : <p className="mt-4 text-sm text-slate-500">No product IDs configured.</p>}
          <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">Created {formatDateTime(discount.created_at)}{discount.updated_at ? ` · Updated ${formatDateTime(discount.updated_at)}` : ""}</p>
        </aside>
      </div>
    </PageContainer>
  );
}

function DetailField({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return <div><dt className="text-xs font-medium text-slate-400">{label}</dt><dd className={`mt-1.5 text-sm font-medium text-slate-800 ${className}`}>{children}</dd></div>;
}

const amountPattern = /^\d{1,10}(?:\.\d{1,2})?$/;
const formSchema = z.object({
  name: z.string().trim().min(1, "Enter a discount name.").max(255, "Use 255 characters or fewer."),
  code: z.string().trim().min(2, "Enter a code with at least 2 characters.").max(40, "Use 40 characters or fewer.").regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, "Use letters, numbers, hyphens, or underscores."),
  discount_type: z.enum(["fixed", "percentage"]),
  value: z.string().regex(amountPattern, "Enter a value with up to 2 decimal places."),
  minimum_purchase: z.string().regex(amountPattern, "Enter a minimum purchase with up to 2 decimal places."),
  minimum_quantity: z.string().regex(/^[1-9]\d*$/, "Minimum quantity must be a positive whole number."),
  starts_at: z.string().min(1, "Choose a start date and time."),
  ends_at: z.string(),
  usage_limit: z.string(),
  scope: z.enum(["product", "subscription"]),
  product_ids: z.array(z.number().int().positive()),
  is_active: z.boolean(),
}).superRefine((values, context) => {
  const decimalCents = (value: string) => {
    if (!amountPattern.test(value)) return null;
    return value;
  };
  const value = decimalCents(values.value);
  if (value !== null && compareDecimalStrings(value, "0.00") <= 0) {
    context.addIssue({ code: "custom", path: ["value"], message: "Value must be greater than zero." });
  }
  const minimumPurchase = decimalCents(values.minimum_purchase);
  if (minimumPurchase !== null && compareDecimalStrings(minimumPurchase, "0.00") < 0) {
    context.addIssue({ code: "custom", path: ["minimum_purchase"], message: "Minimum purchase cannot be negative." });
  }
  if (values.discount_type === "percentage" && value !== null && compareDecimalStrings(value, "100.00") > 0) {
    context.addIssue({ code: "custom", path: ["value"], message: "Percentage value cannot exceed 100.00." });
  }
  const start = Date.parse(values.starts_at);
  if (values.starts_at && Number.isNaN(start)) {
    context.addIssue({ code: "custom", path: ["starts_at"], message: "Enter a valid start date and time." });
  }
  if (values.ends_at) {
    const end = Date.parse(values.ends_at);
    if (Number.isNaN(end)) {
      context.addIssue({ code: "custom", path: ["ends_at"], message: "Enter a valid end date and time." });
    } else if (!Number.isNaN(start) && end <= start) {
      context.addIssue({ code: "custom", path: ["ends_at"], message: "End date must be after the start date." });
    }
  }
  if (values.usage_limit && !/^[1-9]\d*$/.test(values.usage_limit)) {
    context.addIssue({ code: "custom", path: ["usage_limit"], message: "Usage limit must be a positive whole number or left blank." });
  }
  if (values.usage_limit && !Number.isSafeInteger(Number(values.usage_limit))) {
    context.addIssue({ code: "custom", path: ["usage_limit"], message: "Usage limit is too large." });
  }
});

type FormValues = z.input<typeof formSchema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;
type EditMode = "create" | "edit";

function emptyFormValues(): FormValues {
  return {
    name: "",
    code: "",
    discount_type: "percentage",
    value: "10.00",
    minimum_purchase: "0.00",
    minimum_quantity: "1",
    starts_at: "",
    ends_at: "",
    usage_limit: "",
    scope: "subscription",
    product_ids: [],
    is_active: true,
  };
}

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function normalizedAmount(value: string) {
  const [whole = "0", fraction = ""] = value.split(".");
  return `${whole}.${fraction.padEnd(2, "0")}`;
}

function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block space-y-1.5">
        <span className="block text-xs font-semibold text-slate-700">{label}</span>
        {children}
      </label>
      {hint ? <p className="text-xs leading-5 text-slate-400">{hint}</p> : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

const inputClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#a5a0ff] focus:ring-2 focus:ring-[#635bff]/10";

export function DiscountForm({ mode, id }: { mode: EditMode; id?: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const canManage = Boolean(user && canManageCatalog(user.role));
  const { products, isReady, storageError } = useDiscountRecords();
  const [values, setValues] = useState<FormValues>(emptyFormValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(mode === "edit");
  const [recordMissing, setRecordMissing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    void Promise.resolve().then(() => {
      try {
        const discount = getDiscountById(id);
        if (!discount) {
          setRecordMissing(true);
          return;
        }
        setValues({
          name: discount.name,
          code: discount.code,
          discount_type: discount.discount_type,
          value: discount.value,
          minimum_purchase: discount.minimum_purchase,
          minimum_quantity: String(discount.minimum_quantity),
          starts_at: toLocalDateTime(discount.starts_at),
          ends_at: toLocalDateTime(discount.ends_at),
          usage_limit: discount.usage_limit === null ? "" : String(discount.usage_limit),
          scope: discount.scope,
          product_ids: [...discount.product_ids],
          is_active: discount.is_active,
        });
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "Discount data could not be loaded.");
      } finally {
        setIsLoadingRecord(false);
      }
    });
  }, [id, mode]);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFormError(null);
  }

  function toggleProduct(productId: number) {
    setValues((current) => ({
      ...current,
      product_ids: current.product_ids.includes(productId)
        ? current.product_ids.filter((idValue) => idValue !== productId)
        : [...current.product_ids, productId],
    }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues | undefined;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setFormError(null);
      return;
    }

    const clean = parsed.data;
    const payload: DiscountCreatePayload = {
      name: clean.name,
      code: clean.code.trim().toLocaleUpperCase(),
      discount_type: clean.discount_type,
      value: normalizedAmount(clean.value),
      minimum_purchase: normalizedAmount(clean.minimum_purchase),
      minimum_quantity: Number(clean.minimum_quantity),
      starts_at: new Date(clean.starts_at).toISOString(),
      ends_at: clean.ends_at ? new Date(clean.ends_at).toISOString() : null,
      usage_limit: clean.usage_limit ? Number(clean.usage_limit) : null,
      scope: clean.scope,
      product_ids: clean.scope === "product" ? clean.product_ids : [],
      is_active: clean.is_active,
    };

    setIsSaving(true);
    try {
      if (mode === "create") {
        const created = createDiscount(payload);
        router.push(`/discounts/${created.id}`);
      } else if (id) {
        updateDiscount(id, payload);
        router.push(`/discounts/${id}`);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Discount could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!canManage) return <AccessMessage />;
  if (!isReady || isLoadingRecord) return <PageContainer><LoadingSkeleton className="h-20" /><LoadingSkeleton className="h-[600px]" /></PageContainer>;
  if (recordMissing) return <PageContainer><EmptyState icon={BadgePercent} title="Discount not found" description="This discount may have been removed from the local demo data." /><Link href="/discounts" className="text-sm font-semibold text-[#635bff]">Back to discounts</Link></PageContainer>;

  const selectedProductCount = values.product_ids.length;

  return (
    <PageContainer>
      <DemoNotice />
      <Link href={mode === "edit" && id ? `/discounts/${id}` : "/discounts"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />{mode === "edit" ? "Back to discount" : "All discounts"}</Link>
      {storageError ? <InlineAlert>{storageError}</InlineAlert> : null}
      <PageHeader
        eyebrow={mode === "create" ? "New configuration" : "Edit configuration"}
        title={mode === "create" ? "Create discount" : "Edit discount"}
        description="Configure a discount definition for the local demo catalogue; no application or eligibility behavior is included."
      />
      <form onSubmit={onSubmit} noValidate className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900">Basic information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField label="Discount name" error={errors.name}>
                <input className={inputClass} value={values.name} onChange={(event) => setField("name", event.target.value)} placeholder="e.g. Welcome offer" autoComplete="off" />
              </FormField>
              <FormField label="Discount code" error={errors.code} hint="Unique in this browser’s demo data; the current API contract does not define a code field.">
                <input className={`${inputClass} font-mono uppercase`} value={values.code} onChange={(event) => setField("code", event.target.value)} placeholder="e.g. WELCOME10" autoComplete="off" />
              </FormField>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Discount type" error={errors.discount_type}>
                <select className={inputClass} value={values.discount_type} onChange={(event) => setField("discount_type", event.target.value as DiscountType)}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </FormField>
              <FormField label={values.discount_type === "percentage" ? "Percentage value (%)" : "Fixed value (INR)"} error={errors.value} hint="Enter a decimal value with up to 2 places; it is stored as a decimal string.">
                <input className={inputClass} inputMode="decimal" value={values.value} onChange={(event) => setField("value", event.target.value)} placeholder="10.00" />
              </FormField>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900">Conditions and scope</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField label="Minimum purchase (INR)" error={errors.minimum_purchase} hint="Stored configuration only; no purchase validation is performed.">
                <input className={inputClass} inputMode="decimal" value={values.minimum_purchase} onChange={(event) => setField("minimum_purchase", event.target.value)} placeholder="0.00" />
              </FormField>
              <FormField label="Minimum quantity" error={errors.minimum_quantity}>
                <input className={inputClass} type="number" min="1" step="1" value={values.minimum_quantity} onChange={(event) => setField("minimum_quantity", event.target.value)} />
              </FormField>
              <FormField label="Scope" error={errors.scope}>
                <select className={inputClass} value={values.scope} onChange={(event) => {
                  const scope = event.target.value as DiscountScope;
                  setField("scope", scope);
                  if (scope === "subscription") setField("product_ids", []);
                }}>
                  <option value="product">Product</option>
                  <option value="subscription">Subscription</option>
                </select>
              </FormField>
              <FormField label="Usage limit" error={errors.usage_limit} hint="Leave blank for no configured limit.">
                <input className={inputClass} type="number" min="1" step="1" value={values.usage_limit} onChange={(event) => setField("usage_limit", event.target.value)} placeholder="No limit" />
              </FormField>
            </div>
            {values.scope === "product" ? (
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-700">Linked product IDs</p>
                  <span className="text-xs text-slate-400">{selectedProductCount} selected</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-400">This stores product associations only. Discount eligibility is not evaluated.</p>
                {products.length ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {products.map((product) => (
                      <label key={product.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                        <input type="checkbox" checked={values.product_ids.includes(product.id)} onChange={() => toggleProduct(product.id)} className="mt-0.5 size-4 rounded border-slate-300 accent-[#635bff]" />
                        <span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-800">{product.name}</span><span className="text-xs text-slate-400">ID {product.id}</span></span>
                      </label>
                    ))}
                  </div>
                ) : <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">No products are in the local catalogue. You can still save the product scope with no linked IDs.</p>}
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900">Schedule</h2>
            <p className="mt-1 text-xs text-slate-400">Dates are saved as ISO 8601 timestamps.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField label="Starts at" error={errors.starts_at}>
                <input className={inputClass} type="datetime-local" value={values.starts_at} onChange={(event) => setField("starts_at", event.target.value)} />
              </FormField>
              <FormField label="Ends at (optional)" error={errors.ends_at}>
                <input className={inputClass} type="datetime-local" value={values.ends_at} onChange={(event) => setField("ends_at", event.target.value)} />
              </FormField>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-slate-200/80 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Availability</h2>
          <label className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 p-3">
            <input type="checkbox" checked={values.is_active} onChange={(event) => setField("is_active", event.target.checked)} className="mt-0.5 size-4 accent-[#635bff]" />
            <span><span className="block text-sm font-semibold text-slate-800">Active</span><span className="mt-1 block text-xs leading-5 text-slate-500">Enable this local configuration. Dates determine the displayed schedule status only.</span></span>
          </label>
          {formError ? <div className="mt-4"><InlineAlert>{formError}</InlineAlert></div> : null}
          <div className="mt-5 flex flex-col gap-2">
            <button type="submit" disabled={isSaving} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5148e5] disabled:cursor-wait disabled:opacity-60">
              <Check size={16} aria-hidden="true" />{isSaving ? "Saving…" : mode === "create" ? "Create discount" : "Save changes"}
            </button>
            <Link href={mode === "edit" && id ? `/discounts/${id}` : "/discounts"} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</Link>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400">This frontend prototype stores data in localStorage. It does not connect to the discount API or apply values to financial documents.</p>
        </aside>
      </form>
    </PageContainer>
  );
}
