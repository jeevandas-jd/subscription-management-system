"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Command,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { navigationGroups, workspacePages } from "@/data/navigation";
import { notifications } from "@/data/mock-dashboard";
import { DropdownMenu, SearchInput } from "@/components/shared/ui";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const page =
    workspacePages.find(
      (item) =>
        pathname === `/${item.slug}` || pathname.startsWith(`/${item.slug}/`),
    ) ??
    workspacePages[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/55 lg:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <div className="flex min-h-screen">
        <AppSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          pathname={pathname}
          onCollapse={() => setCollapsed((value) => !value)}
          onNavigate={() => setMobileOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader
            pageTitle={page.label}
            mobileSearchOpen={mobileSearchOpen}
            onMenuClick={() => setMobileOpen(true)}
            onSearchClick={() => setMobileSearchOpen((value) => !value)}
          />
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-7 xl:px-9">
            {children}
          </main>
          <footer className="px-4 pb-5 text-center text-[11px] text-slate-400 sm:px-6 xl:px-9">
            <div className="mx-auto flex max-w-[1480px] justify-between gap-3 border-t border-slate-200/80 pt-4">
              <span>Subflow workspace preview</span>
              <span>Built for clear, confident billing</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar({
  collapsed,
  mobileOpen,
  pathname,
  onCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  pathname: string;
  onCollapse: () => void;
  onNavigate: () => void;
}) {
  const settingsPage = workspacePages.find((page) => page.slug === "settings");

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[264px] shrink-0 flex-col bg-[#111827] text-slate-300 shadow-2xl shadow-slate-950/15 transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${collapsed ? "lg:w-[82px]" : "lg:w-[264px]"}`}
      aria-label="Main navigation"
    >
      <div className={`flex h-[76px] items-center border-b border-white/[0.07] px-5 ${collapsed ? "lg:justify-center lg:px-0" : "justify-between"}`}>
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          onClick={onNavigate}
          aria-label="Subflow dashboard"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#635bff] text-sm font-bold text-white shadow-lg shadow-[#635bff]/25">
            S
          </span>
          <span className={collapsed ? "lg:hidden" : ""}>
            <span className="block text-[15px] font-semibold tracking-tight text-white">Subflow</span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">Workspace</span>
          </span>
        </Link>
        <button
          type="button"
          className={`grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden`}
          aria-label="Close navigation"
          onClick={onNavigate}
        >
          <X size={17} />
        </button>
        <button
          type="button"
          className="hidden size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white lg:grid"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onCollapse}
        >
          {collapsed ? <ChevronsRight size={17} /> : <ChevronsLeft size={17} />}
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        {navigationGroups.map((group) => (
          <div className="mb-6" key={group.label}>
            <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 ${collapsed ? "lg:sr-only" : ""}`}>
              {group.label}
            </p>
            <div className="space-y-1">
              {group.slugs.map((slug) => {
                const item = workspacePages.find((page) => page.slug === slug);
                if (!item) return null;
                return (
                  <NavigationLink
                    key={item.slug}
                    item={item}
                    active={
                      pathname === `/${item.slug}` ||
                      pathname.startsWith(`/${item.slug}/`)
                    }
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <div className="mb-6">
          <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 ${collapsed ? "lg:sr-only" : ""}`}>
            Workspace
          </p>
          {settingsPage ? (
            <NavigationLink
              item={settingsPage}
              active={pathname === "/settings"}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ) : null}
        </div>
      </nav>

      <div className={`border-t border-white/[0.07] p-3 ${collapsed ? "lg:px-2" : ""}`}>
        <div className={`flex items-center gap-3 rounded-xl bg-white/[0.06] p-2.5 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#d8d5ff] text-[11px] font-semibold text-[#5148e5]">
            JC
          </span>
          <div className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
            <p className="truncate text-xs font-medium text-white">Jane Cooper</p>
            <p className="mt-0.5 text-[10px] text-slate-400">Admin workspace</p>
          </div>
          <Command className={`text-slate-500 ${collapsed ? "lg:hidden" : ""}`} size={14} aria-hidden="true" />
        </div>
      </div>
    </aside>
  );
}

function NavigationLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: (typeof workspacePages)[number];
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={`/${item.slug}`}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition ${
        active
          ? "bg-[#635bff] text-white shadow-md shadow-[#635bff]/20"
          : "text-slate-400 hover:bg-white/[0.07] hover:text-slate-100"
      } ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
    >
      <Icon
        size={17}
        strokeWidth={active ? 2 : 1.8}
        aria-hidden="true"
        className="shrink-0"
      />
      <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
    </Link>
  );
}

export function AppHeader({
  pageTitle,
  mobileSearchOpen,
  onMenuClick,
  onSearchClick,
}: {
  pageTitle: string;
  mobileSearchOpen: boolean;
  onMenuClick: () => void;
  onSearchClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6 xl:px-9">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 lg:hidden"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <div className="hidden items-center gap-2 text-[11px] font-medium text-slate-400 sm:flex">
              <span>Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500">{pageTitle}</span>
            </div>
            <p className="truncate text-[15px] font-semibold text-slate-900 sm:mt-1">
              {pageTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <SearchInput
            className="hidden w-[min(260px,24vw)] xl:flex"
            placeholder="Search anything..."
            aria-label="Search workspace"
          />
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 xl:hidden"
            aria-label={mobileSearchOpen ? "Close search" : "Open search"}
            onClick={onSearchClick}
          >
            {mobileSearchOpen ? <X size={18} /> : <span className="sr-only">Search</span>}
            {!mobileSearchOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7" />
                <path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            ) : null}
          </button>
          <NotificationDropdown />
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />
          <UserProfileDropdown />
        </div>
      </div>
      {mobileSearchOpen ? (
        <div className="px-4 pb-3 sm:px-6 xl:hidden">
          <SearchInput placeholder="Search customers, invoices..." aria-label="Search workspace" autoFocus />
        </div>
      ) : null}
    </header>
  );
}

function NotificationDropdown() {
  return (
    <DropdownMenu
      label="Notifications"
      trigger={
        <span className="relative grid size-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <Bell size={18} strokeWidth={1.8} aria-hidden="true" />
          <span className="absolute right-[7px] top-[7px] size-2 rounded-full border-2 border-white bg-rose-500" />
        </span>
      }
    >
      <div className="flex items-center justify-between px-3 pb-2 pt-1">
        <p className="text-sm font-semibold text-slate-900">Notifications</p>
        <span className="rounded-full bg-[#f0efff] px-2 py-0.5 text-[10px] font-semibold text-[#5148e5]">
          3 new
        </span>
      </div>
      {notifications.map((notification) => (
        <Link
          className="block rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
          href="/invoices"
          key={notification.id}
        >
          <span className="flex items-start gap-2.5">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#635bff]" />
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-slate-800">{notification.title}</span>
              <span className="mt-1 block truncate text-[11px] text-slate-500">{notification.description}</span>
              <span className="mt-1 block text-[10px] text-slate-400">{notification.time}</span>
            </span>
          </span>
        </Link>
      ))}
      <Link
        className="mt-1 block border-t border-slate-100 px-3 py-2.5 text-center text-xs font-semibold text-[#635bff] hover:text-[#5148e5]"
        href="/invoices"
      >
        View billing activity
      </Link>
    </DropdownMenu>
  );
}

function UserProfileDropdown() {
  return (
    <DropdownMenu
      label="User profile menu"
      trigger={
        <span className="flex cursor-pointer items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition hover:bg-slate-50 sm:gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e6e4ff] text-[11px] font-semibold text-[#5148e5]">
            JC
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold text-slate-800">Jane Cooper</span>
            <span className="mt-0.5 block text-[10px] text-slate-400">Administrator</span>
          </span>
          <ChevronDown size={14} className="hidden text-slate-400 sm:block" aria-hidden="true" />
        </span>
      }
    >
      <div className="px-3 py-2">
        <p className="text-sm font-semibold text-slate-900">Jane Cooper</p>
        <p className="mt-0.5 text-xs text-slate-500">Admin workspace preview</p>
      </div>
      <div className="my-1 border-t border-slate-100" />
      <Link className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50" href="/settings">
        <Settings size={15} aria-hidden="true" />
        Workspace settings
      </Link>
    </DropdownMenu>
  );
}
