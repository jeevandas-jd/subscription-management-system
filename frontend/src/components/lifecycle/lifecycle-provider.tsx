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
  createQuotation,
  getQuotations,
  updateQuotation,
} from "@/lib/quotations/quotation-service";
import {
  convertQuotationToSubscription,
  createSubscription,
  getSubscriptions,
  performSubscriptionAction,
  updateSubscription,
} from "@/lib/subscriptions/subscription-service";
import { getCustomers } from "@/lib/customers/customer-service";
import { getProducts } from "@/lib/products/product-service";
import { getAllVariants } from "@/lib/products/variant-service";
import { getPlans } from "@/lib/plans/plan-service";
import { quotationStorageKey } from "@/data/mock-quotations";
import { subscriptionStorageKey } from "@/data/mock-subscriptions";
import { customerStorageKey } from "@/data/mock-customers";
import { productStorageKey, variantStorageKey } from "@/data/mock-products";
import { planStorageKey } from "@/data/mock-plans";
import type {
  Quotation,
  QuotationCreatePayload,
  QuotationUpdatePayload,
} from "@/types/quotation";
import type {
  Subscription,
  SubscriptionAction,
  SubscriptionCreatePayload,
  SubscriptionUpdatePayload,
} from "@/types/subscription";
import type { Customer } from "@/types/customer";
import type {
  Product,
  ProductVariant,
  SubscriptionPlan,
} from "@/types/catalog";

type Toast = {
  id: number;
  title: string;
  message: string;
  tone: "success" | "error";
};

type LifecycleContextValue = {
  quotations: Quotation[];
  subscriptions: Subscription[];
  customers: Customer[];
  products: Product[];
  variants: ProductVariant[];
  plans: SubscriptionPlan[];
  isReady: boolean;
  storageError: string | null;
  refresh: () => void;
  createQuotation: (data: QuotationCreatePayload) => Quotation;
  updateQuotation: (id: number, data: QuotationUpdatePayload) => Quotation;
  convertQuotation: (id: number, startDate: string, expiryDate: string) => Subscription;
  createSubscription: (data: SubscriptionCreatePayload) => Subscription;
  updateSubscription: (id: number, data: SubscriptionUpdatePayload) => Subscription;
  actOnSubscription: (id: number, action: SubscriptionAction) => Subscription;
  notify: (title: string, message: string, tone?: Toast["tone"]) => void;
};

const LifecycleContext = createContext<LifecycleContextValue | null>(null);

export function LifecycleProvider({ children }: { children: ReactNode }) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
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
      setQuotations(getQuotations());
      setSubscriptions(getSubscriptions());
      setCustomers(getCustomers());
      setProducts(getProducts());
      setVariants(getAllVariants());
      setPlans(getPlans());
      setStorageError(null);
    } catch (error) {
      setStorageError(
        error instanceof Error ? error.message : "Quotation and subscription data could not be loaded.",
      );
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      await Promise.resolve();
      refresh();
    };
    void hydrate();
    const storageKeys = [
      quotationStorageKey,
      subscriptionStorageKey,
      customerStorageKey,
      productStorageKey,
      variantStorageKey,
      planStorageKey,
    ];
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || storageKeys.includes(event.key)) refresh();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  const createQuote = useCallback(
    (data: QuotationCreatePayload) => {
      const quotation = createQuotation(data);
      refresh();
      return quotation;
    },
    [refresh],
  );
  const updateQuote = useCallback(
    (id: number, data: QuotationUpdatePayload) => {
      const quotation = updateQuotation(id, data);
      refresh();
      return quotation;
    },
    [refresh],
  );
  const convertQuote = useCallback(
    (id: number, startDate: string, expiryDate: string) => {
      const subscription = convertQuotationToSubscription(id, startDate, expiryDate);
      refresh();
      return subscription;
    },
    [refresh],
  );
  const createSubscriptionRecord = useCallback(
    (data: SubscriptionCreatePayload) => {
      const subscription = createSubscription(data);
      refresh();
      return subscription;
    },
    [refresh],
  );
  const updateSubscriptionRecord = useCallback(
    (id: number, data: SubscriptionUpdatePayload) => {
      const subscription = updateSubscription(id, data);
      refresh();
      return subscription;
    },
    [refresh],
  );
  const actOnSubscription = useCallback(
    (id: number, action: SubscriptionAction) => {
      const subscription = performSubscriptionAction(id, action);
      refresh();
      return subscription;
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      quotations,
      subscriptions,
      customers,
      products,
      variants,
      plans,
      isReady,
      storageError,
      refresh,
      createQuotation: createQuote,
      updateQuotation: updateQuote,
      convertQuotation: convertQuote,
      createSubscription: createSubscriptionRecord,
      updateSubscription: updateSubscriptionRecord,
      actOnSubscription,
      notify,
    }),
    [
      quotations,
      subscriptions,
      customers,
      products,
      variants,
      plans,
      isReady,
      storageError,
      refresh,
      createQuote,
      updateQuote,
      convertQuote,
      createSubscriptionRecord,
      updateSubscriptionRecord,
      actOnSubscription,
      notify,
    ],
  );

  return (
    <LifecycleContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-20 z-[70] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.16)] ${
              toast.tone === "error" ? "border-rose-200" : "border-emerald-200"
            }`}
          >
            <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${toast.tone === "error" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`} aria-hidden="true">
              {toast.tone === "error" ? "!" : "✓"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              <p className="mt-1 break-words text-xs leading-5 text-slate-500">{toast.message}</p>
            </div>
            <button type="button" className="grid size-6 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} aria-label="Dismiss notification">×</button>
          </div>
        ))}
      </div>
    </LifecycleContext.Provider>
  );
}

export function useLifecycle() {
  const context = useContext(LifecycleContext);
  if (!context) throw new Error("useLifecycle must be used within a LifecycleProvider.");
  return context;
}
