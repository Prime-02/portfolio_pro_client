/**
 * Mirrors app/models/payment/payment_models.py (enums) and
 * app/models/payment/payment_schema.py (pydantic schemas).
 *
 * Keep this in sync by hand — there's no codegen step here, so if a field
 * is added/renamed on the backend schema, update it here too.
 */

// ==================== Enums ====================
export enum PaymentProvider {
  PAYSTACK = "PAYSTACK",
  STRIPE = "STRIPE",
}

export enum BillingInterval {
  HOURLY = "HOURLY",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  BIANNUALLY = "BIANNUALLY",
  ANNUALLY = "ANNUALLY",
}

export enum SubscriptionStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  ABANDONED = "ABANDONED",
  REFUNDED = "REFUNDED",
}

// Mirrors app.models.schemas.SubscriptionTier
export enum SubscriptionTier {
  FREE = "FREE",
  PRO = "PRO",
  PREMIUM = "PREMIUM",
  ENTERPRISE = "ENTERPRISE",
}

// ==================== Plans ====================
export interface SubscriptionPlanResponse {
  id: string;
  name: string;
  tier: string;
  provider: PaymentProvider;
  interval: BillingInterval;
  currency: string;
  amount_minor_unit: number;
  is_active: boolean;
  description: string | null;
  features: string[] | null;
}

export interface PlanCreateRequest {
  tier: SubscriptionTier;
  interval: BillingInterval;
  currency: string; // 3-letter ISO 4217, e.g. "NGN"
  amount_minor_unit: number;
  name: string;
  description?: string | null;
  features?: string[] | null;
}

export interface PlanUpdateRequest {
  // tier/interval/currency/provider_plan_code are immutable — not editable here.
  name?: string | null;
  amount_minor_unit?: number | null;
  description?: string | null;
  features?: string[] | null;
  is_active?: boolean | null;
}

// ==================== Checkout ====================
export interface CheckoutInitRequest {
  plan_id: string;
  callback_url?: string | null;
}

export interface CheckoutInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

// Ad-hoc shape returned by GET /billing/checkout/verify/{reference}
// (not a formal pydantic model in payment_schema.py, just a dict).
export interface CheckoutVerifyResponse {
  status: string | null;
  gateway_response: string | null;
}

// ==================== Subscription ====================
export interface SubscriptionResponse {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_end: string | null; // ISO datetime
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  created_at: string;
}

export interface SubscriptionCancelRequest {
  at_period_end?: boolean; // default true — false cancels immediately
}

// ==================== Transactions ====================
export interface PaymentTransactionResponse {
  id: string;
  provider: PaymentProvider;
  provider_reference: string;
  currency: string;
  amount_minor_unit: number;
  status: TransactionStatus;
  created_at: string;
}

// ==================== Shared error shape ====================
// FastAPI's HTTPException serializes as { detail: string | object }
export interface ApiErrorBody {
  detail?: string | Record<string, unknown>;
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  const maybeAxios = err as { response?: { data?: ApiErrorBody }; message?: string };
  const detail = maybeAxios?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (maybeAxios?.message) return maybeAxios.message;
  return fallback;
}
