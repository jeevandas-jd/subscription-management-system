import { z } from "zod";
import { mockPlans, planStorageKey } from "@/data/mock-plans";
import type {
  PlanCreatePayload,
  PlanUpdatePayload,
  SubscriptionPlan,
} from "@/types/catalog";

const planSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  billing_interval: z.enum(["daily", "weekly", "monthly", "yearly"]),
  billing_interval_count: z.number().int().positive(),
  minimum_quantity: z.number().int().positive(),
  available_from: z.string(),
  available_until: z.string().nullable(),
  auto_close: z.boolean(),
  allow_early_close: z.boolean(),
  allow_pause: z.boolean(),
  allow_renewal: z.boolean(),
  is_active: z.boolean().optional(),
  description: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

function readPlans(): SubscriptionPlan[] {
  const stored = window.localStorage.getItem(planStorageKey);
  if (stored === null) return mockPlans.map((plan) => ({ ...plan }));

  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch (error) {
    throw new Error("Saved plan data is unreadable. Clear this browser's Subflow plan data to restore the samples.", { cause: error });
  }

  const parsed = z.array(planSchema).safeParse(value);
  if (!parsed.success) {
    throw new Error("Saved plan data is invalid. Clear this browser's Subflow plan data to restore the samples.");
  }
  return parsed.data;
}

function savePlans(plans: SubscriptionPlan[]) {
  window.localStorage.setItem(planStorageKey, JSON.stringify(plans));
}

export function getPlans(): SubscriptionPlan[] {
  return readPlans().sort(
    (left, right) => (right.created_at ?? "").localeCompare(left.created_at ?? ""),
  );
}

export function getPlanById(id: number): SubscriptionPlan | undefined {
  return readPlans().find((plan) => plan.id === id);
}

export function createPlan(data: PlanCreatePayload): SubscriptionPlan {
  const plans = readPlans();
  if (
    plans.some(
      (plan) => plan.name.toLocaleLowerCase() === data.name.trim().toLocaleLowerCase(),
    )
  ) {
    throw new Error("A plan with this name already exists.");
  }
  const plan: SubscriptionPlan = {
    ...data,
    id: Math.max(0, ...plans.map((record) => record.id)) + 1,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  savePlans([plan, ...plans]);
  return plan;
}

export function updatePlan(id: number, data: PlanUpdatePayload): SubscriptionPlan {
  const plans = readPlans();
  const existing = plans.find((plan) => plan.id === id);
  if (!existing) throw new Error("This plan could not be found.");
  if (
    plans.some(
      (plan) =>
        plan.id !== id &&
        plan.name.toLocaleLowerCase() ===
          (data.name ?? existing.name).trim().toLocaleLowerCase(),
    )
  ) {
    throw new Error("A plan with this name already exists.");
  }

  const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
  savePlans(plans.map((plan) => (plan.id === id ? updated : plan)));
  return updated;
}

export function deletePlan(id: number): void {
  const plans = readPlans();
  if (!plans.some((plan) => plan.id === id)) {
    throw new Error("This plan could not be found.");
  }
  savePlans(plans.filter((plan) => plan.id !== id));
}
