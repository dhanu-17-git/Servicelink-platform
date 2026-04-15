# Design System Specification: The Fluid Marketplace

## 1. Overview & Creative North Star
### The Creative North Star: "The Digital Concierge"
This design system moves away from the "industrial" feel of traditional rental platforms and toward a high-end editorial experience. We are building "The Digital Concierge"—a system that feels as reliable as a high-tech tool and as seamless as a luxury hospitality service.

To break the "template" look common in SaaS, we utilize **intentional asymmetry**, **exaggerated whitespace**, and **layered translucency**. We do not use rigid borders to define space; we use light and depth. The layout should feel like it is "breathing," with large typographic headers and overlapping elements that suggest a sophisticated, non-linear flow.

---

## 2. Colors & Surface Logic
The palette is rooted in `Primary Trust Blue` for authority and `Action Orange` for momentum. However, the secret to the premium feel lies in the "in-between" tones.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning. 
Boundaries must be defined solely through background color shifts or tonal transitions. Use `surface-container-low` for secondary sections and `surface` for the main canvas. A section change is a color change, not a line.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of frosted glass.
*   **Base:** `surface` (#faf8ff)
*   **Nesting:** Place a `surface-container-lowest` card on top of a `surface-container-low` section to create natural, soft lift.
*   **The Glass Rule:** For floating navigation or modal overlays, use `surface` at 70% opacity with a `backdrop-filter: blur(20px)`. This creates the "signature" high-tech look by allowing content to bleed through the UI subtly.

### Signature Textures
Main CTAs and Hero sections should not be flat. Use a subtle linear gradient: 
`primary` (#003594) → `primary_container` (#004ac6) at a 135-degree angle. This adds "visual soul" and depth that differentiates us from entry-level SaaS products.

---

## 3. Typography
We use a dual-typeface system to balance professional authority with modern accessibility.

| Category | Typeface | Token | Size | Character |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | Manrope | `display-lg` | 3.5rem | Bold, editorial, asymmetric placement. |
| **Headline** | Manrope | `headline-md` | 1.75rem | High-contrast, authoritative. |
| **Title** | Inter | `title-lg` | 1.375rem | Accessible, functional. |
| **Body** | Inter | `body-lg` | 1rem | Clean, generous leading for readability. |
| **Label** | Inter | `label-md` | 0.75rem | All-caps for utility markers. |

**The Editorial Rule:** Headlines should often be paired with large "Body-LG" subtext to create a hierarchy that feels like a premium magazine rather than a dashboard.

---

## 4. Elevation & Depth
We achieve hierarchy through **Tonal Layering** rather than traditional structural lines.

*   **The Layering Principle:** Stack tiers. If the background is `surface_container`, the card on top must be `surface_container_lowest`.
*   **Ambient Shadows:** For high-elevation elements (like a tool booking card), use a shadow with a blur radius of `40px` and an opacity of `6%`. The shadow color must be a tinted version of `on_surface` (#131b2e), never pure black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-density data tables), use `outline_variant` at **15% opacity**. It should be felt, not seen.
*   **Rounding Scale:** 
    *   `Default`: 1rem (Buttons/Inputs)
    *   `Large`: 2rem (Cards/Sections)
    *   `XL`: 3rem (Hero Containers/Image Wrappers)

---

## 5. Components

### Buttons & Interaction
*   **Primary:** Gradient of `primary` to `primary_container`. High-contrast `on_primary` text. Radius: `full`.
*   **Secondary:** Ghost style. No background, `outline` at 20% opacity. Radius: `full`.
*   **Action Orange:** Reserved strictly for "High-Intent" actions (e.g., "Confirm Rental," "Instant Book").

### Input Fields
*   No borders. Use `surface_container_high` as the background. 
*   On focus, transition the background to `surface_container_lowest` and add a subtle 2px glow of `primary_fixed`.

### Cards (The "ServiceLink" Card)
*   Forbid divider lines. Separate the "Tool Image" from "Tool Details" using a `0.5rem` vertical gap and a shift in typography weight. 
*   Apply a `lg` (2rem) corner radius to the image and a `md` (1.5rem) radius to the card container.

### Marketplace-Specific Components
*   **The "Availability" Chip:** Use a `glassmorphism` effect (blur + transparent white) positioned over the tool image to indicate real-time status without cluttering the metadata area.
*   **Trust Badge:** A small, floating `surface_container_highest` element with a `Wrench + Link` icon to certify professional-grade tools.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. A tool description can sit 40px higher than its neighboring image to create an editorial feel.
*   **Do** use "Breathing Room." If you think there is enough whitespace, add 16px more.
*   **Do** use backdrop blurs on any element that scrolls over content.

### Don’t:
*   **Don’t** use pure black (#000) for text. Use `on_surface` (#131b2e) for a softer, premium look.
*   **Don’t** use 1px solid dividers. Use a change in background color or a `24px` gap.
*   **Don’t** use small corner radii. Small radii look "legacy." Our brand is friendly and high-tech; use `1rem` minimum.
*   **Don’t** clutter. If a piece of information isn't vital to the "Rental Flow," hide it behind a progressive disclosure (tooltip or "View More").