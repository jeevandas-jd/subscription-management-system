import type { ReactNode } from "react";
import { ProductProvider } from "@/components/catalog/catalog-provider";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <ProductProvider>{children}</ProductProvider>;
}
