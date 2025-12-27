// ========================================
// Virtual Remodeling Studio (Image)
//
// Uses Netlify Function:
// - POST /api/gemini-image
// Model: gemini-2.5-flash-image (Gemini native image generation)
// Docs: https://ai.google.dev/gemini-api/docs/nanobanana
// ========================================

function $(id) {
  return document.getElementById(id);
}

function setHtml(el, html) {
  if (!el) return;
  el.innerHTML = html;
}

function setText(el, text) {
  if (!el) return;
  el.textContent = text;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function generateRemodel() {
  const fileInput = $("remodelInput");
  const preset = $("remodelPreset")?.value || "kitchen_stage";
  const extra = ($("remodelExtra")?.value || "").trim();
  const status = $("remodelStatus");
  const beforeImg = $("remodelBefore");
  const afterImg = $("remodelAfter");
  const slider = $("remodelSlider");

  const file = fileInput?.files?.[0];
  if (!file) return;

  setText(status, "Uploading...");
  const imageDataUrl = await readFileAsDataUrl(file);
  if (beforeImg) beforeImg.src = imageDataUrl;

  setText(status, "Generating...");
  setHtml(afterImg, "");

  const resp = await fetch("/api/gemini-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preset, extraInstructions: extra, imageDataUrl }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    setText(
      status,
      err?.error || "Generation failed. Check GEMINI_API_KEY configuration.",
    );
    return;
  }

  const data = await resp.json();
  const outUrl = data.imageDataUrl;
  if (!outUrl) {
    setText(status, "No image returned.");
    return;
  }

  if (afterImg) afterImg.src = outUrl;
  setText(status, "Ready");

  // Before/after slider (simple)
  // We clip the after image width based on slider value.
  const applySlider = () => {
    const v = Number(slider?.value || 50);
    const afterWrap = $("remodelAfterWrap");
    if (!afterWrap) return;
    afterWrap.style.width = `${v}%`;
  };
  slider?.addEventListener("input", applySlider);
  applySlider();

  const dl = $("remodelDownload");
  if (dl) {
    dl.href = outUrl;
    dl.download = "m2k-virtual-remodel.png";
    dl.style.display = "inline-block";
  }
}

function initRemodeling() {
  $("remodelRun")?.addEventListener("click", () => {
    generateRemodel().catch(() => {
      setText($("remodelStatus"), "Error. Please try again.");
    });
  });
}

document.addEventListener("DOMContentLoaded", initRemodeling);


