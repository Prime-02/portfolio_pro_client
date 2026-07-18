"use client";

import { Suspense } from "react";
import CheckoutCallbackCard from "@/src/app/components/subscription/CheckoutCallbackCard";

export default function CheckoutCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutCallbackCard />
    </Suspense>
  );
}
