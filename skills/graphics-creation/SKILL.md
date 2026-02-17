---
name: graphics-creation
description: Create production-ready social graphics and image prompts using a premium, clean, cinematic style system with accessibility, composition, and platform constraints. Use when generating carousel visuals, image prompts, or design specs for Instagram-style multi-slide content.
---

# Graphics Creation

Follow this workflow for every carousel request:

1. Read required inputs: `business_type`, `service`, `bucket`, `num_slides` (plus optional `city`, `tone`).
2. Build a visual system first: canvas, aspect ratio, safe zone, palette direction, typography direction.
3. Map each slide to a visual phase: `hook`, `problem`, `pain`, `insight`, `solution`, `cta`.
4. For every slide, produce one focal concept with clear hierarchy and high contrast.
5. Generate image prompts using this sequence:
   `subject -> setting -> composition -> lighting -> color_direction -> camera_detail -> mood -> constraints`.
6. Keep constraints explicit: no gibberish text, no watermark, no random logos.
7. Return structured JSON the UI can render directly.

Use these standards and references:

- Contrast: WCAG minimum targets (4.5:1 normal text, 3:1 large text)
- Hierarchy and relationships: NN/g visual design principles
- Mobile readability: short line lengths and concise overlays
- Prompt structure: OpenAI cookbook image generation pattern
- Instagram media constraints: see `references/best-practices.md`
