"use client";

import { CircleUserRound, CreditCard, FileText, Repeat2 } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/shared/ui";
import { useAuth } from "@/lib/auth/auth-context";

const portalSections = [
  {
    title: "Your subscriptions",
    description: "Subscription details will appear here when the portal API is available.",
    icon: Repeat2,
  },
  {
    title: "Your invoices",
    description: "Invoices and due dates will be connected in a later milestone.",
    icon: FileText,
  },
  {
    title: "Your payments",
    description: "Payment history will be connected in a later milestone.",
    icon: CreditCard,
  },
];

export function CustomerPortalOverview() {
  const { user } = useAuth();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Customer portal"
        title={`Welcome${user?.firstName ? `, ${user.firstName}` : ""}`}
        description="A private space for your Subflow account and billing information."
      />
      <section
        aria-label="Customer account"
        className="flex items-start gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-6"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f0efff] text-[#635bff]">
          <CircleUserRound size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">Account profile</h2>
          <p className="mt-1 break-all text-sm text-slate-600">{user?.email}</p>
          <p className="mt-2 text-xs text-slate-400">
            Signed in as a customer. Your account role does not provide access to workspace administration.
          </p>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3" aria-label="Customer portal sections">
        {portalSections.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-500">
              <Icon size={17} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-sm font-semibold text-slate-800">{title}</h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>
            <span className="mt-4 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
              Not connected
            </span>
          </article>
        ))}
      </section>
    </PageContainer>
  );
}
