export type CustomerType = "individual" | "company";

export type CustomerStatus = "active" | "inactive";

export type Customer = {
  id: string;
  customerType: CustomerType;
  name: string;
  companyName: string | null;
  email: string;
  phone: string;
  status: CustomerStatus;
  billingAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerInput = Omit<
  Customer,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export type CustomerFormValues = {
  customerType: CustomerType;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string;
  notes: string;
};

export type CustomerActivity = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  kind: "customer" | "subscription" | "invoice" | "payment";
};

export type CustomerInsight = {
  subscriptions: number;
  activeSubscriptions: number;
  invoices: number;
  payments: number;
  activity: CustomerActivity[];
};
