/**
 * Admin plan-management store — mirrors plan_router.py. Every action here
 * requires the admin dependency server-side (require_admin_role); this
 * store doesn't enforce that itself, it just calls the endpoints.
 *
 * Note from plan_service.py's constraints, surfaced here for UI purposes:
 *  - tier/interval/currency/provider_plan_code are immutable once a plan
 *    exists (PlanUpdateRequest doesn't even carry those fields).
 *  - Amount changes via updatePlan do NOT retroactively reprice existing
 *    subscribers.
 *  - deactivatePlan is local-only (is_active=false); it never calls
 *    Paystack and existing subscribers are unaffected.
 */
import { create } from "zustand";
import { api } from "@/lib/client/api";
import {
  PlanCreateRequest,
  PlanUpdateRequest,
  SubscriptionPlanResponse,
  SubscriptionTier,
  extractErrorMessage,
} from "./payment-types";

interface PlanFilters {
  tier?: SubscriptionTier;
  is_active?: boolean;
}

interface AdminPlanState {
  plans: SubscriptionPlanResponse[];
  selectedPlan: SubscriptionPlanResponse | null;
  filters: PlanFilters;

  isLoadingPlans: boolean;
  isLoadingPlan: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isTogglingActive: boolean;

  error: string | null;

  // ---- actions ----
  fetchPlans: (filters?: PlanFilters) => Promise<SubscriptionPlanResponse[]>;
  fetchPlan: (planId: string) => Promise<SubscriptionPlanResponse>;
  createPlan: (body: PlanCreateRequest) => Promise<SubscriptionPlanResponse>;
  updatePlan: (
    planId: string,
    body: PlanUpdateRequest,
  ) => Promise<SubscriptionPlanResponse>;
  activatePlan: (planId: string) => Promise<SubscriptionPlanResponse>;
  deactivatePlan: (planId: string) => Promise<SubscriptionPlanResponse>;
  setFilters: (filters: PlanFilters) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  plans: [],
  selectedPlan: null,
  filters: {},
  isLoadingPlans: false,
  isLoadingPlan: false,
  isCreating: false,
  isUpdating: false,
  isTogglingActive: false,
  error: null,
};

// Swaps a plan into `plans` by id, keeping list order stable. Falls back to
// leaving the list untouched if the plan isn't currently loaded (e.g. it
// was created after the last fetchPlans call).
function replacePlan(
  plans: SubscriptionPlanResponse[],
  updated: SubscriptionPlanResponse,
): SubscriptionPlanResponse[] {
  const idx = plans.findIndex((p) => p.id === updated.id);
  if (idx === -1) return plans;
  const next = [...plans];
  next[idx] = updated;
  return next;
}

export const useAdminPlanStore = create<AdminPlanState>((set, get) => ({
  ...initialState,

  fetchPlans: async (filters) => {
    const activeFilters = filters ?? get().filters;
    set({ isLoadingPlans: true, error: null, filters: activeFilters });
    try {
      const { data } = await api.get<SubscriptionPlanResponse[]>(
        "/admin/plans",
        { params: activeFilters },
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

  fetchPlan: async (planId) => {
    set({ isLoadingPlan: true, error: null });
    try {
      const { data } = await api.get<SubscriptionPlanResponse>(
        `/admin/plans/${planId}`,
      );
      set({ selectedPlan: data, isLoadingPlan: false });
      return data;
    } catch (err) {
      set({
        isLoadingPlan: false,
        error: extractErrorMessage(err, "Failed to load plan"),
      });
      throw err;
    }
  },

  createPlan: async (body) => {
    set({ isCreating: true, error: null });
    try {
      const { data } = await api.post<SubscriptionPlanResponse>(
        "/admin/plans",
        body,
      );
      set((state) => ({ plans: [...state.plans, data], isCreating: false }));
      return data;
    } catch (err) {
      // 409 = duplicate tier/currency/interval combo, 502 = Paystack call failed
      set({
        isCreating: false,
        error: extractErrorMessage(err, "Failed to create plan"),
      });
      throw err;
    }
  },

  updatePlan: async (planId, body) => {
    set({ isUpdating: true, error: null });
    try {
      const { data } = await api.patch<SubscriptionPlanResponse>(
        `/admin/plans/${planId}`,
        body,
      );
      set((state) => ({
        plans: replacePlan(state.plans, data),
        selectedPlan:
          state.selectedPlan?.id === planId ? data : state.selectedPlan,
        isUpdating: false,
      }));
      return data;
    } catch (err) {
      set({
        isUpdating: false,
        error: extractErrorMessage(err, "Failed to update plan"),
      });
      throw err;
    }
  },

  activatePlan: async (planId) => {
    set({ isTogglingActive: true, error: null });
    try {
      const { data } = await api.post<SubscriptionPlanResponse>(
        `/admin/plans/${planId}/activate`,
      );
      set((state) => ({
        plans: replacePlan(state.plans, data),
        selectedPlan:
          state.selectedPlan?.id === planId ? data : state.selectedPlan,
        isTogglingActive: false,
      }));
      return data;
    } catch (err) {
      set({
        isTogglingActive: false,
        error: extractErrorMessage(err, "Failed to activate plan"),
      });
      throw err;
    }
  },

  deactivatePlan: async (planId) => {
    set({ isTogglingActive: true, error: null });
    try {
      const { data } = await api.post<SubscriptionPlanResponse>(
        `/admin/plans/${planId}/deactivate`,
      );
      set((state) => ({
        plans: replacePlan(state.plans, data),
        selectedPlan:
          state.selectedPlan?.id === planId ? data : state.selectedPlan,
        isTogglingActive: false,
      }));
      return data;
    } catch (err) {
      set({
        isTogglingActive: false,
        error: extractErrorMessage(err, "Failed to deactivate plan"),
      });
      throw err;
    }
  },

  setFilters: (filters) => set({ filters }),
  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));
