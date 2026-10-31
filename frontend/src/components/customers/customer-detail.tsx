"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  CreditCard,
  Ellipsis,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ReceiptText,
  RefreshCw,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { getCustomerInsight } from "@/data/mock-customer-insights";
import {
  CustomerStorageNotice,
  useCustomers,
} from "@/components/customers/customer-provider";
import {
  CustomerAvatar,
  CustomerDeleteDialog,
} from "@/components/customers/customer-listing";
import {
  DropdownMenu,
  EmptyState,
  LoadingSkeleton,
  PageContainer,
  StatusBadge,
} from "@/components/shared/ui";
import type { Customer, CustomerActivity } from "@/types/customer";

type CustomerTab = "overview" | "subscriptions" | "invoices" | "payments" | "activity";

const tabDefinitions: { id: CustomerTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "invoices", label: "Invoices" },
  { id: "payments", label: "Payments" },
  { id: "activity", label: "Activity" },
];

const sampleSubscriptions = [
  { id: "SUB-2026-00128", plan: "Business · Monthly", status: "Active", started: "Oct 14, 2026" },
  { id: "SUB-2026-00092", plan: "Growth · Annual", status: "Active", started: "May 02, 2026" },
  { id: "SUB-2026-00047", plan: "Starter · Monthly", status: "Paused", started: "Feb 18, 2026" },
];

const sampleInvoices = [
  { id: "INV-2026-1048", issued: "Oct 27, 2026", due: "Nov 10, 2026", status: "Paid" },
  { id: "INV-2026-1016", issued: "Sep 27, 2026", due: "Oct 11, 2026", status: "Paid" },
  { id: "INV-2026-0982", issued: "Aug 27, 2026", due: "Sep 10, 2026", status: "Paid" },
];

const samplePayments = [
  { id: "PAY-2026-0851", date: "Oct 30, 2026", method: "Bank transfer", status: "Recorded" },
  { id: "PAY-2026-0788", date: "Sep 29, 2026", method: "Credit card", status: "Recorded" },
  { id: "PAY-2026-0724", date: "Aug 29, 2026", method: "Credit card", status: "Recorded" },
];

export default function CustomerDetail({ customerId }: { customerId: string }) {
  const router = useRouter();
  const { customers, isReady, storageError } = useCustomers();
  const customer = customers.find((item) => item.id === customerId);
  const [activeTab, setActiveTab] = useState<CustomerTab>("overview");
  const [deleting, setDeleting] = useState(false);

  if (!isReady) {
    return (
      <PageContainer>
        <LoadingSkeleton className="h-8 w-64" />
        <LoadingSkeleton className="h-52" />
        <LoadingSkeleton className="h-56" />
      </PageContainer>
    );
  }

  if (storageError) {
    return (
      <PageContainer>
        <CustomerStorageNotice />
      </PageContainer>
    );
  }

  if (!customer) {
    return (
      <PageContainer>
        <EmptyState
          icon={UserRound}
          title="Customer not found"
          description="This customer may have been removed from the local sample directory."
        />
        <Link href="/customers" className="inline-flex items-center gap-2 text-sm font-semibold text-[#635bff]">
          <ArrowLeft size={15} aria-hidden="true" />
          Return to customers
        </Link>
      </PageContainer>
    );
  }

  const insight = getCustomerInsight(customer.id);
  const activity = getCustomerActivity(customer, insight.activity);
  const safeTab = activeTab;

  function activateTab(index: number) {
    const next = tabDefinitions[(index + tabDefinitions.length) % tabDefinitions.length];
    if (next) setActiveTab(next.id);
  }

  return (
    <PageContainer>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/customers" className="transition hover:text-[#635bff]">Customers</Link>
        <span aria-hidden="true">/</span>
        <span className="max-w-[200px] truncate font-medium text-slate-600">{customer.name}</span>
      </div>

      <CustomerProfileHeader customer={customer} onDelete={() => setDeleting(true)} />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Customer statistics">
        <CustomerStat label="Total subscriptions" value={insight.subscriptions} icon={RefreshCw} />
        <CustomerStat label="Active subscriptions" value={insight.activeSubscriptions} icon={BadgeCheck} tone="green" />
        <CustomerStat label="Total invoices" value={insight.invoices} icon={ReceiptText} tone="amber" />
        <CustomerStat label="Payments recorded" value={insight.payments} icon={CreditCard} tone="blue" />
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div
          role="tablist"
          aria-label="Customer profile sections"
          className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 sm:px-5"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              activateTab(tabDefinitions.findIndex((tab) => tab.id === activeTab) + 1);
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              activateTab(tabDefinitions.findIndex((tab) => tab.id === activeTab) - 1);
            }
          }}
        >
          {tabDefinitions.map((tab) => (
            <button
              key={tab.id}
              id={`customer-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={safeTab === tab.id}
              aria-controls={`customer-panel-${tab.id}`}
              tabIndex={safeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`relative shrink-0 px-3 py-4 text-xs font-semibold transition ${
                safeTab === tab.id
                  ? "text-[#635bff] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[#635bff]"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
              {tab.id === "activity" ? (
                <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                  {activity.length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div
          id={`customer-panel-${safeTab}`}
          role="tabpanel"
          aria-labelledby={`customer-tab-${safeTab}`}
          tabIndex={0}
          className="p-4 outline-none sm:p-6"
        >
          {safeTab === "overview" ? (
            <CustomerOverview customer={customer} activity={activity.slice(0, 4)} />
          ) : safeTab === "activity" ? (
            <ActivityTimeline activity={activity} />
          ) : (
            <CustomerRecordsTab
              customer={customer}
              tab={safeTab}
              count={
                safeTab === "subscriptions"
                  ? insight.subscriptions
                  : safeTab === "invoices"
                    ? insight.invoices
                    : insight.payments
              }
            />
          )}
        </div>
      </section>

      {deleting ? (
        <CustomerDeleteDialog
          customer={customer}
          onClose={() => setDeleting(false)}
          onDeleted={() => router.push("/customers")}
        />
      ) : null}
    </PageContainer>
  );
}

function CustomerProfileHeader({
  customer,
  onDelete,
}: {
  customer: Customer;
  onDelete: () => void;
}) {
  const organization = customer.companyName ?? "Individual customer";

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <CustomerAvatar name={customer.name} size="lg" />
          <div className="min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                {customer.name}
              </h1>
              <StatusBadge status={capitalize(customer.status)} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{organization}</p>
            <div className="mt-3 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-5">
              <a className="inline-flex items-center gap-1.5 hover:text-[#635bff]" href={`mailto:${customer.email}`}>
                <Mail size={14} aria-hidden="true" />
                <span className="break-all">{customer.email}</span>
              </a>
              <a className="inline-flex items-center gap-1.5 hover:text-[#635bff]" href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`}>
                <Phone size={14} aria-hidden="true" />
                {customer.phone}
              </a>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:pt-1">
          <Link
            href={`/customers/${customer.id}/edit`}
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-3.5 text-xs font-semibold text-white transition hover:bg-[#5148e5] sm:flex-none"
          >
            <Pencil size={14} aria-hidden="true" />
            Edit customer
          </Link>
          <DropdownMenu
            label={`More actions for ${customer.name}`}
            trigger={
              <span className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
                <Ellipsis size={17} aria-hidden="true" />
              </span>
            }
          >
            <Link
              href={`/customers/${customer.id}/edit`}
              className="block rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Edit details
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
            >
              Delete customer
            </button>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="font-medium text-slate-500">Customer ID</span>
          {customer.id}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={13} aria-hidden="true" />
          Added {formatDate(customer.createdAt)}
        </span>
      </div>
    </section>
  );
}

function CustomerStat({
  label,
  value,
  icon: Icon,
  tone = "violet",
}: {
  label: string;
  value: number;
  icon: typeof RefreshCw;
  tone?: "violet" | "green" | "amber" | "blue";
}) {
  const tones = {
    violet: "bg-[#f0efff] text-[#635bff]",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
      <span className={`grid size-9 place-items-center rounded-lg ${tones[tone]}`}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-500">{label}</p>
      <p className="mt-2 text-[10px] text-slate-400">Sample data</p>
    </article>
  );
}

function CustomerOverview({
  customer,
  activity,
}: {
  customer: Customer;
  activity: CustomerActivity[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <div className="space-y-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Customer information</h2>
          <div className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <InfoItem icon={customer.customerType === "company" ? Building2 : UserRound} label="Customer type">
              {customer.customerType === "company" ? "Company" : "Individual"}
            </InfoItem>
            {customer.companyName ? (
              <InfoItem icon={Building2} label="Company">{customer.companyName}</InfoItem>
            ) : null}
            <InfoItem icon={Mail} label="Email">
              <a className="break-all hover:text-[#635bff]" href={`mailto:${customer.email}`}>{customer.email}</a>
            </InfoItem>
            <InfoItem icon={Phone} label="Phone">
              <a className="hover:text-[#635bff]" href={`tel:${customer.phone.replace(/[^\d+]/g, "")}`}>{customer.phone}</a>
            </InfoItem>
            <InfoItem icon={CalendarDays} label="Registered">{formatDate(customer.createdAt)}</InfoItem>
            <InfoItem icon={BadgeCheck} label="Account status"><StatusBadge status={capitalize(customer.status)} /></InfoItem>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-5">
          <h2 className="text-sm font-semibold text-slate-900">Billing address</h2>
          <div className="mt-3 flex items-start gap-2.5 text-sm leading-6 text-slate-600">
            <MapPin size={16} className="mt-1 shrink-0 text-slate-400" aria-hidden="true" />
            <address className="not-italic">
              {customer.billingAddress}<br />
              {customer.city}, {customer.state} {customer.postalCode}<br />
              {customer.country}
            </address>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-5">
          <h2 className="text-sm font-semibold text-slate-900">Additional information</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <InfoItem icon={FileText} label="Tax identification number">
              {customer.taxId ?? <span className="text-slate-400">Not provided</span>}
            </InfoItem>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-medium text-slate-400">Internal notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {customer.notes ?? <span className="text-slate-400">No internal notes added.</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
        <ActivityTimeline activity={activity} compact />
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <Icon size={13} aria-hidden="true" />
        {label}
      </p>
      <div className="mt-1.5 break-words text-sm text-slate-700">{children}</div>
    </div>
  );
}

function ActivityTimeline({
  activity,
  compact = false,
}: {
  activity: CustomerActivity[];
  compact?: boolean;
}) {
  const activityIcons = {
    customer: UserRound,
    subscription: RefreshCw,
    invoice: FileText,
    payment: CreditCard,
  };
  const activityTones = {
    customer: "bg-blue-50 text-blue-600",
    subscription: "bg-[#f0efff] text-[#635bff]",
    invoice: "bg-amber-50 text-amber-600",
    payment: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Activity timeline</h2>
          <p className="mt-1 text-xs text-slate-500">A history of customer updates</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
          Sample data
        </span>
      </div>
      {activity.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center">
          <p className="text-xs text-slate-500">No activity has been recorded for this customer yet.</p>
        </div>
      ) : (
        <ol className={`space-y-1 ${compact ? "max-h-[440px] overflow-y-auto pr-1" : ""}`}>
          {activity.map((item, index) => {
            const Icon = activityIcons[item.kind];
            return (
              <li key={item.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${activityTones[item.kind]}`}>
                    <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  {index < activity.length - 1 ? <span className="my-1 min-h-3 w-px flex-1 bg-slate-100" aria-hidden="true" /> : null}
                </div>
                <div className="min-w-0 flex-1 pb-4">
                  <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">{item.description}</p>
                  <time className="mt-1 block text-[10px] text-slate-400" dateTime={item.timestamp}>
                    {formatDateTime(item.timestamp)}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function CustomerRecordsTab({
  customer,
  tab,
  count,
}: {
  customer: Customer;
  tab: Exclude<CustomerTab, "overview" | "activity">;
  count: number;
}) {
  const titles = {
    subscriptions: "Subscriptions",
    invoices: "Invoices",
    payments: "Payments",
  };
  const descriptions = {
    subscriptions: "Plans and subscription lifecycle for this customer.",
    invoices: "Billing documents generated for this customer.",
    payments: "Recorded payment history for this customer.",
  };
  const rows =
    tab === "subscriptions"
      ? sampleSubscriptions.slice(0, Math.min(count, 3))
      : tab === "invoices"
        ? sampleInvoices.slice(0, Math.min(count, 3))
        : samplePayments.slice(0, Math.min(count, 3));

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">{titles[tab]}</h2>
        <p className="mt-1 text-xs text-slate-500">{descriptions[tab]}</p>
      </div>
      {count === 0 ? (
        <EmptyState
          icon={tab === "subscriptions" ? RefreshCw : tab === "invoices" ? ReceiptText : CreditCard}
          title={`No ${tab} yet`}
          description={`There are no ${tab} associated with ${customer.name}.`}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full min-w-[560px] text-left">
            <caption className="sr-only">{titles[tab]} for {customer.name} (sample data)</caption>
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              <tr>
                <th scope="col" className="px-4 py-3">{tab === "subscriptions" ? "Subscription" : tab === "invoices" ? "Invoice" : "Payment"}</th>
                <th scope="col" className="px-4 py-3">{tab === "subscriptions" ? "Plan" : tab === "invoices" ? "Issued" : "Date"}</th>
                <th scope="col" className="px-4 py-3">{tab === "invoices" ? "Due date" : tab === "payments" ? "Method" : "Started"}</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {rows.map((row) => (
                <tr key={row.id} className="bg-white">
                  <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-700">{row.id}</td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {"plan" in row ? row.plan : "issued" in row ? row.issued : row.date}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {"started" in row ? row.started : "due" in row ? row.due : row.method}
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[10px] text-slate-400">
        Showing sample records only. Full {tab} management will be available in a later sprint.
      </p>
    </div>
  );
}

function getCustomerActivity(
  customer: Customer,
  sample: CustomerActivity[],
): CustomerActivity[] {
  const activity = [...sample];
  if (!activity.some((item) => item.kind === "customer")) {
    activity.push({
      id: `${customer.id}-created`,
      title: "Customer created",
      description: "Customer record added to the Subflow directory",
      timestamp: customer.createdAt,
      kind: "customer",
    });
  }
  if (customer.updatedAt > customer.createdAt && customer.id.startsWith("CUS-")) {
    const hasUpdate = activity.some((item) => item.title === "Customer information updated");
    if (!hasUpdate && customer.id.startsWith("CUS-")) {
      activity.push({
        id: `${customer.id}-updated`,
        title: "Customer information updated",
        description: "Customer contact and billing details were updated",
        timestamp: customer.updatedAt,
        kind: "customer",
      });
    }
  }
  return activity.sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
