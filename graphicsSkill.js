const GRAPHICS_CREATION_SOURCES = [
  {
    label: "WCAG contrast minimum",
    url: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html",
    note: "Text contrast targets: 4.5:1 normal text, 3:1 large text.",
  },
  {
    label: "Nielsen Norman Group visual design principles",
    url: "https://www.nngroup.com/reports/visual-design/",
    note: "Emphasize hierarchy, relationships, and clear visual flow.",
  },
  {
    label: "Baymard line length readability",
    url: "https://baymard.com/blog/line-length-readability",
    note: "Shorter line lengths improve readability and comprehension.",
  },
  {
    label: "OpenAI cookbook image generation prompting",
    url: "https://cookbook.openai.com/examples/generate_images_with_gpt_image",
    note: "Use structured prompt components for reliable image quality.",
  },
  {
    label: "Meta Instagram API media specs reference (quoted)",
    url: "https://ppc.land/meta-updates-instagram-marketing-api-with-new-carousel-video-and-instagram-user-data-fields/",
    note: "Summarizes IG media specs, including accepted aspect ranges.",
  },
];

const GRAPHICS_CREATION_SKILL = {
  id: "instagram-carousel-graphics-v1",
  name: "Instagram Carousel Graphic Creation Skill",
  updated_on: "2026-02-15",
  style_direction: ["premium", "clean", "cinematic"],
  platform_specs: {
    recommended_canvas: "1080x1350",
    recommended_aspect_ratio: "4:5",
    accepted_aspect_ratio_range: "1.91:1 to 4:5",
    suggested_safe_zone: "Keep critical text and logos inside inner 80%.",
  },
  typography_rules: [
    "Use one primary type family and one accent style at most.",
    "Keep visual hierarchy clear: headline > supporting text > microcopy.",
    "Prefer short lines for overlay text to improve mobile readability.",
  ],
  composition_rules: [
    "Use one focal subject per slide to reduce cognitive load.",
    "Anchor subject on thirds and leave negative space for text overlays.",
    "Maintain consistent camera language across all slides.",
  ],
  accessibility_rules: [
    "Target contrast ratio >= 4.5:1 for normal text overlays.",
    "For large display text, maintain contrast ratio >= 3:1.",
    "Avoid placing text on noisy regions; use subtle gradient backplates.",
  ],
  image_prompt_framework: {
    required_components: [
      "subject",
      "setting",
      "composition",
      "lighting",
      "color_direction",
      "camera_detail",
      "mood",
      "constraints",
    ],
    constraints: [
      "no gibberish text",
      "no watermark",
      "no logos unless provided by brand",
    ],
  },
  slide_framework: [
    { phase: "hook", visual_goal: "Pattern interrupt and immediate clarity." },
    { phase: "problem", visual_goal: "Show friction and missed opportunity." },
    { phase: "pain", visual_goal: "Increase urgency with concrete consequences." },
    { phase: "insight", visual_goal: "Create aha-moment through contrast or reveal." },
    { phase: "solution", visual_goal: "Present service as clear transformation." },
    { phase: "cta", visual_goal: "Direct action with strong focal path." },
  ],
  sources: GRAPHICS_CREATION_SOURCES,
};

function buildGraphicsSkillPromptBlock() {
  return `Graphics Skill:
${JSON.stringify(GRAPHICS_CREATION_SKILL, null, 2)}

Graphic Build Instructions:
- Apply this skill to all slide visuals.
- Keep brand direction premium, clean, cinematic.
- For each slide, keep one primary focal subject and clear depth.
- Build image_prompt with this sequence:
  subject -> setting -> composition -> lighting -> color_direction -> camera_detail -> mood -> constraints.
- Mention business_type and service context in each image_prompt.
- Keep typography guidance practical for mobile overlays (safe zone, contrast, line length).`;
}

function buildDefaultGraphicSystem(input) {
  const tone = input.tone || "premium";
  return {
    skill_id: GRAPHICS_CREATION_SKILL.id,
    canvas: GRAPHICS_CREATION_SKILL.platform_specs.recommended_canvas,
    aspect_ratio: GRAPHICS_CREATION_SKILL.platform_specs.recommended_aspect_ratio,
    safe_zone: GRAPHICS_CREATION_SKILL.platform_specs.suggested_safe_zone,
    tone,
    color_direction: "warm neutrals with deep contrast accents",
    typography: "high-contrast modern serif headline + clean sans support",
    motion_feel: "still image with implied cinematic movement",
  };
}

module.exports = {
  GRAPHICS_CREATION_SOURCES,
  GRAPHICS_CREATION_SKILL,
  buildGraphicsSkillPromptBlock,
  buildDefaultGraphicSystem,
};
