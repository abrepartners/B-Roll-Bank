# Carousel MVP Backend

Minimal Node.js backend that generates Instagram carousel JSON from structured input.

## Included

- Input schema constant (`CAROUSEL_INPUT_SCHEMA`)
- Prompt template constant (`CAROUSEL_PROMPT_TEMPLATE`)
- Graphics skill constant with research-backed design rules (`GRAPHICS_CREATION_SKILL`)
- `generateCarousel(input)` function (live OpenAI call)
- Mock mode output for development without API key
- REST API endpoints for schema, sample input, and generation

## Files

- `carouselGenerator.js`: schema, prompt template, generator function
- `graphicsSkill.js`: design skill profile + research sources + prompt block
- `server.js`: Express API
- `index.js`: local CLI runner
- `public/`: local browser UI
- `sample-input.json`: test payload

## Setup

1. Install dependencies:

```bash
npm install
```

2. Optional environment setup:

```bash
cp .env.example .env
```

3. Run the API:

```bash
npm start
```

4. Open the local UI:

```bash
open http://localhost:3000/app
```

5. Run the CLI generator once:

```bash
npm run generate
```

## API

### `GET /api/schema`
Returns the JSON input schema for your UI form.

### `GET /api/sample-input`
Returns an MVP test payload.

### `GET /api/graphics-skill`
Returns the graphics skill object the page uses to guide visual creation rules.

### `POST /api/carousel`
Generates carousel JSON.

Request body:

```json
{
  "business_type": "photographer",
  "city": "Little Rock",
  "service": "real estate media",
  "tone": "premium",
  "bucket": "results_proof",
  "num_slides": 6
}
```

Example request:

```bash
curl -X POST http://localhost:3000/api/carousel \
  -H "Content-Type: application/json" \
  -d @sample-input.json
```

Force mock mode:

```bash
curl -X POST "http://localhost:3000/api/carousel?mock=1" \
  -H "Content-Type: application/json" \
  -d @sample-input.json
```

Persist output JSON to disk:

```bash
curl -X POST "http://localhost:3000/api/carousel?mock=1&persist=1" \
  -H "Content-Type: application/json" \
  -d @sample-input.json
```

### `GET /api/carousels`
Lists saved JSON files in `data/carousels`.

## App Flow Mapping

1. UI collects `business_type`, `city`, `service`, `tone`, `bucket`, `num_slides`.
2. UI posts input JSON to `POST /api/carousel`.
3. API returns:
   - `output.graphic_system`
   - `output.slides[*].headline`
   - `output.slides[*].body`
   - `output.slides[*].image_prompt`
   - `output.slides[*].design_notes`
   - `output.caption`
   - `output.hashtags`
   - `mode` and `mode_detail` (`live`, `mock_forced`, `mock_fallback`, etc.)
4. API can persist output as JSON (`data/carousels/*.json`) and UI renders preview.
5. Optional: pass each `image_prompt` to an image generation API.

## Research Sources Used In Graphics Skill

- [W3C WCAG contrast minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Nielsen Norman Group: Visual Design Principles](https://www.nngroup.com/reports/visual-design/)
- [Baymard: Line Length Readability](https://baymard.com/blog/line-length-readability)
- [OpenAI Cookbook: Generate Images With GPT Image](https://cookbook.openai.com/examples/generate_images_with_gpt_image)
- [Meta IG media spec summary with references](https://ppc.land/meta-updates-instagram-marketing-api-with-new-carousel-video-and-instagram-user-data-fields/)
