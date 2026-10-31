import type { Payment } from "@/types/finance";

export const paymentStorageKey = "subflow.payments.v1";

export const mockPayments: Payment[] = [
  {
    id: 1,
    payment_reference: "TXN-ACME-2026-1005",
    customer_id: "CUS-0001",
    invoice_id: 501,
    amount: "2000.00",
    payment_method: "bank_transfer",
    payment_date: "2026-10-05T10:30:00.000Z",
    status: "recorded",
    notes: "Part payment received by bank transfer.",
    created_at: "2026-10-05T10:32:00.000Z",
  },
  {
    id: 2,
    payment_reference: "TXN-ROHAN-2026-0909",
    customer_id: "CUS-0003",
    invoice_id: 503,
    amount: "2000.00",
    payment_method: "upi",
    payment_date: "2026-09-09T12:15:00.000Z",
    status: "recorded",
    notes: "Paid in full.",
    created_at: "2026-09-09T12:18:00.000Z",
  },
];
