const form = document.getElementById("carousel-form");
const statusEl = document.getElementById("status");
const summaryEl = document.getElementById("summary");
const slidesEl = document.getElementById("slides");
const jsonOutputEl = document.getElementById("json-output");
const submitBtn = document.getElementById("submit-btn");
const copyBtn = document.getElementById("copy-btn");
const skillStatusEl = document.getElementById("skill-status");
const skillContentEl = document.getElementById("skill-content");

let lastResponse = null;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function buildPayload(formData) {
  return {
    business_type: String(formData.get("business_type") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    service: String(formData.get("service") || "").trim(),
    tone: String(formData.get("tone") || "").trim(),
    bucket: String(formData.get("bucket") || "").trim(),
    num_slides: Number(formData.get("num_slides")),
    persist: formData.get("persist") === "on",
  };
}

function renderSlides(slides) {
  slidesEl.innerHTML = "";

  for (const slide of slides) {
    const card = document.createElement("article");
    card.className = "slide";

    const headline = document.createElement("h3");
    headline.textContent = `Slide ${slide.position}: ${slide.headline}`;

    const body = document.createElement("p");
    body.textContent = slide.body;

    const prompt = document.createElement("code");
    prompt.textContent = `image_prompt: ${slide.image_prompt}`;

    const designNotes = document.createElement("p");
    designNotes.className = "design-notes";
    designNotes.textContent = `design_notes: ${slide.design_notes || "n/a"}`;

    card.append(headline, body, designNotes, prompt);
    slidesEl.appendChild(card);
  }
}

function renderSummary(response) {
  const mode = response.mode || "unknown";
  const modeDetail = response.mode_detail || "n/a";
  const savedPath = response.saved_path || "not saved";
  const hashtags = (response.output?.hashtags || []).join(" ");
  const caption = response.output?.caption || "";
  const graphicSystem = response.output?.graphic_system || {};
  const canvas = graphicSystem.canvas || "n/a";
  const aspectRatio = graphicSystem.aspect_ratio || "n/a";
  const tone = graphicSystem.tone || "n/a";

  summaryEl.classList.remove("hidden");
  summaryEl.innerHTML = `
    <strong>Mode:</strong> ${mode}<br />
    <strong>Mode Detail:</strong> ${modeDetail}<br />
    <strong>Saved:</strong> ${savedPath}<br />
    <strong>Graphic System:</strong> ${canvas}, ${aspectRatio}, tone ${tone}<br />
    <strong>Hashtags:</strong> ${hashtags}<br />
    <strong>Caption:</strong> ${caption}
  `;
}

async function handleSubmit(event) {
  event.preventDefault();
  setStatus("Generating...");
  submitBtn.disabled = true;

  const formData = new FormData(form);
  const useMock = formData.get("use_mock") === "on";
  const payload = buildPayload(formData);
  const endpoint = useMock ? "/api/carousel?mock=1" : "/api/carousel";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.error || "Request failed");
    }

    lastResponse = json;
    renderSummary(json);
    renderSlides(json.output.slides || []);
    jsonOutputEl.textContent = JSON.stringify(json, null, 2);
    setStatus("Generated successfully.");
  } catch (error) {
    setStatus(error.message || "Generation failed.", true);
  } finally {
    submitBtn.disabled = false;
  }
}

async function copyJson() {
  if (!lastResponse) {
    setStatus("Generate output first, then copy.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(JSON.stringify(lastResponse, null, 2));
    setStatus("Copied JSON to clipboard.");
  } catch (error) {
    setStatus("Could not copy JSON.", true);
  }
}

function renderSkill(skill) {
  const topSources = Array.isArray(skill.sources) ? skill.sources.slice(0, 3) : [];
  const principles = [
    ...(skill.composition_rules || []).slice(0, 2),
    ...(skill.accessibility_rules || []).slice(0, 1),
  ];

  skillStatusEl.textContent = `${skill.name} (${skill.id}) active`;
  skillContentEl.innerHTML = `
    <strong>Canvas:</strong> ${skill.platform_specs?.recommended_canvas || "n/a"}
    <br />
    <strong>Aspect:</strong> ${skill.platform_specs?.recommended_aspect_ratio || "n/a"}
    <br />
    <strong>Core Rules:</strong>
    <br />
    ${principles.map((item) => `- ${item}`).join("<br />")}
    <br />
    <strong>Research:</strong>
    <br />
    ${topSources
      .map((source) => `<a href="${source.url}" target="_blank">${source.label}</a>`)
      .join("<br />")}
  `;
}

async function loadSkill() {
  try {
    const response = await fetch("/api/graphics-skill");
    if (!response.ok) {
      throw new Error("Could not load graphics skill.");
    }
    const skill = await response.json();
    renderSkill(skill);
  } catch (error) {
    skillStatusEl.textContent = "Could not load graphics skill metadata.";
  }
}

form.addEventListener("submit", handleSubmit);
copyBtn.addEventListener("click", copyJson);
loadSkill();
