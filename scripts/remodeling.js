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
  if (!file) {
    setText(status, "Please select an image first");
    return;
  }

  setText(status, "Uploading...");
  let imageDataUrl;
  try {
    imageDataUrl = await readFileAsDataUrl(file);
    if (beforeImg) beforeImg.src = imageDataUrl;
  } catch (err) {
    setText(status, "Failed to read image file");
    console.error("Image read error:", err);
    return;
  }

  setText(status, "Generating...");
  setHtml(afterImg, "");

  let resp;
  try {
    resp = await fetch("/api/gemini-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preset, extraInstructions: extra, imageDataUrl }),
    });
  } catch (err) {
    setText(status, "Network error: Is dev server running?");
    console.error("Fetch error:", err);
    return;
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    const errorMsg = err?.error || err?.details || `HTTP ${resp.status}: Generation failed.`;
    console.error("Remodeling API error:", errorMsg, err);
    setText(
      status,
      errorMsg.length > 80 ? errorMsg.substring(0, 80) + "..." : errorMsg,
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


