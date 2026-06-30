# Stuviora brand identity

> The visual identity system. Read this before touching any brand surface
> (logo, icons, social cards, decks). The mark is code-native: it lives in
> `components/brand/`, so the source of truth is the repo, not a design file.
>
> **Last touched:** 2026-06-30.

---

## 1. The idea

Stuviora elevates students. The name carries the concept: **Stu + viora ->
aurora**, the dawn. An aurora is a warm field of light, a radiant aura. That
is exactly what the brand is about: the dawn of a student's career, and the
glow ("aura") around verified student work.

This replaces the earlier "Gate Seal" mark. A badge with a check inside read
as generic verification, like every other trust badge. The Aurora is
ownable, it ties straight to the name, and it stays warm and human rather
than cold and corporate.

## 2. The mark: "The Aurora"

A sunrise of warm light rising over a steady horizon. Bands of sage, gold,
and amber lift off a brown ground line.

| Element | Meaning |
|---|---|
| The rising bands | The dawn of a career; the student's aura. |
| The warm gradient (sage -> gold -> amber) | Light, energy, brilliance emerging. |
| The horizon line | The steady trust anchor the platform provides. |

The bands are analogous warm-earth hues, so they read as one glow, not a
rainbow. On a dark surface the same mark becomes an aurora at night: the warm
bands sit beautifully on brown.

Source: `components/brand/logomark.tsx`. Variants via props:
- `variant="full"` (default): three bands + horizon. The brand mark.
- `variant="mark"`: two bands + horizon. Cleanest at favicon sizes.
- `variant="stamp"`: adds the outer seal ring (a roundel). Used on the
  `/v/[id]` verdict receipt, where the dawn-in-a-circle reads as an official
  seal.
- `mono`: collapse to a single color (favicon, embossing, one-color print).

There is no spark and no enclosing badge. The aura is the whole statement.

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
| Outer band | `--color-sage` | `#abc270` |
| Middle band | `--color-yellow` | `#fec868` |
| Inner band / core | `--color-orange` | `#fda769` |
| Horizon / ink | `--color-brown` | `#473c33` |
| Field / cream | `--color-cream` | `#f8f2e3` |

The horizon follows `currentColor`, so on a brown surface it inherits cream
(`text-[var(--color-cream)]`) while the warm bands stay put. The
`mark-inverse.svg` static asset bakes the cream horizon for external use on
dark backgrounds.

## 5. Clear space and minimum size

- **Clear space:** at least half the mark's height on every side. The
  `LogoLockup` bakes this into its gap; do not crowd it manually.
- **Minimum size:** the mark down to 16px (favicon) using `variant="mark"`.
  The full three-band mark down to 24px. The lockup down to 20px word
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

On a verdict receipt (`/v/[id]`) the mark is the trust artifact, not just
decoration. Render it with `variant="stamp"` in the receipt header: the
dawn sits inside a thin roundel and reads as an official seal. As the
verification protocol opens up (horizon 3), the same mark is what external
consumers look for to confirm a deliverable cleared the Stuviora gate. Keep
the stamp treatment consistent everywhere a verdict is shown.

## 8. Do and do not

Do:
- Use the tokens in app code; use the literal hexes only in standalone assets.
- Keep the bands in the warm-earth order (sage, gold, amber) so they read as
  one glow.
- Use `variant="mark"` when the third band would muddy a tiny rendering.

Do not:
- Recolor the bands outside the palette, or turn them into a full-spectrum
  rainbow.
- Add a badge, ring, or box around the mark except the receipt `stamp` ring.
- Stretch, rotate, or add a drop shadow to the mark.
- Set the wordmark in a non-serif face.
- Use em-dashes or en-dashes anywhere in brand copy (repo-wide rule).
- Re-introduce the old Gate Seal or leaf marks; both are retired.
