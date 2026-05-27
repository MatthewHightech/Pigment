# Design System: Studio Chic Editorial

## 1. Overview & Creative North Star

### Creative North Star: The Digital Curator
This design system is envisioned as an extension of the artist's physical studio—an environment that is clean, high-end, and deeply tactile. We are moving away from the "disposable tech" aesthetic toward a "Digital Curator" philosophy. This means every pixel must feel intentional, every transition must feel fluid, and the UI must step back to let the artist's work take center stage.

We break the standard grid-based template through **intentional asymmetry** and **tonal depth**. By utilizing irregular organic radiuses and varying typographic scales, we create an editorial experience that feels more like a premium art monograph than a utility app. The interface doesn't just house data; it frames inspiration.

---

## 2. Colors

The palette is rooted in the physical materials of the craft: raw canvas, charcoal, and earth pigments.

### The Palette (Material Design Tokens)
*   **Background / Surface:** `#FBF9F4` (The Off-White Canvas)
*   **On-Surface / Text:** `#1B1C19` (Deep Charcoal)
*   **Primary (Accent):** `#823B18` (Burnt Sienna)
*   **Secondary:** `#904D00` (Raw Ochre)
*   **Surface Containers:** Ranging from `#F5F3EE` (Low) to `#E4E2DD` (Highest)

### Signature Color Rules
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. For example, a project gallery section using `surface-container-low` should sit directly against a `surface` background to define its area.
*   **Surface Hierarchy & Nesting:** Treat the UI as stacked sheets of fine paper. Use the `surface-container` tiers to create depth. An inner "Color Mix" module should use a slightly higher tier (e.g., `surface-container-high`) than its parent container to signify importance and physical "lift."
*   **The "Glass & Gradient" Rule:** Floating action elements or overlays should utilize Glassmorphism. Use semi-transparent surface colors with a `backdrop-filter: blur(20px)` to maintain a light, airy feel.
*   **Signature Textures:** For primary CTAs and hero states, use a subtle linear gradient transitioning from `primary` (`#823B18`) to `primary-container` (`#A0522D`). This adds a "hand-mixed" quality to the digital color.

---

## 3. Typography

The typographic system relies on the interplay between a sophisticated, high-contrast Serif and a functional, geometric Sans-Serif.

*   **Display & Headlines (Newsreader):** Used for project titles and brand moments. The serif evokes the feeling of a gallery wall or a classic art publication. It conveys authority and history.
*   **Body & UI Elements (Manrope):** Used for all functional data, labels, and instructional text. This provides a clean, modern counterpoint to the serif, ensuring maximum legibility during the creative process.

**Hierarchy Strategy:** 
Large `display-lg` titles should be used with generous leading and wide margins to create an editorial "breathing room." Labels (`label-md`) should be set in uppercase with a slight letter-spacing (+0.05rem) to elevate them from standard text to "curatorial notes."

---

## 4. Elevation & Depth

We eschew traditional "drop shadows" in favor of **Tonal Layering** and **Ambient Light**.

*   **The Layering Principle:** Use the `surface-container-lowest` (`#FFFFFF`) to create cards that appear to "pop" off the `surface-container-low` background. The eye perceives the color shift as a change in elevation without the need for heavy shadows.
*   **Ambient Shadows:** Where floating elements (like the "Add" button or Modal) require a shadow, use a hyper-diffused approach:
    *   *Blur:* 40px - 60px.
    *   *Opacity:* 4% - 8%.
    *   *Color:* Use a tinted version of `on-surface` (charcoal) rather than pure black.
*   **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use the `outline-variant` token at **15% opacity**. High-contrast, 100% opaque borders are forbidden.
*   **Irregular Radiuses:** To reinforce the "Studio Chic" look, use `md` (0.75rem) and `lg` (1rem) radiuses, but consider subtle 2px variations on corners to mimic the organic feel of hand-cut paper or canvas.

---

## 5. Components

### Buttons
*   **Primary:** Filled with the `primary` sienna. Roundedness set to `full`. Text is `on-primary` (white).
*   **Secondary:** `surface-container-highest` background with `on-surface` text. For an "artsy" touch, use a slightly irregular organic radius.
*   **Tertiary:** Text-only, using `primary` color. No background or border.

### Cards & Lists
*   **Project Cards:** Forbid divider lines. Use `spacing-6` (2rem) of vertical whitespace to separate items. The card should use a subtle `surface-container-low` background to frame the artwork.
*   **Color Swatches:** Circular or "blob" shapes with a `ghost-border` to separate light colors from the background.

### Input Fields
*   **Text Inputs:** No bottom line or box. Use a soft `surface-container-low` background with an `md` radius. Labels are always `label-md` uppercase, positioned above the field.

### Specialized Utility Components
*   **The "Mixing Palette" Modal:** Uses a `surface-container-lowest` base with a 20% `backdrop-blur` behind it. This allows the artist to see their reference image softly through the mixing UI.
*   **Floating "Add" Button:** A signature `primary` circle. Use an ambient shadow to make it feel like a physical tool resting on the canvas.

---

## 6. Do's and Don'ts

### Do
*   **Do** use extreme whitespace (`spacing-16` or `20`) for top-level headers.
*   **Do** let photos bleed to the edges of containers to emphasize the "canvas" feel.
*   **Do** use asymmetrical layouts (e.g., a title left-aligned with a description tucked far to the right) to create visual interest.
*   **Do** use tonal shifts (Surface to Surface-Low) for all sectioning.

### Don't
*   **Don't** use 1px solid black or grey borders.
*   **Don't** use standard "blue" for links; use the sienna or ochre accent colors.
*   **Don't** crowd the interface. If a screen feels busy, increase the spacing scale values.
*   **Don't** use pure black (`#000000`) for text; always use the deep charcoal `on-surface` token to maintain a softer, more "ink-on-paper" look.