---
name: Vibrant Student Gastronomy
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#594136'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#8d7164'
  outline-variant: '#e2bfb0'
  surface-tint: '#9f4200'
  primary: '#9f4200'
  on-primary: '#ffffff'
  primary-container: '#ff6d00'
  on-primary-container: '#582100'
  inverse-primary: '#ffb692'
  secondary: '#7e5700'
  on-secondary: '#ffffff'
  secondary-container: '#feb300'
  on-secondary-container: '#6a4800'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#00af79'
  on-tertiary-container: '#003a25'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcb'
  primary-fixed-dim: '#ffb692'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#ffdeac'
  secondary-fixed-dim: '#ffba38'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#604100'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1.25rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

The brand targets dynamic, fast-paced college students who demand speed, clarity, and delight on a budget. The UI evokes energetic hunger, approachability, and spontaneous community living—transitioning effortlessly between midday campus study sessions and midnight dorm cravings.

The design style merges **Modern Tactile App UI** with **High-Contrast Warmth**. Clean, hyper-readable geometric structures are softened through oversized border radii, playful pill-shaped indicators, and tactile micro-elevations that feel responsive, clicky, and physical under thumb interaction. Surfaces stay crisp and airy, while vibrant culinary accents inject warmth, movement, and appetite appeal without clutter.

## Colors

- **Primary (`#FF6D00` Tangerine Flash):** Drives primary actions, order workflows, active states, and core branding hooks.
- **Secondary (`#FFB300` Warm Sunburst):** Reserved for star ratings, loyalty streaks, featured meal highlights, and warm secondary banners.
- **Tertiary (`#10B981` Mint Value):** Signals monetary perks, split-bill confirmations, dorm savings, and 'Dining Dollars' badges.
- **Neutral Dark (`#0F172A` Deep Navy Slate):** Anchors high-contrast typography, icons, navigation anchors, and bottom sheets.
- **Surface & Canvas:** Base background is `#F8F9FA` to prevent screen glare during night studies, with pure `#FFFFFF` dedicated to floating meal cards, sheets, and active interactive modules. Subtle slate tints (`#E2E8F0` and `#F1F5F9`) handle dividers and inactive borders.

## Typography

The type system blends the energetic curves of **Plus Jakarta Sans** for titles, banners, and merchant names with the crisp, geometric precision of **Inter** for compact chips, pricing totals, and delivery timers. 

- Use `display-lg` and `headline-xl` sparingly for promotional splash screens and hungry hero statements.
- Apply tight negative tracking to all `headline-*` styles to create a contemporary, punchy editorial presence.
- Keep `label-*` uppercase or small-caps for utility markers (`Under $10`, `Dining Dollars`) to maximize readability at glance-level distances on handheld viewports.

## Layout & Spacing

A mobile-first fluid layout based on an 8pt spatial grid anchors the app:
- **Mobile Viewports (<640px):** Single-column fluid feed with `margin-mobile` (16px) side padding, horizontal scrolling carousels for fast discovery, and edge-pinned sticky order docks.
- **Tablet & Split-Screen (640px - 1024px):** 6-column fluid grid using a 24px gutter, splitting meal selection and live campus tracking into dual viewports.
- **Vertical Rhythm:** Content cards stack with `space-md` (16px) separation; sub-elements inside cards (title, dietary icons, ETA) separate cleanly with `space-xs` (4px) to `space-sm` (8px) for tight information grouping.

## Elevation & Depth

Visual hierarchy uses **warm ambient shadows** layered atop crisp white surfaces:
- **Canvas (`#F8F9FA`):** Recessed ground plane for screen backgrounds.
- **Level 1 (Feed & Food Cards):** Soft, warm ambient drop shadow tinted with deep slate (`0 4px 16px -2px rgba(15, 23, 42, 0.06)`). Gives cards separation without heavy outlines.
- **Level 2 (Active Modals, Sheets, Sticky Cart Pill):** Floating elements use an elevated warm shadow (`0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(255, 109, 0, 0.08)`).
- **Interactive State (Pressed/Tapped):** Buttons and cards depress by 1px with reduced shadow blur (`0 2px 6px rgba(15, 23, 42, 0.08)`), imparting a springy, tactile physical feedback.

## Shapes

The interface embraces organic friendliness:
- **Food & Restaurant Containers:** Use extra-large corner radii (`rounded-2xl` to `rounded-3xl` / 1.5rem to 2rem) to make visual packaging soft and welcoming.
- **Interactive Buttons & Badges:** Utilize full pill radiuses (`rounded-full` / 9999px) for search bars, promo tags, filter chips, and primary CTAs.
- **Inner Thumbnails & Images:** Nested meal photos take an internal curvature matching `rounded-xl` (1rem) to create rhythmic curvature consistency.

## Components

- **Primary Action Buttons:** Full-pill containers dressed in Tangerine (`#FF6D00`) with bold white text. Micro-interactions include a subtle tactile scale-down (0.97x) on press with a glowing accent ring on focus.
- **Delivery & Savings Chips:** Pill-shaped tags with dynamic thematic tints:
  - *Value/Discount:* Soft mint tint (`#ECFDF5`) with bold green text (`#047857`) and green icons.
  - *Campus Attribute ('Dorm Dropoff', 'Dining Dollars'):* Slate ice tint (`#F1F5F9`) with Navy text (`#0F172A`).
  - *Hot / Popular:* Light tangerine blush (`#FFF7ED`) with vibrant orange text (`#EA580C`).
- **Restaurant & Menu Cards:** Elevated pure white surface tiles with full-bleed top imagery, badge pills floating at `top-3 left-3`, live delivery ETA stickers in pure slate navy, and prominent pricing/add controls.
- **Checkboxes & Customization Toggles:** High-radii circular radio-style checkboxes that pop to electric tangerine on selection, with spring-animated checkmarks for diet preferences and meal add-ons.
- **Input Fields:** Search and dorm delivery location bars styled as full pills with subtle inner slate borders (`#E2E8F0`), high-contrast slate text, and instant-clear tactile icon triggers.
- **Campus Tracker (Dorm Drop Indicator):** Multi-stage horizontal stepper using lively tangerine and mint progress tracks, featuring custom dorm icons and live ETA updates.