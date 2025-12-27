/**
 * Netlify Function: gemini-text
 *
 * Why this exists:
 * - We NEVER call Gemini directly from the browser because it would expose the API key.
 * - This serverless function keeps `GEMINI_API_KEY` private while enabling real AI tools.
 */
const fs = require("node:fs");
const path = require("node:path");

function readLocalSecrets() {
  try {
    const secretsPath = path.join(process.cwd(), "local.secrets.json");
    if (!fs.existsSync(secretsPath)) return {};
    const raw = fs.readFileSync(secretsPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getApiKey() {
  return process.env.GEMINI_API_KEY || readLocalSecrets().GEMINI_API_KEY || "";
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function buildPrompt({ mode, input }) {
  const baseContext =
    "You are M2Ki (M2K Intelligence) strategic AI. M2K is a Richmond, Virginia construction company pivoting into AI-enabled mission-critical infrastructure and government/corporate contracts. Be concise, high-authority, and practical.";

  switch (mode) {
    case "ghostWriter":
      return `${baseContext}\n\nTask: Convert the following field note into a professional construction document.\nOutput format:\n- Title line\n- Project context (1-2 lines)\n- Key facts (bullets)\n- Risks (bullets)\n- Actions/Next steps (bullets)\nTone: formal, compliance-ready.\n\nField note:\n${input}`;
    case "neuralEstimator":
      return `${baseContext}\n\nTask: Draft an executive-grade capability statement + bid posture.\nInclude:\n- One-paragraph capability statement\n- Differentiators (bullets)\n- Risk controls (bullets)\n- Suggested line items for 'Digital Validation / SiteSight' fee\n- Assumptions and questions to ask GC\n\nScope:\n${input}`;
    case "livingFoundations":
      return `${baseContext}\n\nTask: Propose a smart concrete / embedded sensor plan.\nInclude:\n- Sensor types (plain English)\n- Placement guidance\n- Data to capture and why\n- How AI produces alerts and reports\n- How this becomes a recurring service contract\n\nProject description:\n${input}`;
    default:
      return `${baseContext}\n\nUser question:\n${input}\n\nRespond in 3-6 sentences.`;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return json(400, {
      error:
        "Missing GEMINI_API_KEY. Add it in Netlify environment variables (production) or create local.secrets.json (local).",
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const mode = String(payload.mode || "assistant");
  const input = String(payload.input || "").trim();
  if (!input) return json(400, { error: "Missing input" });

  // We use a fast, high-quality text model for interactive tools.
  // (Virtual remodeling uses the image model in a different function.)
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const prompt = buildPrompt({ mode, input });

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 700,
      },
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    return json(resp.status, { error: "Gemini request failed", details: errText });
  }

  const data = await resp.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join("\n") ||
    "";

  return json(200, { text });
};


