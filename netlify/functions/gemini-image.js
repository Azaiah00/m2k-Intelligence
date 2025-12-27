/**
 * Netlify Function: gemini-image
 *
 * Virtual remodeling / staging / decluttering / exterior repair concept demo.
 * Uses Gemini native image generation model:
 * - gemini-2.5-flash-image
 *
 * Docs: https://ai.google.dev/gemini-api/docs/nanobanana
 */
const fs = require("node:fs");
const path = require("node:path");

function readLocalSecrets() {
  try {
    // Try multiple possible paths for local.secrets.json
    const possiblePaths = [
      path.join(process.cwd(), "local.secrets.json"), // Project root
      path.join(__dirname, "..", "..", "local.secrets.json"), // From functions folder
      path.resolve(process.cwd(), "local.secrets.json"), // Absolute path
    ];
    
    for (const secretsPath of possiblePaths) {
      if (fs.existsSync(secretsPath)) {
        const raw = fs.readFileSync(secretsPath, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed.GEMINI_API_KEY) {
          return parsed;
        }
      }
    }
    return {};
  } catch (err) {
    console.error("Error reading local.secrets.json:", err.message);
    return {};
  }
}

function getApiKey() {
  // Check environment variable first (Netlify production)
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  // Check local secrets file (development)
  const secrets = readLocalSecrets();
  if (secrets.GEMINI_API_KEY) {
    return secrets.GEMINI_API_KEY;
  }
  
  return "";
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function parseDataUrl(dataUrl) {
  // Expected: data:image/png;base64,AAAA...
  const match = /^data:(.+?);base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

function presetToInstruction(preset) {
  switch (preset) {
    case "kitchen_stage":
      return "Stage this kitchen for a premium listing: declutter counters, improve lighting, modernize finishes subtly, keep architecture the same, realistic photo.";
    case "bathroom_refresh":
      return "Refresh this bathroom: clean, bright, spa-like, remove clutter, update fixtures to modern brushed nickel, realistic photo, keep layout unchanged.";
    case "living_declutter":
      return "Declutter and stage this living space: remove personal items, add tasteful decor, neutral palette, improve lighting, realistic photo, keep structure unchanged.";
    case "exterior_repair":
      return "Show realistic exterior repair improvements: fix visible damage, clean surfaces, repaint where appropriate, improve curb appeal, keep structure unchanged, realistic photo.";
    default:
      return "Create a realistic remodeled/staged version of this space. Keep the same layout and perspective. Improve cleanliness, lighting, and finishes subtly.";
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found. Checked:", {
      env: !!process.env.GEMINI_API_KEY,
      cwd: process.cwd(),
      secretsFile: fs.existsSync(path.join(process.cwd(), "local.secrets.json")),
    });
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

  const preset = String(payload.preset || "kitchen_stage");
  const extra = String(payload.extraInstructions || "").trim();
  const dataUrl = String(payload.imageDataUrl || "");
  const image = parseDataUrl(dataUrl);
  if (!image) return json(400, { error: "Missing or invalid imageDataUrl" });

  const model = "gemini-2.5-flash-image";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  
  console.log("Calling Gemini API:", { model, url: url.replace(apiKey, "***"), hasImage: !!image });

  const instruction = presetToInstruction(preset);
  const prompt =
    "You are a professional virtual remodeling and staging assistant for a construction company. " +
    "Return a single realistic photo output. Do not add text overlays or watermarks. " +
    "Keep the same camera angle and perspective.\n\n" +
    `Instruction:\n${instruction}\n` +
    (extra ? `\nExtra constraints:\n${extra}\n` : "");

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: image.mimeType,
                data: image.data,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "Unknown error");
    let errData;
    try {
      errData = JSON.parse(errText);
    } catch {
      errData = { message: errText };
    }
    console.error("Gemini API error:", {
      status: resp.status,
      statusText: resp.statusText,
      error: errData,
    });
    return json(resp.status, {
      error: `Gemini API error (${resp.status})`,
      details: errData?.error?.message || errData?.message || errText,
    });
  }

  const data = await resp.json();
  console.log("Gemini response structure:", {
    hasCandidates: !!data?.candidates,
    candidatesLength: data?.candidates?.length,
    firstCandidate: data?.candidates?.[0] ? "exists" : "missing",
  });

  // Find first inlineData image in the response
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const inline = parts.find((p) => p?.inlineData?.data);
  if (!inline) {
    console.error("No image in response:", JSON.stringify(data, null, 2));
    return json(500, {
      error: "No image returned by model",
      details: "Response structure: " + JSON.stringify(data).substring(0, 200),
    });
  }

  const outMime = inline.inlineData.mimeType || "image/png";
  const outB64 = inline.inlineData.data;
  return json(200, { imageDataUrl: `data:${outMime};base64,${outB64}` });
};


