---
name: SpendScan Design System
colors:
  surface: '#FFFFFF'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#464555'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#585f6c'
  on-secondary: '#ffffff'
  secondary-container: '#dce2f3'
  on-secondary-container: '#5e6572'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dce2f3'
  secondary-fixed-dim: '#c0c7d6'
  on-secondary-fixed: '#151c27'
  on-secondary-fixed-variant: '#404754'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  success: '#10B981'
  danger: '#EF4444'
  text-primary: '#111827'
  border: '#E5E7EB'
typography:
  display-idr:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  financial-mono:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 1rem
  stack-gap: 0.75rem
  card-padding: 1rem
  touch-target-min: 2.75rem
---

## Brand & Style

The brand personality is **utilitarian, professional, and trustworthy**. As a financial tool, the design system prioritizes clarity of data and ease of use for beginners over decorative flourishes. The emotional response should be one of "financial calm"—helping users feel in control of their spending through organized, digestible information.

The chosen design style is **Modern Minimalism**. This approach utilizes heavy whitespace, a disciplined color palette, and a clear typographic hierarchy to reduce cognitive load. Interaction patterns are inspired by modern SaaS and Fintech standards, ensuring a familiar and reliable experience for the user.

## Colors

The palette is anchored by a vibrant **Indigo** primary, which serves as the main interactive signal. The background uses a soft **Light Gray**, creating a subtle contrast with **Pure White** cards and surfaces to establish a clear visual hierarchy.

- **Primary (Indigo):** Reserved for high-intent actions, primary buttons, and active states.
- **Success (Green):** Used for positive income entries or successful OCR processing.
- **Danger (Red):** Dedicated to deletions, errors, or over-budget alerts.
- **Neutral (Gray):** Scaled from dark primary text to soft secondary metadata and borders.

## Typography

This design system utilizes a dual-font strategy. **Manrope** is used for headlines and financial displays to provide a modern, refined character. **Inter** is used for body text and labels to ensure maximum legibility and a neutral, functional feel.

**Financial Formatting:** All IDR amounts should be displayed using the `display-idr` or `financial-mono` tokens. Given the large numbers in Rupiah, slight negative letter spacing is applied to keep currency strings compact and readable. Use standard system weights (Regular 400, Medium 500, Semi-Bold 600) to maintain clarity across various screen densities.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for mobile-first environments. A base 4px/8px scaling system is used to maintain vertical rhythm.

- **Safe Areas:** A consistent 16px (1rem) margin is applied to the left and right of all screens.
- **Card Layouts:** Transactions and summary data are grouped in cards. Cards should have a consistent 12px or 16px internal padding.
- **Touch Targets:** Interactive elements (buttons, list items) must maintain a minimum height of 44px to ensure "beginner-friendly" accessibility.
- **Vertical Spacing:** Use 12px (0.75rem) between list items to allow the background color to act as a natural separator.

## Elevation & Depth

To maintain a clean, flat aesthetic, this design system primarily uses **Tonal Layers** rather than heavy shadows.

- **Surface 0 (Background):** `#F9FAFB` – The lowest level.
- **Surface 1 (Cards):** `#FFFFFF` – Raised slightly via a 1px border (`#E5E7EB`) or an extremely soft, low-opacity ambient shadow (Blur 4px, Y-Offset 2px, 5% Opacity Black).
- **Surface 2 (Modals/Popovers):** Standard white with a more pronounced ambient shadow to indicate focus.

Avoid using heavy drop shadows or glows. Depth is primarily communicated through the contrast between the light gray background and white cards.

## Shapes

The shape language is **Rounded**, conveying an approachable and friendly feel. 

- **Cards & Inputs:** Use the `rounded-lg` (1rem) token to create soft, modern containers.
- **Buttons:** Primary buttons use `rounded-xl` (1.5rem) or fully pill-shaped (3rem) to distinguish them from data containers.
- **Badges:** Category badges use pill-shaping (3rem) to appear as distinct, clickable, or filterable elements.
- **Images:** Receipt previews should use a slightly smaller radius (0.5rem) to maintain their structural integrity while fitting the overall theme.

## Components

- **Buttons:** Primary buttons feature white text on an Indigo background. Secondary buttons use a light gray ghost style with an Indigo border or text.
- **Transaction Cards:** Use a white surface with a 1px border. The left side features a category icon (pill-shaped), the center contains the title and date (using `textSecondary`), and the right side displays the IDR amount in bold.
- **Input Fields:** Clean, outlined boxes with `rounded-lg` corners. Use `textSecondary` for placeholders. The active state should change the border color to Indigo.
- **Category Badges:** Small, pill-shaped components with low-saturation backgrounds derived from the category type, ensuring they don't compete with the primary CTA.
- **OCR Status Indicators:** Use a dedicated "Scanning" state component with a subtle pulse animation and `primary` color accents to indicate progress.
- **Bottom Tabs:** A clean, white bar with Indigo icons for the active state and Gray icons for inactive states, using `label-sm` for clarity.