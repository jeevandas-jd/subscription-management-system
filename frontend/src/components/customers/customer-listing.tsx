"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Ellipsis,
  FilterX,
  Search,
  Users,
  UserRoundCheck,
  UserRoundPlus,
} from "lucide-react";
import {
  DropdownMenu,
  LoadingSkeleton,
  PageContainer,
  PageHeader,
  StatusBadge,
} from "@/components/shared/ui";
import {
  CustomerStorageNotice,
  useCustomers,
} from "@/components/customers/customer-provider";
import { mockCustomerReferenceDate } from "@/data/mock-customers";
import type { Customer, CustomerStatus } from "@/types/customer";

type CustomerFilter = "all" | CustomerStatus;
type SortKey = "name" | "createdAt";

const pageSize = 8;

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function CustomerListing() {
  const { customers, isReady, storageError } = useCustomers();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CustomerFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return customers
      .filter((customer) => status === "all" || customer.status === status)
      .filter((customer) => {
        if (!search) return true;
        return [
          customer.name,
          customer.email,
          customer.companyName ?? "",
        ].some((value) => value.toLocaleLowerCase().includes(search));
      })
      .toSorted((left, right) => {
        const comparison =
          sortKey === "name"
            ? left.name.localeCompare(right.name)
            : left.createdAt.localeCompare(right.createdAt);
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [customers, query, sortDirection, sortKey, status]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const activeCount = customers.filter((customer) => customer.status === "active").length;
  const inactiveCount = customers.length - activeCount;
  const recentWindowStart = Date.parse(mockCustomerReferenceDate) - 30 * 24 * 60 * 60 * 1000;
  const recentlyAddedCount = customers.filter(
    (customer) =>
      new Date(customer.createdAt).getTime() >= recentWindowStart &&
      new Date(customer.createdAt).getTime() <= Date.parse(mockCustomerReferenceDate),
  ).length;
  const hasFilters = query.trim().length > 0 || status !== "all";

  function changeSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection(key === "name" ? "asc" : "desc");
    }
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setStatus("all");
    setPage(1);
  }

  return (
    <PageContainer>
      <CustomerStorageNotice />
      <PageHeader
        eyebrow="Workspace"
        title="Customers"
        description="Manage your customers and their billing information."
        action={
          <Link
            href="/customers/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white shadow-sm shadow-[#635bff]/20 transition hover:bg-[#5148e5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#635bff]/20"
          >
            <UserRoundPlus size={16} aria-hidden="true" />
            Add customer
          </Link>
        }
      />

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4"
        aria-label="Customer summary"
      >
        <SummaryCard
          label="Total customers"
          value={isReady ? customers.length.toLocaleString("en-IN") : "—"}
          icon={Users}
          tone="violet"
        />
        <SummaryCard
          label="Active customers"
          value={isReady ? activeCount.toLocaleString("en-IN") : "—"}
          icon={UserRoundCheck}
          tone="green"
        />
        <SummaryCard
          label="Inactive customers"
          value={isReady ? inactiveCount.toLocaleString("en-IN") : "—"}
          icon={CircleUserRound}
          tone="amber"
        />
        <SummaryCard
          label="Recently added"
          value={isReady ? recentlyAddedCount.toLocaleString("en-IN") : "—"}
          icon={UserRoundPlus}
          tone="blue"
          hint="In the last 30 days"
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">All customers</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {isReady ? customers.length : "—"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">A directory of your customer accounts</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-10 min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 transition focus-within:border-[#a5a0ff] focus-within:ring-2 focus-within:ring-[#635bff]/10 sm:w-[260px]">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search customers..."
                aria-label="Search by name, email, or company"
                className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
            <label className="relative flex h-10 items-center">
              <span className="sr-only">Filter by customer status</span>
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as CustomerFilter);
                  setPage(1);
                }}
                className="h-full w-full appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-3 pr-9 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-[#a5a0ff] focus:ring-2 focus:ring-[#635bff]/10 sm:w-[150px]"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 text-slate-400" size={14} aria-hidden="true" />
            </label>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <FilterX size={14} aria-hidden="true" />
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-slate-500 sm:px-5">
          <p aria-live="polite">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredCustomers.length)}
            </span>{" "}
            of <span className="font-semibold text-slate-700">{filteredCustomers.length}</span>{" "}
            {filteredCustomers.length === 1 ? "customer" : "customers"}
            {hasFilters ? " matching your filters" : ""}
          </p>
          <p className="text-[11px] text-slate-400">Customer details are mock data</p>
        </div>

        {storageError ? null : !isReady ? (
          <CustomerTableSkeleton />
        ) : filteredCustomers.length === 0 ? (
          <div className="mx-4 mb-5 flex min-h-60 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center sm:mx-5">
            <span className="grid size-11 place-items-center rounded-xl bg-[#f0efff] text-[#635bff]">
              {hasFilters ? <Search size={19} aria-hidden="true" /> : <Building2 size={19} aria-hidden="true" />}
            </span>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              {hasFilters ? "No customers found" : "No customers yet"}
            </h3>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
              {hasFilters
                ? "Try another search or clear the filters to see all customers."
                : "Add your first customer to start building your customer directory."}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-xs font-semibold text-[#635bff] hover:text-[#5148e5]"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <caption className="sr-only">Customer directory</caption>
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/60 text-[10px] font-semibold uppercase tracking-[0.09em] text-slate-400">
                  <th scope="col" className="py-3 pl-5 pr-4">
                    <SortButton
                      label="Customer"
                      active={sortKey === "name"}
                      direction={sortDirection}
                      onClick={() => changeSort("name")}
                    />
                  </th>
                  <th scope="col" className="py-3 pr-4">Company</th>
                  <th scope="col" className="py-3 pr-4">Email</th>
                  <th scope="col" className="py-3 pr-4">Phone</th>
                  <th scope="col" className="py-3 pr-4">Status</th>
                  <th scope="col" className="py-3 pr-4">
                    <SortButton
                      label="Created"
                      active={sortKey === "createdAt"}
                      direction={sortDirection}
                      onClick={() => changeSort("createdAt")}
                    />
                  </th>
                  <th scope="col" className="py-3 pl-2 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageItems.map((customer) => (
                  <CustomerTableRow
                    key={customer.id}
                    customer={customer}
                    onDelete={() => setDeleting(customer)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-700">{currentPage}</span> of{" "}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-[11px] text-slate-400">8 per page</p>
            <div className="flex gap-1.5">
              <button
                type="button"
                aria-label="Previous page"
                disabled={!isReady || currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Next page"
                disabled={!isReady || currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {deleting ? (
        <CustomerDeleteDialog
          customer={deleting}
          onClose={() => setDeleting(null)}
        />
      ) : null}
    </PageContainer>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  tone: "violet" | "green" | "amber" | "blue";
  hint?: string;
}) {
  const tones = {
    violet: "bg-[#f0efff] text-[#635bff]",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span className={`grid size-9 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-slate-400">{hint}</p> : null}
    </article>
  );
}

function SortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
}) {
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowDownUp;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 uppercase tracking-[0.09em] transition hover:text-slate-700"
      aria-label={`Sort by ${label}${active ? ` ${direction === "asc" ? "ascending" : "descending"}` : ""}`}
    >
      {label}
      <Icon size={12} aria-hidden="true" />
    </button>
  );
}

function CustomerTableRow({
  customer,
  onDelete,
}: {
  customer: Customer;
  onDelete: () => void;
}) {
  const router = useRouter();

  return (
    <tr
      tabIndex={0}
      aria-label={`View ${customer.name}`}
      onClick={() => router.push(`/customers/${customer.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/customers/${customer.id}`);
        }
      }}
      className="cursor-pointer text-xs text-slate-600 outline-none transition hover:bg-slate-50/80 focus-visible:bg-[#f8f7ff]"
    >
      <td className="py-3.5 pl-5 pr-4">
        <Link
          href={`/customers/${customer.id}`}
          onClick={(event) => event.stopPropagation()}
          className="flex w-fit items-center gap-2.5 rounded-md"
        >
          <CustomerAvatar name={customer.name} size="sm" />
          <span>
            <span className="block whitespace-nowrap font-semibold text-slate-800">{customer.name}</span>
            <span className="mt-0.5 block text-[10px] text-slate-400">{customer.id}</span>
          </span>
        </Link>
      </td>
      <td className="py-3.5 pr-4">
        <span className="flex items-center gap-2 whitespace-nowrap">
          {customer.companyName ? (
            <Building2 size={14} className="text-slate-400" aria-hidden="true" />
          ) : null}
          {customer.companyName ?? <span className="text-slate-400">—</span>}
        </span>
      </td>
      <td className="py-3.5 pr-4">
        <a
          href={`mailto:${customer.email}`}
          onClick={(event) => event.stopPropagation()}
          className="whitespace-nowrap text-slate-600 hover:text-[#635bff]"
        >
          {customer.email}
        </a>
      </td>
      <td className="whitespace-nowrap py-3.5 pr-4">{customer.phone}</td>
      <td className="py-3.5 pr-4"><StatusBadge status={capitalize(customer.status)} /></td>
      <td className="whitespace-nowrap py-3.5 pr-4 text-slate-500">
        {dateFormatter.format(new Date(customer.createdAt))}
      </td>
      <td className="py-3.5 pl-2 pr-5 text-right" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu
          label={`Actions for ${customer.name}`}
          trigger={
            <span className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
              <Ellipsis size={17} aria-hidden="true" />
            </span>
          }
        >
          <Link
            href={`/customers/${customer.id}`}
            className="block rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            View customer
          </Link>
          <Link
            href={`/customers/${customer.id}/edit`}
            className="block rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Edit customer
          </Link>
          <div className="my-1 border-t border-slate-100" />
          <button
            type="button"
            onClick={onDelete}
            className="block w-full rounded-lg px-3 py-2.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            Delete customer
          </button>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function CustomerAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const sizes = {
    sm: "size-8 text-[10px]",
    md: "size-11 text-sm",
    lg: "size-[60px] text-lg",
  };

  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-[#e8e6ff] font-semibold text-[#5148e5] ${sizes[size]}`}>
      {initials}
    </span>
  );
}

function CustomerTableSkeleton() {
  return (
    <div className="space-y-4 px-5 py-5" aria-label="Loading customers" aria-busy="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div className="flex items-center gap-4" key={index}>
          <LoadingSkeleton className="size-9 shrink-0 rounded-full" />
          <LoadingSkeleton className="h-4 w-36" />
          <LoadingSkeleton className="hidden h-4 w-40 md:block" />
          <LoadingSkeleton className="hidden h-4 w-48 lg:block" />
          <LoadingSkeleton className="ml-auto h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function CustomerDeleteDialog({
  customer,
  onClose,
  onDeleted,
}: {
  customer: Customer;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const { remove, notify } = useCustomers();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  function confirmDelete() {
    try {
      remove(customer.id);
      notify("Customer deleted", `${customer.name} has been removed from the directory.`);
      onDeleted?.();
      onClose();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "The customer could not be deleted.",
      );
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="delete-customer-title"
      aria-describedby="delete-customer-description"
      className="m-auto w-[calc(100%-32px)] max-w-[420px] rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.28)] backdrop:bg-slate-950/45"
    >
        <span className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600">
          <CircleUserRound size={20} aria-hidden="true" />
        </span>
        <h2 id="delete-customer-title" className="mt-4 text-base font-semibold text-slate-900">
          Delete {customer.name}?
        </h2>
        <p id="delete-customer-description" className="mt-2 text-sm leading-6 text-slate-500">
          This will remove this customer from the local sample directory. This action cannot be undone.
        </p>
        {deleteError ? (
          <p role="alert" className="mt-3 text-xs text-rose-600">{deleteError}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-200 px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="h-9 rounded-lg bg-rose-600 px-3.5 text-xs font-semibold text-white transition hover:bg-rose-700"
          >
            Delete customer
          </button>
        </div>
    </dialog>
  );
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
