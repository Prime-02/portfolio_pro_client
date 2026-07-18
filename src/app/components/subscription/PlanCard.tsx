"use client";

import { Check, Sparkles } from "lucide-react";
import { useTheme } from "@/src/context/ThemeContext";
import { getColorShade } from "@/lib/utilities/syncFunctions/syncs";
import Button from "@/src/app/components/buttons/Buttons";
import { formatMoney, intervalLabel } from "./utils";
import { SubscriptionPlanResponse } from "@/lib/stores/billing/payment-types";

interface PlanCardProps {
  plan: SubscriptionPlanResponse;
  isCurrent: boolean;
  isLoading: boolean;
  onSelect: (plan: SubscriptionPlanResponse) => void;
}

export default function PlanCard({
  plan,
  isCurrent,
  isLoading,
  onSelect,
}: PlanCardProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`flex flex-col gap-5 rounded-2xl border p-6 transition-all duration-200 ${
        isCurrent
          ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]"
          : "border-[var(--foreground)]/10 hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-lg"
      }`}
      style={{ backgroundColor: getColorShade(theme.background, 1) }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-league text-lg font-semibold tracking-tight">
          {plan.name}
        </h3>
        {isCurrent && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
            <Sparkles size={12} />
            Current
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight tabular-nums">
          {formatMoney(plan.amount_minor_unit, plan.currency)}
        </span>
        <span className="text-sm opacity-60">
          {intervalLabel[plan.interval]}
        </span>
      </div>

      {plan.description && (
        <p className="text-sm leading-relaxed opacity-70">
          {plan.description}
        </p>
      )}

      {plan.features && plan.features.length > 0 && (
        <ul className="flex flex-col gap-2.5 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10">
                <Check
                  size={11}
                  strokeWidth={3}
                  className="text-[var(--accent)]"
                />
              </span>
              <span className="opacity-80">{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <Button
        text={isCurrent ? "Current plan" : "Choose plan"}
        variant={isCurrent ? "outline" : "primary"}
        disabled={isCurrent}
        loading={isLoading}
        onClick={() => onSelect(plan)}
        className="mt-auto w-full justify-center transition-transform active:scale-[0.98]"
      />
    </div>
  );
}
