"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  Building2,
  Check,
  CircleUserRound,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCustomers } from "@/components/customers/customer-provider";
import { PageContainer, PageHeader } from "@/components/shared/ui";
import type {
  Customer,
  CustomerFormValues,
  CustomerInput,
} from "@/types/customer";

const customerFormSchema = z
  .object({
    customerType: z.enum(["individual", "company"]),
    name: z.string().trim().min(2, "Enter the customer name.").max(100),
    companyName: z.string().trim().max(120, "Company name is too long."),
    email: z.string().trim().email("Enter a valid email address.").max(254),
    phone: z
      .string()
      .trim()
      .min(1, "Enter a contact phone number.")
      .max(30, "Phone number is too long.")
      .regex(
        /^\+?[0-9][0-9\s().-]*(?:\s*(?:ext\.?|x)\s*\d{1,6})?$/i,
        "Use a valid international phone number.",
      )
      .refine(
        (value) => {
          const number = value.replace(/\D/g, "");
          return number.length >= 7 && number.length <= 15;
        },
        "Phone number should contain 7 to 15 digits.",
      ),
    billingAddress: z.string().trim().min(1, "Enter the billing address.").max(180),
    city: z.string().trim().min(1, "Enter the city.").max(80),
    state: z.string().trim().min(1, "Enter the state or region.").max(80),
    postalCode: z.string().trim().min(1, "Enter the postal code.").max(20),
    country: z.string().trim().min(1, "Enter the country.").max(80),
    taxId: z.string().trim().max(50, "Tax ID is too long."),
    notes: z.string().trim().max(1000, "Notes must be 1,000 characters or fewer."),
  })
  .superRefine((values, context) => {
    if (values.customerType === "company" && !values.companyName.trim()) {
      context.addIssue({
        code: "custom",
        message: "Enter the company name.",
        path: ["companyName"],
      });
    }
  });

type CustomerFormData = z.infer<typeof customerFormSchema>;

const emptyValues: CustomerFormValues = {
  customerType: "individual",
  name: "",
  companyName: "",
  email: "",
  phone: "",
  billingAddress: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  taxId: "",
  notes: "",
};

function formValuesFromCustomer(customer: Customer): CustomerFormValues {
  return {
    customerType: customer.customerType,
    name: customer.name,
    companyName: customer.companyName ?? "",
    email: customer.email,
    phone: customer.phone,
    billingAddress: customer.billingAddress,
    city: customer.city,
    state: customer.state,
    postalCode: customer.postalCode,
    country: customer.country,
    taxId: customer.taxId ?? "",
    notes: customer.notes ?? "",
  };
}

function toCustomerInput(values: CustomerFormData): CustomerInput {
  return {
    customerType: values.customerType,
    name: values.name.trim(),
    companyName:
      values.customerType === "company" ? values.companyName.trim() : null,
    email: values.email.trim(),
    phone: values.phone.trim(),
    billingAddress: values.billingAddress.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    postalCode: values.postalCode.trim(),
    country: values.country.trim(),
    taxId: values.taxId.trim() || null,
    notes: values.notes.trim() || null,
  };
}

export default function CustomerForm({
  mode,
  customer,
}: {
  mode: "create" | "edit";
  customer?: Customer;
}) {
  const router = useRouter();
  const { create, update, notify } = useCustomers();
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer ? formValuesFromCustomer(customer) : emptyValues,
    mode: "onBlur",
  });
  const customerType = useWatch({ control: form.control, name: "customerType" });
  const notesValue = useWatch({ control: form.control, name: "notes" });
  const rootError = form.formState.errors.root?.server?.message;

  async function submit(values: CustomerFormData) {
    form.clearErrors("root.server");

    try {
      const input = toCustomerInput(values);
      const savedCustomer =
        mode === "create"
          ? create(input)
          : customer
            ? update(customer.id, input)
            : null;

      if (!savedCustomer) {
        form.setError("root.server", {
          message: "Customer information is unavailable. Return to the customer list and try again.",
        });
        return;
      }

      notify(
        mode === "create" ? "Customer added" : "Customer updated",
        `${savedCustomer.name} is ${mode === "create" ? "now in" : "saved in"} your customer directory.`,
      );
      router.push(`/customers/${savedCustomer.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "The customer could not be saved.";
      if (message.toLowerCase().includes("email address already exists")) {
        form.setError("email", { type: "server", message });
      } else {
        form.setError("root.server", { type: "server", message });
      }
    }
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow={mode === "create" ? "Customer directory" : "Customer profile"}
        title={mode === "create" ? "Add customer" : "Edit customer"}
        description={
          mode === "create"
            ? "Add a customer profile and billing contact to your workspace."
            : `Update the billing and contact details for ${customer?.name ?? "this customer"}.`
        }
        action={
          <Link
            href={customer ? `/customers/${customer.id}` : "/customers"}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            {mode === "create" ? "Back to customers" : "Cancel"}
          </Link>
        }
      />

      <form
        onSubmit={form.handleSubmit(submit)}
        noValidate
        className="mx-auto max-w-[920px] space-y-5"
      >
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <SectionHeading
            icon={CircleUserRound}
            title="Basic information"
            description="Contact details for the customer account."
          />
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <Field label="Customer type" required className="sm:col-span-2">
              <div role="radiogroup" aria-label="Customer type" className="grid grid-cols-2 gap-3">
                <CustomerTypeOption
                  selected={customerType === "individual"}
                  title="Individual"
                  description="A person or sole proprietor"
                  icon={CircleUserRound}
                  onClick={() => form.setValue("customerType", "individual", { shouldValidate: true })}
                />
                <CustomerTypeOption
                  selected={customerType === "company"}
                  title="Company"
                  description="A registered organization"
                  icon={Building2}
                  onClick={() => form.setValue("customerType", "company", { shouldValidate: true })}
                />
              </div>
              <input type="hidden" {...form.register("customerType")} />
            </Field>

            <FormField
              id="field-customer-name"
              label={customerType === "company" ? "Primary contact name" : "Customer name"}
              required
              error={form.formState.errors.name?.message}
            >
              <input
                id="field-customer-name"
                {...form.register("name")}
                autoComplete="name"
                placeholder="e.g. Maya Patel"
                className={inputClass(Boolean(form.formState.errors.name))}
              />
            </FormField>
            {customerType === "company" ? (
              <FormField
                id="field-company-name"
                label="Company name"
                required
                error={form.formState.errors.companyName?.message}
              >
                <input
                  id="field-company-name"
                  {...form.register("companyName")}
                  autoComplete="organization"
                  placeholder="e.g. Brightlane Co."
                  className={inputClass(Boolean(form.formState.errors.companyName))}
                />
              </FormField>
            ) : null}
            <FormField id="field-email-address" label="Email address" required error={form.formState.errors.email?.message}>
              <input
                id="field-email-address"
                {...form.register("email")}
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                className={inputClass(Boolean(form.formState.errors.email))}
              />
            </FormField>
            <FormField id="field-phone-number" label="Phone number" required error={form.formState.errors.phone?.message}>
              <input
                id="field-phone-number"
                {...form.register("phone")}
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                className={inputClass(Boolean(form.formState.errors.phone))}
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Include a country code for international contacts.
              </p>
            </FormField>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <SectionHeading
            icon={Building2}
            title="Billing information"
            description="The billing address used for customer records."
          />
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <FormField
              id="field-billing-address"
              label="Billing address"
              required
              className="sm:col-span-2"
              error={form.formState.errors.billingAddress?.message}
            >
              <textarea
                id="field-billing-address"
                {...form.register("billingAddress")}
                autoComplete="street-address"
                rows={2}
                placeholder="Street address, building, suite"
                className={`${inputClass(Boolean(form.formState.errors.billingAddress))} min-h-[78px] resize-y py-2.5`}
              />
            </FormField>
            <FormField id="field-city" label="City" required error={form.formState.errors.city?.message}>
              <input
                id="field-city"
                {...form.register("city")}
                autoComplete="address-level2"
                placeholder="City"
                className={inputClass(Boolean(form.formState.errors.city))}
              />
            </FormField>
            <FormField id="field-state-region" label="State / region" required error={form.formState.errors.state?.message}>
              <input
                id="field-state-region"
                {...form.register("state")}
                autoComplete="address-level1"
                placeholder="State or region"
                className={inputClass(Boolean(form.formState.errors.state))}
              />
            </FormField>
            <FormField id="field-postal-code" label="Postal code" required error={form.formState.errors.postalCode?.message}>
              <input
                id="field-postal-code"
                {...form.register("postalCode")}
                autoComplete="postal-code"
                placeholder="Postal code"
                className={inputClass(Boolean(form.formState.errors.postalCode))}
              />
            </FormField>
            <FormField id="field-country" label="Country" required error={form.formState.errors.country?.message}>
              <input
                id="field-country"
                {...form.register("country")}
                autoComplete="country-name"
                placeholder="Country"
                className={inputClass(Boolean(form.formState.errors.country))}
              />
            </FormField>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <SectionHeading
            icon={Save}
            title="Additional information"
            description="Optional details for your internal team."
          />
          <div className="grid gap-5 p-5 sm:p-6">
            <FormField id="field-tax-identification-number" label="Tax identification number" error={form.formState.errors.taxId?.message}>
              <input
                id="field-tax-identification-number"
                {...form.register("taxId")}
                placeholder="e.g. GSTIN or VAT number"
                className={inputClass(Boolean(form.formState.errors.taxId))}
              />
            </FormField>
            <FormField id="field-internal-notes" label="Internal notes" error={form.formState.errors.notes?.message}>
              <textarea
                id="field-internal-notes"
                {...form.register("notes")}
                rows={4}
                placeholder="Add context for your team (not shared with the customer)"
                className={`${inputClass(Boolean(form.formState.errors.notes))} min-h-[104px] resize-y py-2.5`}
              />
              <p className="mt-1.5 text-right text-[11px] text-slate-400">
                {notesValue.length}/1,000
              </p>
            </FormField>
          </div>
        </section>

        {rootError ? (
          <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {rootError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse justify-end gap-2 pb-2 sm:flex-row">
          <Link
            href={customer ? `/customers/${customer.id}` : "/customers"}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#635bff] px-4 text-xs font-semibold text-white shadow-sm shadow-[#635bff]/20 transition hover:bg-[#5148e5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {form.formState.isSubmitting ? (
              <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
            ) : mode === "create" ? (
              <Check size={15} aria-hidden="true" />
            ) : (
              <Save size={15} aria-hidden="true" />
            )}
            {mode === "create" ? "Add customer" : "Save changes"}
          </button>
        </div>
      </form>
    </PageContainer>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Save;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f0efff] text-[#635bff]">
        <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function CustomerTypeOption({
  selected,
  title,
  description,
  icon: Icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: typeof Save;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-label={title}
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition sm:p-4 ${
        selected
          ? "border-[#a5a0ff] bg-[#f8f7ff] ring-2 ring-[#635bff]/10"
          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${selected ? "bg-[#e9e7ff] text-[#635bff]" : "bg-slate-100 text-slate-500"}`}>
        <Icon size={17} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-slate-800">{title}</span>
        <span className="mt-1 block text-[10px] leading-4 text-slate-500">{description}</span>
      </span>
    </button>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium text-slate-700">
        {label} {required ? <span className="text-rose-500" aria-hidden="true">*</span> : null}
      </p>
      {children}
    </div>
  );
}

function FormField({
  id,
  label,
  required,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-xs font-medium text-slate-700">
        {label} {required ? <span className="text-rose-500" aria-hidden="true">*</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-[11px] text-rose-600" role="alert">{error}</p> : null}
    </div>
  );
}

function inputClass(invalid: boolean) {
  return `h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#a5a0ff] focus:ring-2 focus:ring-[#635bff]/10 ${
    invalid ? "border-rose-300" : "border-slate-200"
  }`;
}
