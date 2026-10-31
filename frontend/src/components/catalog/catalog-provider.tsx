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
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "@/lib/products/product-service";
import {
  createVariant,
  deleteVariantsForProduct,
  getAllVariants,
} from "@/lib/products/variant-service";
import {
  createPlan,
  deletePlan,
  getPlans,
  updatePlan,
} from "@/lib/plans/plan-service";
import { productStorageKey, variantStorageKey } from "@/data/mock-products";
import { planStorageKey } from "@/data/mock-plans";
import type {
  PlanCreatePayload,
  PlanUpdatePayload,
  Product,
  ProductCreatePayload,
  ProductUpdatePayload,
  ProductVariant,
  SubscriptionPlan,
  VariantCreatePayload,
} from "@/types/catalog";

type Toast = {
  id: number;
  title: string;
  message: string;
  tone: "success" | "error";
};

type ProductContextValue = {
  products: Product[];
  variants: ProductVariant[];
  isReady: boolean;
  storageError: string | null;
  refresh: () => void;
  create: (data: ProductCreatePayload) => Product;
  update: (id: number, data: ProductUpdatePayload) => Product;
  remove: (id: number) => void;
  addVariant: (productId: number, data: VariantCreatePayload) => ProductVariant;
  notify: (title: string, message: string, tone?: Toast["tone"]) => void;
};

type PlanContextValue = {
  plans: SubscriptionPlan[];
  isReady: boolean;
  storageError: string | null;
  refresh: () => void;
  create: (data: PlanCreatePayload) => SubscriptionPlan;
  update: (id: number, data: PlanUpdatePayload) => SubscriptionPlan;
  remove: (id: number) => void;
  notify: (title: string, message: string, tone?: Toast["tone"]) => void;
};

const ProductContext = createContext<ProductContextValue | null>(null);
const PlanContext = createContext<PlanContextValue | null>(null);

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback(
    (title: string, message: string, tone: Toast["tone"] = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, title, message, tone }]);
    },
    [],
  );
  const viewport = (
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
  );
  return { notify, viewport };
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const { notify, viewport } = useToasts();

  const refresh = useCallback(() => {
    try {
      setProducts(getProducts());
      setVariants(getAllVariants());
      setStorageError(null);
    } catch (error) {
      setStorageError(
        error instanceof Error ? error.message : "Product data could not be loaded.",
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
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        [productStorageKey, variantStorageKey].includes(event.key)
      ) {
        refresh();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  const create = useCallback(
    (data: ProductCreatePayload) => {
      const product = createProduct(data);
      refresh();
      return product;
    },
    [refresh],
  );
  const update = useCallback(
    (id: number, data: ProductUpdatePayload) => {
      const product = updateProduct(id, data);
      refresh();
      return product;
    },
    [refresh],
  );
  const remove = useCallback(
    (id: number) => {
      deleteVariantsForProduct(id);
      deleteProduct(id);
      refresh();
    },
    [refresh],
  );
  const addVariant = useCallback(
    (productId: number, data: VariantCreatePayload) => {
      const variant = createVariant(productId, data);
      refresh();
      return variant;
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      products,
      variants,
      isReady,
      storageError,
      refresh,
      create,
      update,
      remove,
      addVariant,
      notify,
    }),
    [products, variants, isReady, storageError, refresh, create, update, remove, addVariant, notify],
  );

  return (
    <ProductContext.Provider value={value}>
      {children}
      {viewport}
    </ProductContext.Provider>
  );
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const { notify, viewport } = useToasts();

  const refresh = useCallback(() => {
    try {
      setPlans(getPlans());
      setStorageError(null);
    } catch (error) {
      setStorageError(
        error instanceof Error ? error.message : "Plan data could not be loaded.",
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
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === planStorageKey) refresh();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refresh]);

  const create = useCallback(
    (data: PlanCreatePayload) => {
      const plan = createPlan(data);
      refresh();
      return plan;
    },
    [refresh],
  );
  const update = useCallback(
    (id: number, data: PlanUpdatePayload) => {
      const plan = updatePlan(id, data);
      refresh();
      return plan;
    },
    [refresh],
  );
  const remove = useCallback(
    (id: number) => {
      deletePlan(id);
      refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      plans,
      isReady,
      storageError,
      refresh,
      create,
      update,
      remove,
      notify,
    }),
    [plans, isReady, storageError, refresh, create, update, remove, notify],
  );

  return (
    <PlanContext.Provider value={value}>
      {children}
      {viewport}
    </PlanContext.Provider>
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

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used within a ProductProvider.");
  return context;
}

export function usePlans() {
  const context = useContext(PlanContext);
  if (!context) throw new Error("usePlans must be used within a PlanProvider.");
  return context;
}
