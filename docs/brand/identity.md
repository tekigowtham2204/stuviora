# Stuviora brand identity

> The visual identity system. Read this before touching any brand surface
> (logo, icons, social cards, decks). The mark is code-native: it lives in
> `components/brand/`, so the source of truth is the repo, not a design file.
>
> **Last touched:** 2026-06-26.

---

## 1. The idea

Stuviora is a trust platform. The whole moat is verification: the AI
quality gate, the autonomous escrow loop, and portable verdict receipts.
The mark has to say "verified, trusted" at a glance, while staying warm
and human, not cold and corporate.

## 2. The mark: "The Gate Seal"

A protective seal with a deliberate gate-opening at the top-right, through
which a verified check passes, resolving in a spark.

| Element | Meaning |
|---|---|
| The seal (rounded-square ring) | Trust, escrow, "Trust the platform." |
| The gap at the top-right | The AI quality gate; work passes through it. |
| The check | Verification. PASS. |
| The spark | "Viora, brilliance emerges." The student's outcome. |

It is deliberately not a generic check-in-a-circle. The gate-notch and the
spark make it ownable and tie it to the product. It must read as "approved"
down to 16px, and it doubles as the PASS stamp on verdict receipts.

Source: `components/brand/logomark.tsx`. Variants via props:
- `variant="full"` (default): seal + check + spark. The brand mark.
- `variant="mark"`: seal + check, no spark. Cleanest at favicon sizes.
- `variant="stamp"`: adds the outer "official stamp" ring. Used on the
  `/v/[id]` verdict receipt.
- `mono`: collapse to a single color (favicon, embossing, one-color print).

## 3. Wordmark

"Stuviora" set in Fraunces (the display font, loaded as `--font-display`
in `app/layout.tsx`) with tightened tracking. Source:
`components/brand/wordmark.tsx`. Compose with the mark via
`components/brand/logo-lockup.tsx` (horizontal for headers/footers,
stacked for auth and receipt headers).

Never set the wordmark in Geist or any other face. The serif is the
warmth; the warmth is the differentiation against cold-blue fintech.

## 4. Color

Warm-earth, sourced from tokens in `app/globals.css`. In components, use
the CSS variables; in standalone assets (icons, OG, `public/brand/*.svg`),
use the literal hexes below because those files cannot read tokens.

| Role | Token | Hex |
|---|---|---|
| Seal | `--color-sage` | `#abc270` |
| Check / ink | `--color-brown` | `#473c33` |
| Spark | `--color-orange` | `#fda769` |
| Spark (on dark) | `--color-yellow` | `#fec868` |
| Field / cream | `--color-cream` | `#f8f2e3` |

On a brown surface, the lockup inherits cream (`text-[var(--color-cream)]`)
for the check and word; the seal stays sage; the spark shifts to yellow
via `mark-inverse.svg` for external assets.

## 5. Clear space and minimum size

- **Clear space:** at least half the seal's height on every side. The
  `LogoLockup` bakes this into its gap; do not crowd it manually.
- **Minimum size:** the mark down to 16px (favicon) using `variant="mark"`.
  The full mark with spark down to 24px. The lockup down to 20px word
  height.

## 6. Asset map

| Asset | Path | Use |
|---|---|---|
| Mark (React) | `components/brand/logomark.tsx` | All in-app surfaces. |
| Wordmark (React) | `components/brand/wordmark.tsx` | Standalone word. |
| Lockup (React) | `components/brand/logo-lockup.tsx` | Header, footer, auth. |
| Favicon | `app/icon.svg` | Browser tab. |
| iOS icon | `app/apple-icon.tsx` | Home screen (maskable safe area). |
| PWA manifest | `app/manifest.ts` | Install icons. |
| Social card | `app/opengraph-image.tsx` | Link previews (1200x630). |
| Mark (static) | `public/brand/mark.svg` | Decks, email, partners. |
| Mark mono | `public/brand/mark-mono.svg` | One-color print. |
| Mark inverse | `public/brand/mark-inverse.svg` | Dark backgrounds. |
| Lockup (static) | `public/brand/logo.svg` | Horizontal, external. |
| Lockup stacked | `public/brand/logo-stacked.svg` | Vertical, external. |

## 7. The receipt-stamp pattern

The mark is not just decoration; on a verdict receipt (`/v/[id]`) it is
the trust artifact. Render it with `variant="stamp"` in the receipt
header. As the verification protocol opens up (horizon 3), the same seal
is what external consumers look for to confirm a deliverable cleared the
Stuviora gate. Keep the stamp treatment consistent everywhere a verdict
is shown.

## 8. Do and do not

Do:
- Use the tokens in app code; use the literal hexes only in standalone assets.
- Keep the seal sage and the check high-contrast against its field.
- Use `variant="mark"` when the spark would muddy a tiny rendering.

Do not:
- Recolor the seal outside the palette, or fill it with a gradient.
- Stretch, rotate, or add a drop shadow to the mark.
- Set the wordmark in a non-serif face.
- Use em-dashes or en-dashes anywhere in brand copy (repo-wide rule).
- Re-introduce the old leaf mark; it is retired.
