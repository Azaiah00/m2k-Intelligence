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
    // Try multiple possible paths for local.secrets.json
    const possiblePaths = [
      path.join(process.cwd(), "local.secrets.json"), // Project root
      path.join(__dirname, "..", "..", "local.secrets.json"), // From functions folder
      path.resolve(process.cwd(), "local.secrets.json"), // Absolute path
      path.resolve(__dirname, "../../local.secrets.json"), // Relative from functions
    ];
    
    console.log("Attempting to read local.secrets.json from:", {
      cwd: process.cwd(),
      __dirname: __dirname,
      possiblePaths: possiblePaths
    });
    
    for (const secretsPath of possiblePaths) {
      console.log("Checking path:", secretsPath, "exists:", fs.existsSync(secretsPath));
      if (fs.existsSync(secretsPath)) {
        const raw = fs.readFileSync(secretsPath, "utf8");
        const parsed = JSON.parse(raw);
        console.log("Found secrets file, has GEMINI_API_KEY:", !!parsed.GEMINI_API_KEY);
        if (parsed.GEMINI_API_KEY) {
          return parsed;
        }
      }
    }
    console.warn("No local.secrets.json found in any expected location");
    return {};
  } catch (err) {
    console.error("Error reading local.secrets.json:", err.message, err.stack);
    return {};
  }
}

function getApiKey() {
  // Check environment variable first (Netlify production or .env file)
  if (process.env.GEMINI_API_KEY) {
    console.log("Using GEMINI_API_KEY from environment variable");
    return process.env.GEMINI_API_KEY;
  }
  
  // Check local secrets file (development fallback)
  const secrets = readLocalSecrets();
  if (secrets.GEMINI_API_KEY) {
    console.log("Using GEMINI_API_KEY from local.secrets.json");
    return secrets.GEMINI_API_KEY;
  }
  
  console.error("GEMINI_API_KEY not found in environment or local.secrets.json");
  return "";
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function buildPrompt({ mode, input }) {
  const baseContext = `You are M2Ki (M2K Intelligence) strategic AI assistant. You are speaking directly to Mark Payne, the owner of M2K LLC, a Richmond, Virginia construction company.

CURRENT STATE OF M2K (from m2k1st.com):
- M2K LLC is a Richmond-owned and operated home and business renovation contractor
- Owner: Mark Payne ("The Man to Know")
- Current services: Bathroom remodeling, Kitchen remodeling, Home remodeling (residential and commercial)
- Market: Richmond metro area
- Strengths: Excellent workmanship, fair pricing, customer service, local reputation, safety-focused
- Current positioning: Family-friendly residential/commercial renovation specialist
- Established business with strong testimonials and portfolio

TRANSFORMATION OPPORTUNITY:
M2K is being presented with an AI-driven transformation strategy to pivot into mission-critical infrastructure (data centers, government contracts) while leveraging existing construction expertise. This presentation explains how AI integration can:
1. Expand market reach from residential/commercial to high-value government and corporate contracts
2. Add tech-enabled services that command premium pricing (25%+ margins)
3. Maintain construction expertise while adding AI capabilities
4. Target Northern Virginia data center market ($2.4B infrastructure funding 2025-2027)
5. Leverage SWaM certification for competitive advantage

YOUR ROLE:
Speak directly to Mark as if you're explaining how these AI solutions and upgrades can be implemented in HIS M2K construction company. Be practical, specific, and show clear implementation paths. Reference his current business model and show how AI enhances rather than replaces his expertise.`;

  switch (mode) {
    case "ghostWriter":
      return `${baseContext}\n\nTask: Convert the following field note into a professional construction document.\nOutput format:\n- Title line\n- Project context (1-2 lines)\n- Key facts (bullets)\n- Risks (bullets)\n- Actions/Next steps (bullets)\nTone: formal, compliance-ready.\n\nField note:\n${input}`;
    case "neuralEstimator":
      return `${baseContext}\n\nTask: Draft an executive-grade capability statement + bid posture.\nInclude:\n- One-paragraph capability statement\n- Differentiators (bullets)\n- Risk controls (bullets)\n- Suggested line items for 'Digital Validation / SiteSight' fee\n- Assumptions and questions to ask GC\n\nScope:\n${input}`;
    case "livingFoundations":
      return `${baseContext}\n\nTask: Propose a smart concrete / embedded sensor plan.\nInclude:\n- Sensor types (plain English)\n- Placement guidance\n- Data to capture and why\n- How AI produces alerts and reports\n- How this becomes a recurring service contract\n\nProject description:\n${input}`;
    default:
      return `${baseContext}\n\nMark is asking you a question about the M2K Intelligence transformation strategy:\n\nQuestion: ${input}\n\nProvide a comprehensive answer that:\n1. Speaks directly to Mark as the owner of M2K\n2. Explains how the concept/solution can be implemented in HIS construction company\n3. Shows practical benefits for his current business model\n4. References his existing strengths (workmanship, local reputation, customer service)\n5. Explains how AI enhances rather than replaces his expertise\n6. Provides actionable implementation steps when relevant\n\nIf the question is about:\n- Terms/concepts: Define clearly and show how it applies to M2K's operations\n- AI tools: Explain how Mark can use them in his daily construction work\n- Strategy: Show how it builds on his current business and expands opportunities\n- Market opportunities: Connect to his Richmond base and Northern Virginia expansion\n- Implementation: Provide step-by-step guidance for his company\n\nAim for 5-10 sentences with specific, actionable information. Be authoritative but conversational, as if advising a business owner.`;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("API key check failed:", {
      envKey: !!process.env.GEMINI_API_KEY,
      cwd: process.cwd(),
      __dirname: __dirname,
    });
    return json(400, {
      error:
        "Missing GEMINI_API_KEY. Add it in Netlify environment variables (production) or create local.secrets.json in the project root (local development).",
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

  console.log("Calling Gemini API:", { model, mode, inputLength: input.length });
  
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
  console.log("Gemini response received, candidates:", data?.candidates?.length || 0);
  
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join("\n") ||
    null;

  if (!text || text.trim().length < 10) {
    console.error("No valid text in Gemini response:", JSON.stringify(data, null, 2));
    return json(500, {
      error: "No text response from Gemini",
      details: "Response structure: " + JSON.stringify(data).substring(0, 200),
    });
  }

  return json(200, { text });
};


