---
name: taste
description: >-
  Enforces high-craft UI/UX standards, modern aesthetic principles, anti-slop design guidelines,
  typography pairings, dark mode tokens, micro-interactions, and visual hierarchy for web applications.
---

# UI Design & Aesthetic Taste Skill

This skill provides comprehensive rules, guidelines, and quality standards for designing state-of-the-art, high-craft web applications with human-level design judgment ("taste").

---

## 1. Core Principles of UI Taste

1. **Anti-Slop & Bespoke Aesthetics**:
   - Avoid generic, unstyled SaaS template visuals.
   - Use curated color palettes (e.g. Slate/Dark `#0B0F17`, Emerald `#10B981`, Cyan `#06B6D4`, Rose `#F43F5E`) with HSL or hex CSS variables rather than raw, uncalibrated defaults.
   - Enforce distinct light and dark mode pairings for every element (`dark:bg-slate-900`, `dark:text-white`, `dark:border-slate-800`).

2. **Typography & Font Pairing**:
   - **Headings**: Use high-character display fonts (e.g. *Plus Jakarta Sans*, *Outfit*, or *Syne*) with tight tracking (`tracking-tight` / `-0.025em`).
   - **Body Text**: Use crisp workhorse sans-serif fonts (e.g. *Inter* or *Geist*) for maximum legibility.
   - **Data & Readouts**: Use monospace fonts (e.g. *JetBrains Mono* or *Fira Code*) for numbers, file sizes, dimensions, timestamps, and technical metrics.

3. **Intentional Hierarchy & Spacing**:
   - Establish clear visual weight: Primary actions get strong solid surfaces; secondary actions get subtle ghost borders.
   - Vary corner radii purposefully: Sharper 8px (`rounded-lg`) for data lists & readouts, softer 16-24px (`rounded-2xl` / `rounded-3xl`) for main workspace containers and hero cards.

4. **Micro-Interactions & Polish**:
   - Apply smooth transitions on all interactive elements (`transition-all duration-200 ease-out`).
   - Provide tactile hover, focus, and active feedback states (`hover:bg-slate-800 active:scale-[0.98]`).
   - Use subtle live indicators (e.g., pulsing status dots, real-time telemetry counters) to make the UI feel alive and responsive.

5. **Signature Tangible Moments**:
   - Include at least one memorable signature visual element that reflects the application's unique value proposition (e.g. a live "Local Sandbox Telemetry" monitor showing client-side RAM and zero-network transfer stats).

---

## 2. Design System Guidelines for Codebases

- **Tailwind v4 / CSS Custom Properties**: Define CSS tokens for brand colors and fonts in `@theme` / `index.css`.
- **Component Shell Pattern**: Wrap workspaces in a consistent `ToolPageShell` layout containing standard headers, category badges, and workspace cards.
- **Accessibility & Contrast**: Ensure text contrast meets WCAG AA standards in both light and dark themes.
