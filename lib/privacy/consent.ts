/**
 * Consent + data-principal rights model (P7 / DPDP).
 *
 * India's DPDP Act 2023 (Rules notified Nov 2025, substantive duties from
 * May 2027) requires itemized, purpose-specific consent and a set of data
 * principal rights. These are pure helpers; the store lives behind the
 * data layer and the Server Actions in app/actions/privacy.ts. Built and
 * testable now so the flows are ready well before the compliance date.
 */

/** A single consentable processing purpose, shown itemized in the notice. */
export interface ConsentPurpose {
  key: ConsentPurposeKey;
  label: string;
  description: string;
  /** Essential purposes cannot be declined (needed to run the account). */
  essential: boolean;
}

export type ConsentPurposeKey =
  | "essential"
  | "analytics"
  | "marketing_email"
  | "match_notifications"
  | "share_with_college";

export const CONSENT_PURPOSES: ConsentPurpose[] = [
  {
    key: "essential",
    label: "Run your account",
    description:
      "Sign-in, payments, orders, and security. Required to use Stuviora.",
    essential: true,
  },
  {
    key: "match_notifications",
    label: "Job match alerts",
    description: "Email you when a job is a strong fit for your skills.",
    essential: false,
  },
  {
    key: "analytics",
    label: "Product analytics",
    description:
      "Understand how the product is used so we can improve it. No selling of data.",
    essential: false,
  },
  {
    key: "marketing_email",
    label: "Tips and updates",
    description: "Occasional product news and earning tips. Opt out any time.",
    essential: false,
  },
  {
    key: "share_with_college",
    label: "Share with my college",
    description:
      "Let your college's placement cell see your name, activity, and earnings band in their cohort dashboard. Off by default.",
    essential: false,
  },
];

/** DPDP data-principal rights, surfaced in the rights center. */
export const DATA_PRINCIPAL_RIGHTS = [
  "Access a copy of your personal data",
  "Correct or update inaccurate data",
  "Erase your data and delete your account",
  "Withdraw consent as easily as you gave it",
  "Raise a grievance and get a response within 90 days",
  "Nominate someone to act on your behalf",
] as const;

export type ConsentState = Record<ConsentPurposeKey, boolean>;

/** Default consent: essentials on, everything optional off (opt-in). */
export function defaultConsent(): ConsentState {
  return {
    essential: true,
    match_notifications: false,
    analytics: false,
    marketing_email: false,
    share_with_college: false,
  };
}

/**
 * Apply a user's choices, forcing essential purposes to stay true (they
 * cannot be declined while the account exists).
 */
export function applyConsentChoices(
  choices: Partial<ConsentState>
): ConsentState {
  const base = defaultConsent();
  const merged = { ...base, ...choices };
  for (const p of CONSENT_PURPOSES) {
    if (p.essential) merged[p.key] = true;
  }
  return merged;
}

export interface ConsentRecord {
  userId: string;
  state: ConsentState;
  /** ISO timestamp the consent was captured (audit requirement). */
  recordedAt: string;
  /** Version of the consent notice the user agreed to. */
  noticeVersion: string;
}

export const CONSENT_NOTICE_VERSION = "2026-06-07";

/** Build an auditable consent record from a user's choices. */
export function buildConsentRecord(
  userId: string,
  choices: Partial<ConsentState>,
  now: Date = new Date()
): ConsentRecord {
  return {
    userId,
    state: applyConsentChoices(choices),
    recordedAt: now.toISOString(),
    noticeVersion: CONSENT_NOTICE_VERSION,
  };
}
