"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createCustomer as createCustomerRecord,
  deleteCustomer as deleteCustomerRecord,
  getCustomers,
  updateCustomer as updateCustomerRecord,
} from "@/lib/customers/customer-service";
import { customerStorageKey } from "@/data/mock-customers";
import type { Customer, CustomerInput } from "@/types/customer";

type Toast = {
  id: number;
  title: string;
  message: string;
  tone: "success" | "error";
};

type CustomerContextValue = {
  customers: Customer[];
  isReady: boolean;
  storageError: string | null;
  refresh: () => void;
  create: (data: CustomerInput) => Customer;
  update: (id: string, data: CustomerInput) => Customer;
  remove: (id: string) => void;
  notify: (title: string, message: string, tone?: Toast["tone"]) => void;
};

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback(
    (title: string, message: string, tone: Toast["tone"] = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, title, message, tone }]);
    },
    [],
  );

  const refresh = useCallback(() => {
    try {
      setCustomers(getCustomers());
      setStorageError(null);
      setIsReady(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Customer data could not be loaded.";
      setStorageError(message);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      await Promise.resolve();
      refresh();
    };
    void hydrate();
  }, [refresh]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === customerStorageKey) {
        refresh();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  const create = useCallback(
    (data: CustomerInput) => {
      try {
        const customer = createCustomerRecord(data);
        refresh();
        return customer;
      } catch (error) {
        notify(
          "Could not add customer",
          error instanceof Error ? error.message : "Please try again.",
          "error",
        );
        throw error;
      }
    },
    [notify, refresh],
  );

  const update = useCallback(
    (id: string, data: CustomerInput) => {
      try {
        const customer = updateCustomerRecord(id, data);
        refresh();
        return customer;
      } catch (error) {
        notify(
          "Could not save changes",
          error instanceof Error ? error.message : "Please try again.",
          "error",
        );
        throw error;
      }
    },
    [notify, refresh],
  );

  const remove = useCallback(
    (id: string) => {
      try {
        deleteCustomerRecord(id);
        refresh();
      } catch (error) {
        notify(
          "Could not delete customer",
          error instanceof Error ? error.message : "Please try again.",
          "error",
        );
        throw error;
      }
    },
    [notify, refresh],
  );

  const value = useMemo(
    () => ({
      customers,
      isReady,
      storageError,
      refresh,
      create,
      update,
      remove,
      notify,
    }),
    [customers, isReady, storageError, refresh, create, update, remove, notify],
  );

  return (
    <CustomerContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-20 z-[70] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((toast) => (
          <ToastNotice
            key={toast.id}
            toast={toast}
            onDismiss={() =>
              setToasts((current) => current.filter((item) => item.id !== toast.id))
            }
          />
        ))}
      </div>
    </CustomerContext.Provider>
  );
}

function ToastNotice({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.16)] ${
        toast.tone === "error" ? "border-rose-200" : "border-emerald-200"
      }`}
    >
      <span
        className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
          toast.tone === "error" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
        }`}
        aria-hidden="true"
      >
        {toast.tone === "error" ? "!" : "✓"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
        <p className="mt-1 break-words text-xs leading-5 text-slate-500">{toast.message}</p>
      </div>
      <button
        type="button"
        className="grid size-6 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);

  if (!context) {
    throw new Error("useCustomers must be used within a CustomerProvider.");
  }

  return context;
}

export function CustomerStorageNotice() {
  const { storageError, refresh } = useCustomers();

  if (!storageError) return null;

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <div>
        <p className="text-sm font-semibold text-rose-800">Customer data is unavailable</p>
        <p className="mt-1 text-xs leading-5 text-rose-700">{storageError}</p>
      </div>
      <button
        type="button"
        onClick={refresh}
        className="h-9 shrink-0 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
      >
        Try again
      </button>
    </div>
  );
}
