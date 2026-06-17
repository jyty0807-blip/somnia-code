# SOMNIA — Brand Project

A premium **sleep lifestyle** brand system: a bilingual (KR/EN) landing site, a mobile app
prototype, product detail pages, marketing assets, packaging mockups, and the editing studios
that produce them — all sharing one design-token source of truth.

> **Sleep Deeper, Live Better.**

**Start here → [`index.html`](index.html)** — the project index links every page, tool, and asset.

---

## Design System (single source of truth)

All color and type live in **[`assets/tokens.css`](assets/tokens.css)**. Every stylesheet imports it
and derives its local names from these variables — change a brand value here and it propagates
everywhere.

### Color

| Token | Value | Use |
|-------|-------|-----|
| `--somnia-ink` | `#0E1A3A` | Deepest navy — dark sections, headings |
| `--somnia-ocean` | `#1958B2` | Primary blue — accents, buttons, links |
| `--somnia-plum` | `#4B2E83` | Secondary accent |
| `--somnia-lavender` | `#B8A7E6` | Soft accent |
| `--somnia-mist` | `#D0E6FA` | Pastel blue — light surfaces |
| `--somnia-ivory` | `#F6F2EA` | Warm light surface |
| `--somnia-text` | `#10182e` | Body ink |

> ⚠️ Historical note: an earlier teal `#195B82` had been used on the landing/product pages — one
> transposed digit away from the intended ocean `#1958B2`. The palette is now unified to the
> deep-navy + ocean + plum/lavender family across all files.

### Typography → [`SOMNIA Type System.html`](SOMNIA%20Type%20System.html)

- **Outfit** — Latin, numerals, headings, overlines (300–700)
- **Pretendard** — Korean body and headings (300–700)
- Weights, a fluid type scale (`--fs-display` → `--fs-eyebrow`), line-heights, and tracking are all
  tokens in `tokens.css`. The Type System page is the visual spec + pairing rules
  (e.g. Korean copy steps one weight lighter than English at the same size).

---

## What's in the project

### 01 · Brand
| File | What |
|------|------|
| `SOMNIA.html` | Bilingual landing page (+ `SOMNIA-print.html`) |
| `SOMNIA App.html` | Sleep & Shop mobile app prototype (+ `SOMNIA App-print.html`) |

### 02 · Product Detail Pages
| File | What |
|------|------|
| `SOMNIA Product.html` | Dream Jelly — Melatonin Sleep Jelly (flagship PDP) |
| `SOMNIA Aroma Duo.html` | Aroma Therapy Duo — Lavender Oil + Pillow Spray |
| `SOMNIA Sleep Gear Duo.html` | Sleep Gear Duo — Pajama Set + Silk Eye Mask |

### 03 · Detail Studios (editing tools — 1000px strip, PNG export)
| File | What |
|------|------|
| `SOMNIA Detail Studio.html` | Dream Jelly detail-page editor |
| `SOMNIA Detail Studio - Aroma.html` | Oil & room-spray editor (scent notes, font-color toggle) |
| `SOMNIA Detail Studio - Sleepwear.html` | Sleepwear collection editor (same format as Aroma) |

### 04 · Marketing
| File | What |
|------|------|
| `SOMNIA Card News.html` | Sleep campaign card news, 1080×1080 ×6 (+ `…-print.html`) |
| `SOMNIA Card Export.html` | Canvas-native PNG exporter for the card news |
| `SOMNIA Brochure.html` | Bi-fold print brochure (4 panels, bleed/safe area) |
| `SOMNIA Brochure Studio.html` | Brochure editing tool |

### 05 · Packaging & Mockups
| File | What |
|------|------|
| `SOMNIA Jelly Mockup.html` | Dream Jelly — Moon Berry package mockup |
| `SOMNIA Label Studio.html` | Dream Jelly label artwork editor |

### 06 · System
| File | What |
|------|------|
| `index.html` | Project index / hub — links everything |
| `SOMNIA Type System.html` | Typography spec |
| `assets/tokens.css` | Canonical color + type tokens |

---

## Asset structure

```
assets/
├── tokens.css              # ← canonical color + type (imported everywhere)
├── somnia.css / somnia.js  # landing
├── product.css / product.js + *-tweaks.jsx  # PDPs + duos
├── app/                    # app prototype (React/JSX, i18n, screens)
├── aroma-detail/           # Aroma detail studio
├── sleepwear-detail/       # Sleepwear detail studio
├── detail/                 # Dream Jelly detail studio
├── cards/                  # card news
├── brochure/ , mockup/     # brochure + label/package studios
├── image-slot.js           # <image-slot> user-fillable image component
└── logo / symbol / wordmark assets
```

---

## Run locally

Fully static — no build step.

```bash
python3 -m http.server 3000   # then open http://localhost:3000/index.html
```

> Open via a local server (not `file://`) so fonts, `@import`ed tokens, and the `<image-slot>`
> component load correctly.

---

## Image slots

Product and lifestyle imagery use the `<image-slot>` web component — drag an image onto a slot and
it persists to a `.image-slots.state.json` sidecar. On a plain static host, slots render their
placeholder captions; replace with real `<img>`/`src` for fixed imagery.

---

© SOMNIA. All rights reserved. — *Sleep Deeper, Live Better*
