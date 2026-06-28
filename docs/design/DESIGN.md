# Design Direction

## Source

Based on the attached Figma design analysis:

- version: alpha
- name: Figma-design-analysis

## Direction

Confident black-and-white editorial UI interrupted by oversized pastel color blocks.

The interface should feel:
- technical
- joyful
- clear
- serious enough for repeated work
- colorful without becoming noisy

## Visual Principles

| Principle | Application |
| --- | --- |
| Monochrome foundation | Use white surfaces and black ink as the default structure. |
| Pastel interruptions | Use lime, lilac, cream, pink, mint, coral, or navy blocks for status and emphasis. |
| Editorial scale | Use large, confident headings for the main product frame. |
| Work surface clarity | Keep editor controls readable, direct, and low-friction. |
| Adapter-friendly UI | Design must not couple product state to renderer-specific objects. |

## Color Tokens

| Token | Value |
| --- | --- |
| ink | `#000000` |
| canvas | `#ffffff` |
| inverse-canvas | `#000000` |
| inverse-ink | `#ffffff` |
| hairline | `#e6e6e6` |
| surface-soft | `#f7f7f5` |
| block-lime | `#dceeb1` |
| block-lilac | `#c5b0f4` |
| block-cream | `#f4ecd6` |
| block-pink | `#efd4d4` |
| block-mint | `#c8e6cd` |
| block-coral | `#f3c9b6` |
| block-navy | `#1f1d3d` |
| accent-magenta | `#ff3d8b` |
| semantic-success | `#1ea64a` |

## Component Notes

- Primary actions use black pill buttons with white text.
- Secondary controls use white surfaces, black text, and black or soft hairline borders.
- Status panels may use pastel blocks.
- Editor panels should stay readable before decorative.
- Avoid implementing Figma, Pixi, or export behavior just to satisfy visual direction.
