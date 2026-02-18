const {
  GRAPHICS_CREATION_SKILL,
  buildGraphicsSkillPromptBlock,
  buildDefaultGraphicSystem,
} = require("./graphicsSkill");

// 1) JSON INPUT SCHEMA
const CAROUSEL_INPUT_SCHEMA = {
  title: "Carousel Request",
  type: "object",
  properties: {
    business_type: { type: "string" },
    city: { type: "string" },
    service: { type: "string" },
    tone: { type: "string" },
    bucket: { type: "string" },
    num_slides: { type: "integer", minimum: 4, maximum: 10 },
  },
  required: ["business_type", "service", "bucket", "num_slides"],
};

const SYSTEM_PROMPT =
  "You are a helpful assistant that produces structured JSON for UI consumption.";

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5.1";

// 2) GENERATION PROMPT TEMPLATE
const CAROUSEL_PROMPT_TEMPLATE = `You are an AI tasked with generating Instagram carousel content.

Input JSON:
{{input}}

Output JSON:
{
  "graphic_system": {
    "skill_id": "",
    "canvas": "",
    "aspect_ratio": "",
    "safe_zone": "",
    "tone": "",
    "color_direction": "",
    "typography": "",
    "motion_feel": ""
  },
  "slides": [
    {
      "position": 1,
      "headline": "",
      "body": "",
      "image_prompt": "",
      "design_notes": ""
    }
  ],
  "caption": "",
  "hashtags": []
}

{{graphics_skill}}

Rules:
1. Use a 6-slide structure: hook, problem, pain, insight, solution, CTA.
2. Headlines must be bold and concise.
3. Slide bodies must explain the idea in one sentence max.
4. \`image_prompt\` must be a description for an AI image generator for the slide visuals and follow the graphic build sequence.
5. \`caption\` must include a hook, 2–3 supporting sentences, CTA.
6. Hashtags should include 3 niche + 2 broad.
7. Use brand style: premium, clean, cinematic.
8. Business_type and service must be referenced in slides and caption.
9. Return exactly \`num_slides\` slides, with ascending \`position\` starting at 1.
10. Keep \`design_notes\` concise and practical for production designers.

Generate the JSON.`;

function buildCarouselPrompt(input) {
  return CAROUSEL_PROMPT_TEMPLATE.replace(
    "{{input}}",
    JSON.stringify(input, null, 2)
  ).replace("{{graphics_skill}}", buildGraphicsSkillPromptBlock());
}

function validateInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Input must be an object.");
  }

  const required = CAROUSEL_INPUT_SCHEMA.required;
  for (const key of required) {
    if (!(key in input)) {
      throw new Error(`Missing required field: ${key}`);
    }
  }

  for (const key of ["business_type", "service", "bucket"]) {
    if (typeof input[key] !== "string" || input[key].trim().length === 0) {
      throw new Error(`${key} must be a non-empty string.`);
    }
  }

  for (const key of ["city", "tone"]) {
    if (key in input && input[key] != null && typeof input[key] !== "string") {
      throw new Error(`${key} must be a string when provided.`);
    }
  }

  if (
    !Number.isInteger(input.num_slides) ||
    input.num_slides < 4 ||
    input.num_slides > 10
  ) {
    throw new Error("num_slides must be an integer between 4 and 10.");
  }
}

function extractJsonString(rawContent) {
  if (typeof rawContent !== "string") {
    throw new Error("Model did not return text content.");
  }

  const fenced = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1].trim();
  }

  return rawContent.trim();
}

function toTag(value) {
  const safe = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  return safe ? `#${safe}` : "#marketing";
}

function buildMockCarousel(input) {
  const style = input.tone || "premium";
  const cityLine = input.city ? ` in ${input.city}` : "";
  const phases = ["hook", "problem", "pain", "insight", "solution", "cta"];
  const graphicSystem = buildDefaultGraphicSystem(input);
  const slides = [];

  for (let i = 0; i < input.num_slides; i += 1) {
    const phase = phases[i] || `extra_${i + 1}`;
    const phaseHeadline = phase.toUpperCase();

    slides.push({
      position: i + 1,
      headline: `**${phaseHeadline}: ${input.service} for ${input.business_type}**`,
      body: `${input.business_type} brands${cityLine} lose momentum when ${input.service} content lacks ${style} consistency.`,
      image_prompt: `subject: ${input.business_type} brand moment, setting: modern interior${cityLine}, composition: rule-of-thirds focal subject with negative space, lighting: cinematic side light, color_direction: warm neutrals + deep shadows, camera_detail: 50mm editorial look, mood: ${style} confidence, constraints: no gibberish text, no watermark`,
      design_notes:
        "Reserve top-left safe zone for headline overlay, keep high contrast background-text separation, avoid clutter.",
    });
  }

  return {
    graphic_system: graphicSystem,
    slides,
    caption: `Most ${input.business_type} brands undersell their ${input.service}. A premium, clean, cinematic content system removes friction and drives better conversion. Build a repeatable visual strategy${cityLine} and keep every touchpoint on-brand. DM "CAROUSEL" to get a tailored plan.`,
    hashtags: [
      toTag(input.business_type),
      toTag(input.service),
      toTag(input.bucket),
      "#instagrammarketing",
      "#smallbusiness",
    ],
  };
}

function withGenerationMode(output, mode) {
  return {
    ...output,
    _generation_mode: mode,
  };
}

function normalizeOutput(output, input) {
  const fallback = buildMockCarousel(input);
  if (!output || typeof output !== "object") {
    return fallback;
  }

  const normalizedSlides = Array.isArray(output.slides)
    ? output.slides.slice(0, input.num_slides).map((slide, index) => ({
        position: index + 1,
        headline:
          typeof slide?.headline === "string" && slide.headline.trim().length > 0
            ? slide.headline
            : fallback.slides[index].headline,
        body:
          typeof slide?.body === "string" && slide.body.trim().length > 0
            ? slide.body
            : fallback.slides[index].body,
        image_prompt:
          typeof slide?.image_prompt === "string" &&
          slide.image_prompt.trim().length > 0
            ? slide.image_prompt
            : fallback.slides[index].image_prompt,
        design_notes:
          typeof slide?.design_notes === "string" &&
          slide.design_notes.trim().length > 0
            ? slide.design_notes
            : fallback.slides[index].design_notes,
      }))
    : [];

  while (normalizedSlides.length < input.num_slides) {
    normalizedSlides.push(fallback.slides[normalizedSlides.length]);
  }

  return {
    graphic_system:
      output.graphic_system && typeof output.graphic_system === "object"
        ? {
            ...fallback.graphic_system,
            ...output.graphic_system,
            skill_id: GRAPHICS_CREATION_SKILL.id,
          }
        : fallback.graphic_system,
    slides: normalizedSlides,
    caption:
      typeof output.caption === "string" && output.caption.trim().length > 0
        ? output.caption
        : fallback.caption,
    hashtags:
      Array.isArray(output.hashtags) && output.hashtags.length > 0
        ? output.hashtags.map((item) => String(item))
        : fallback.hashtags,
  };
}

// 3) NODE.JS BACKEND FUNCTION
async function generateCarousel(input, options = {}) {
  validateInput(input);

  const {
    allowMock = false,
    forceMock = false,
    model = DEFAULT_MODEL,
  } = options;

  if (forceMock) {
    return withGenerationMode(buildMockCarousel(input), "mock_forced");
  }

  if (!process.env.OPENAI_API_KEY) {
    if (allowMock) {
      return withGenerationMode(buildMockCarousel(input), "mock_no_key");
    }
    throw new Error(
      "OPENAI_API_KEY is missing. Set it to generate live results or pass { allowMock: true }."
    );
  }

  let OpenAI;
  try {
    OpenAI = require("openai");
  } catch (error) {
    throw new Error(
      'Missing "openai" dependency. Run "npm install" before live generation.'
    );
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = buildCarouselPrompt(input);

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const raw = response?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(extractJsonString(raw));
    return withGenerationMode(normalizeOutput(parsed, input), "live");
  } catch (error) {
    if (allowMock) {
      return withGenerationMode(buildMockCarousel(input), "mock_fallback");
    }
    throw error;
  }
}

// 5) SAMPLE INPUT (MVP testing)
const SAMPLE_INPUT = {
  business_type: "photographer",
  city: "Little Rock",
  service: "real estate media",
  tone: "premium",
  bucket: "results_proof",
  num_slides: 6,
};

module.exports = {
  CAROUSEL_INPUT_SCHEMA,
  CAROUSEL_PROMPT_TEMPLATE,
  GRAPHICS_CREATION_SKILL,
  buildCarouselPrompt,
  validateInput,
  buildMockCarousel,
  generateCarousel,
  SAMPLE_INPUT,
};
