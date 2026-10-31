import { Search, type LucideIcon } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-7">
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const statTones = {
  violet: "bg-[#f0efff] text-[#635bff]",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
};

export function StatCard({
  label,
  value,
  change,
  comparison,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  change: string;
  comparison: string;
  icon: LucideIcon;
  tone: keyof typeof statTones;
}) {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium leading-5 text-slate-500">{label}</p>
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${statTones[tone]}`}>
          <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-4 text-[26px] font-semibold tracking-tight text-slate-950 sm:text-[28px]">
        {value}
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs">
        <span className="font-semibold text-emerald-600">{change}</span>
        <span className="text-slate-400">{comparison}</span>
      </p>
    </article>
  );
}

const statusTones: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  trial: "bg-blue-50 text-blue-700 ring-blue-600/15",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/15",
  "past due": "bg-amber-50 text-amber-700 ring-amber-600/15",
  overdue: "bg-rose-50 text-rose-700 ring-rose-600/15",
  "action needed": "bg-rose-50 text-rose-700 ring-rose-600/15",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-500/15",
  closed: "bg-slate-100 text-slate-600 ring-slate-500/15",
  draft: "bg-slate-100 text-slate-600 ring-slate-500/15",
  quotation: "bg-violet-50 text-violet-700 ring-violet-600/15",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-600/15",
  paused: "bg-slate-100 text-slate-600 ring-slate-500/15",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = statusTones[status.toLowerCase()] ?? "bg-slate-100 text-slate-600 ring-slate-500/15";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${tone}`}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

export function SearchInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex h-10 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 text-slate-400 transition focus-within:border-[#a5a0ff] focus-within:ring-2 focus-within:ring-[#635bff]/10 ${className}`}>
      <Search size={16} aria-hidden="true" />
      <input
        className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        {...props}
      />
    </label>
  );
}

export type DateRangeValue = "6" | "12";

export function DateRangeSelector({
  value,
  onChange,
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">Revenue chart date range</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value === "6" ? "6" : "12")}
        className="h-9 appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-3 pr-8 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-[#a5a0ff] focus:ring-2 focus:ring-[#635bff]/10"
      >
        <option value="6">Last 6 months</option>
        <option value="12">Last 12 months</option>
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

export type TableColumn<Row> = {
  header: string;
  cell: (row: Row) => ReactNode;
  className?: string;
};

export function DataTable<Row>({
  columns,
  rows,
  getRowKey,
  label,
}: {
  columns: TableColumn<Row>[];
  rows: Row[];
  getRowKey: (row: Row) => string;
  label: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr className="border-y border-slate-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {columns.map((column) => (
              <th className={`py-3 pr-4 ${column.className ?? ""}`} key={column.header} scope="col">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr className="text-sm text-slate-700" key={getRowKey(row)}>
              {columns.map((column) => (
                <td className={`py-3.5 pr-4 ${column.className ?? ""}`} key={column.header}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#f0efff] text-[#635bff]">
        <Icon size={21} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/75 ${className}`}
      aria-hidden="true"
    />
  );
}

export function DropdownMenu({
  trigger,
  children,
  align = "right",
  label,
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  label: string;
}) {
  return (
    <details className="group relative">
      <summary
        aria-label={label}
        className="list-none cursor-pointer [&::-webkit-details-marker]:hidden"
      >
        {trigger}
      </summary>
      <div
        className={`absolute top-[calc(100%+10px)] z-50 w-[min(320px,calc(100vw-32px))] rounded-xl border border-slate-200 bg-white p-2 shadow-[0_16px_50px_rgba(15,23,42,0.15)] ${align === "right" ? "right-0" : "left-0"}`}
      >
        {children}
      </div>
    </details>
  );
}
