import { z } from "zod";
import { customerStorageKey, mockCustomers } from "@/data/mock-customers";
import type { Customer, CustomerInput } from "@/types/customer";

const storedCustomerSchema = z.object({
  id: z.string(),
  customerType: z.enum(["individual", "company"]),
  name: z.string(),
  companyName: z.string().nullable(),
  email: z.string().email(),
  phone: z.string(),
  status: z.enum(["active", "inactive"]),
  billingAddress: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  taxId: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

function readStoredCustomers(): Customer[] {
  const stored = window.localStorage.getItem(customerStorageKey);

  if (stored === null) {
    return mockCustomers.map((customer) => ({ ...customer }));
  }

  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch (error) {
    throw new Error(
      "Saved customer data could not be read. Clear this browser's Subflow customer data to restore the sample records.",
      { cause: error },
    );
  }

  const parsed = z.array(storedCustomerSchema).safeParse(value);

  if (!parsed.success) {
    throw new Error(
      "Saved customer data is invalid. Clear this browser's Subflow customer data to restore the sample records.",
    );
  }

  return parsed.data;
}

function saveCustomers(customers: Customer[]) {
  window.localStorage.setItem(customerStorageKey, JSON.stringify(customers));
}

function assertUniqueEmail(customers: Customer[], email: string, exceptId?: string) {
  const duplicate = customers.some(
    (customer) =>
      customer.id !== exceptId &&
      customer.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (duplicate) {
    throw new Error("A customer with this email address already exists.");
  }
}

export function getCustomers(): Customer[] {
  return readStoredCustomers().sort(
    (left, right) => right.createdAt.localeCompare(left.createdAt),
  );
}

export function getCustomerById(id: string): Customer | undefined {
  return readStoredCustomers().find((customer) => customer.id === id);
}

export function createCustomer(data: CustomerInput): Customer {
  const customers = readStoredCustomers();
  assertUniqueEmail(customers, data.email);

  const now = new Date().toISOString();
  const customer: Customer = {
    ...data,
    id: `CUS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  const next = [customer, ...customers];
  saveCustomers(next);
  return customer;
}

export function updateCustomer(id: string, data: CustomerInput): Customer {
  const customers = readStoredCustomers();
  const existing = customers.find((customer) => customer.id === id);

  if (!existing) {
    throw new Error("This customer could not be found.");
  }

  assertUniqueEmail(customers, data.email, id);

  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  const next = customers.map((customer) =>
    customer.id === id
      ? updated
      : customer,
  );
  saveCustomers(next);
  return updated;
}

export function deleteCustomer(id: string): void {
  const customers = readStoredCustomers();

  if (!customers.some((customer) => customer.id === id)) {
    throw new Error("This customer could not be found.");
  }

  const next = customers.filter((customer) => customer.id !== id);
  saveCustomers(next);
}
