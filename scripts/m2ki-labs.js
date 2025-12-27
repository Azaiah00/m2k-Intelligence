// ========================================
// M2Ki Labs - Interactive AI tools (Text)
//
// Uses Netlify Functions via window.AIDemo.callTextTool()
// Modes:
// - ghostWriter
// - neuralEstimator
// - livingFoundations
// ========================================

function setText(el, text) {
  if (!el) return;
  el.textContent = text;
}

async function runTool({ mode, inputEl, outputEl, statusEl }) {
  const input = (inputEl?.value || "").trim();
  if (!input) return;

  setText(statusEl, "Processing...");
  setText(outputEl, "");

  try {
    const text = await window.AIDemo.callTextTool({ mode, input });
    setText(outputEl, text || "No output returned.");
    setText(statusEl, "Ready");
  } catch (e) {
    setText(outputEl, "Tool failed. Check GEMINI_API_KEY configuration.");
    setText(statusEl, "Error");
  }
}

function initM2KiLabs() {
  // Ghost-Writer
  const ghostInput = document.getElementById("ghostWriterInput");
  const ghostOutput = document.getElementById("ghostWriterOutput");
  const ghostStatus = document.getElementById("ghostWriterStatus");
  const ghostBtn = document.getElementById("ghostWriterRun");
  ghostBtn?.addEventListener("click", () =>
    runTool({
      mode: "ghostWriter",
      inputEl: ghostInput,
      outputEl: ghostOutput,
      statusEl: ghostStatus,
    }),
  );

  // Neural Estimator
  const estInput = document.getElementById("neuralEstimatorInput");
  const estOutput = document.getElementById("neuralEstimatorOutput");
  const estStatus = document.getElementById("neuralEstimatorStatus");
  const estBtn = document.getElementById("neuralEstimatorRun");
  estBtn?.addEventListener("click", () =>
    runTool({
      mode: "neuralEstimator",
      inputEl: estInput,
      outputEl: estOutput,
      statusEl: estStatus,
    }),
  );

  // Living Foundations
  const lfInput = document.getElementById("livingFoundationsInput");
  const lfOutput = document.getElementById("livingFoundationsOutput");
  const lfStatus = document.getElementById("livingFoundationsStatus");
  const lfBtn = document.getElementById("livingFoundationsRun");
  lfBtn?.addEventListener("click", () =>
    runTool({
      mode: "livingFoundations",
      inputEl: lfInput,
      outputEl: lfOutput,
      statusEl: lfStatus,
    }),
  );
}

document.addEventListener("DOMContentLoaded", initM2KiLabs);


