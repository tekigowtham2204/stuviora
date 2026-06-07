import "server-only";
import { razorpay } from "@/lib/razorpay/client";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Razorpay Route helpers (P3).
 *
 * A "linked account" (Route account) is the per-student sub-merchant
 * that we transfer the 85% payout into. Created lazily the first time
 * a student is paid; we persist the resulting `razorpay_account_id`
 * on the student row.
 *
 * Per Razorpay docs, the linked-account payload requires bank-account
 * details. v1 ships with UPI + bank captured at onboarding; the
 * onboarding form persists those to `student_wallets.upi_id` /
 * `bank_account_enc`. This file's helper assembles the API payload from
 * those rows.
 *
 * In DEMO_MODE the helpers return synthetic ids so the rest of the
 * flow stays exercisable.
 */

export interface LinkedAccountInput {
  studentId: string;
  fullName: string;
  email: string;
  /** ISO contact phone (e.g. +91XXXXXXXXXX). Required by Razorpay. */
  phone: string;
  /** ifsc bank code, used for bank-channel payouts. */
  ifsc: string;
  /** Bank account number. */
  bankAccount: string;
}

export interface LinkedAccountResult {
  razorpayAccountId: string;
  /** True if the account was newly created on this call. */
  created: boolean;
}

/**
 * Get or create the linked account for a student. Persists the
 * resulting id on `student_profiles.razorpay_account_id` (column to be
 * added in 0006). Idempotent: a second call returns the persisted id.
 *
 * Demo: returns a deterministic synthetic id seeded by student_id.
 */
export async function ensureLinkedAccount(
  input: LinkedAccountInput
): Promise<LinkedAccountResult> {
  const rzp = razorpay();
  if (!rzp) {
    return {
      razorpayAccountId: `acc_demo_${input.studentId.slice(0, 12)}`,
      created: false,
    };
  }

  // 1. Check persisted state via service role.
  const supabase = getServiceSupabase();
  if (supabase) {
    const { data } = await supabase
      .from("student_profiles")
      .select("razorpay_account_id")
      .eq("user_id", input.studentId)
      .single<{ razorpay_account_id: string | null }>();
    if (data?.razorpay_account_id) {
      return { razorpayAccountId: data.razorpay_account_id, created: false };
    }
  }

  // 2. Create via Razorpay Accounts API.
  // The current razorpay-node SDK exposes `accounts.create` on the
  // Razorpay Partner / Route flow. Live wiring against real merchant
  // creds is verified by the founder on first run.
  const account = await callAccountsCreate(rzp, input);

  // 3. Persist.
  if (supabase) {
    await supabase
      .from("student_profiles")
      .update({ razorpay_account_id: account.id })
      .eq("user_id", input.studentId);
  }

  return { razorpayAccountId: account.id, created: true };
}

interface RazorpayAccountsApi {
  accounts?: {
    create: (payload: Record<string, unknown>) => Promise<{ id: string }>;
  };
}

async function callAccountsCreate(
  rzp: ReturnType<typeof razorpay>,
  input: LinkedAccountInput
): Promise<{ id: string }> {
  const sdk = rzp as unknown as RazorpayAccountsApi;
  if (!sdk?.accounts?.create) {
    // Live: throw so the founder sees a clear "SDK version mismatch"
    // message instead of a silent fallback to a fake id.
    throw new Error(
      "razorpay-node does not expose accounts.create in this version; upgrade or call the REST API directly."
    );
  }
  return sdk.accounts.create({
    email: input.email,
    phone: input.phone,
    legal_business_name: input.fullName,
    business_type: "individual",
    contact_name: input.fullName,
    profile: { category: "education", subcategory: "tutoring" },
    bank_account: { ifsc: input.ifsc, account_number: input.bankAccount },
    notes: { student_id: input.studentId },
  });
}
