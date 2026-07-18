/**
 * User-facing billing store — mirrors billing_router.py (API-key-protected
 * endpoints). The Paystack webhook remains the source of truth for actually
 * activating a subscription; `verifyCheckout` here is just a UX nicety for
 * polling right after the Paystack redirect, per the router's own comment.
 */
import { create } from "zustand";
import { api } from "@/lib/client/api";
import {
  CheckoutInitRequest,
  CheckoutInitResponse,
  CheckoutVerifyResponse,
  SubscriptionCancelRequest,
  SubscriptionPlanResponse,
  SubscriptionResponse,
  SubscriptionTier,
  extractErrorMessage,
} from "./payment-types";

interface PlanFilters {
  tier?: SubscriptionTier;
  is_active?: boolean;
}

interface BillingState {
  subscription: SubscriptionResponse | null;
  checkout: CheckoutInitResponse | null;
  lastVerification: CheckoutVerifyResponse | null;
  plans: SubscriptionPlanResponse[];

  isLoadingSubscription: boolean;
  isInitializingCheckout: boolean;
  isVerifyingCheckout: boolean;
  isCancelling: boolean;
  isLoadingPlans: boolean;

  error: string | null;

  // ---- actions ----
  fetchSubscription: () => Promise<SubscriptionResponse | null>;
  initializeCheckout: (
    planId: string,
    callbackUrl?: string,
  ) => Promise<CheckoutInitResponse>;
  verifyCheckout: (reference: string) => Promise<CheckoutVerifyResponse>;
  cancelSubscription: (atPeriodEnd?: boolean) => Promise<SubscriptionResponse>;
  // Public plan listing — no admin role required. Defaults to active plans
  // only, since that's what a checkout/plan-picker screen wants; pass
  // { is_active: undefined } explicitly if you ever need the full list.
  fetchPlans: (filters?: PlanFilters) => Promise<SubscriptionPlanResponse[]>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  subscription: null,
  checkout: null,
  lastVerification: null,
  plans: [],
  isLoadingSubscription: false,
  isInitializingCheckout: false,
  isVerifyingCheckout: false,
  isCancelling: false,
  isLoadingPlans: false,
  error: null,
};

export const useBillingStore = create<BillingState>((set, get) => ({
  ...initialState,

  fetchSubscription: async () => {
    set({ isLoadingSubscription: true, error: null });
    try {
      const { data } = await api.get<SubscriptionResponse | null>(
        "/billing/subscription",
      );
      set({ subscription: data, isLoadingSubscription: false });
      return data;
    } catch (err) {
      set({
        isLoadingSubscription: false,
        error: extractErrorMessage(err, "Failed to load subscription"),
      });
      throw err;
    }
  },

  initializeCheckout: async (planId, callbackUrl) => {
    set({ isInitializingCheckout: true, error: null });
    try {
      const body: CheckoutInitRequest = {
        plan_id: planId,
        callback_url: callbackUrl ?? null,
      };
      const { data } = await api.post<CheckoutInitResponse>(
        "/billing/checkout/initialize",
        body,
      );
      set({ checkout: data, isInitializingCheckout: false });
      return data;
      // Caller is responsible for redirecting to data.authorization_url —
      // this store just holds the result.
    } catch (err) {
      set({
        isInitializingCheckout: false,
        error: extractErrorMessage(err, "Failed to start checkout"),
      });
      throw err;
    }
  },

  verifyCheckout: async (reference) => {
    set({ isVerifyingCheckout: true, error: null });
    try {
      const { data } = await api.get<CheckoutVerifyResponse>(
        `/billing/checkout/verify/${reference}`,
      );
      set({ lastVerification: data, isVerifyingCheckout: false });
      return data;
    } catch (err) {
      set({
        isVerifyingCheckout: false,
        error: extractErrorMessage(err, "Failed to verify checkout"),
      });
      throw err;
    }
  },

  cancelSubscription: async (atPeriodEnd = true) => {
    set({ isCancelling: true, error: null });
    try {
      const body: SubscriptionCancelRequest = { at_period_end: atPeriodEnd };
      const { data } = await api.post<SubscriptionResponse>(
        "/billing/subscription/cancel",
        body,
      );
      set({ subscription: data, isCancelling: false });
      return data;
    } catch (err) {
      set({
        isCancelling: false,
        error: extractErrorMessage(err, "Failed to cancel subscription"),
      });
      throw err;
    }
  },

  fetchPlans: async (filters = { is_active: true }) => {
    set({ isLoadingPlans: true, error: null });
    try {
      // Same underlying route as the admin store's fetchPlans — now public.
      // If the backend route path changes when you drop the admin gate
      // (e.g. /admin/plans -> /plans), update the URL here too.
      const { data } = await api.get<SubscriptionPlanResponse[]>(
        "/admin/plans",
        { params: filters },
      );
      set({ plans: data, isLoadingPlans: false });
      return data;
    } catch (err) {
      set({
        isLoadingPlans: false,
        error: extractErrorMessage(err, "Failed to load plans"),
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

// ---- convenience selectors ----
export const selectHasActiveSubscription = (s: BillingState) =>
  s.subscription?.status === "ACTIVE";

export const selectIsPastDue = (s: BillingState) =>
  s.subscription?.status === "PAST_DUE";

export const selectIsCancelling = (s: BillingState) =>
  s.subscription?.cancel_at_period_end === true &&
  s.subscription?.status === "ACTIVE";
