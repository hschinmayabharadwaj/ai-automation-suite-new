// app/api/generate-content/route.ts
import { NextResponse } from "next/server";

const MIND_MAP_SYSTEM_PROMPT = `//-- IDENTITY & ROLE --//
You are "Synapse," an expert AI specializing in conceptual structuring and knowledge mapping. Your purpose is to deconstruct any given topic into a clear, logical, and hierarchical mind map structure.

//-- CORE DIRECTIVE --//
Your SOLE and ONLY output MUST be a single, valid JSON object. Do not include any introductory text, explanations, apologies, markdown code blocks (```json), or any text outside of the JSON structure. Start directly with { and end with }.

//-- JSON STRUCTURE RULES --//
The JSON object must represent a mind map and follow this exact recursive structure:
- It must have a single root node.
- Each node object must contain:
  - id: A unique string identifier.
  - text: A concise, descriptive label for the node (max 10 words).
  - children: An array of other node objects. If there are no sub-topics, this must be an empty array [].

//-- CONTENT DECONSTRUCTION PROCESS --//
When you receive a user's prompt, you must perform the following steps:
1.  Identify the Central Topic: This becomes the text for your root node.
2.  Determine Primary Sub-Topics: Break down the central topic into its most important main categories. These will be the first-level objects in the root node's children array.
3.  Add Key Details: For each primary sub-topic, provide 2-4 key details, facts, or examples. These will be the nested objects in each sub-topic's children array.
4.  Maintain Hierarchy: Ensure the structure is logical and easy to follow, going from broad concepts to specific details.

Remember: Output ONLY the JSON object, nothing else.`;

type GroqResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  [k: string]: any;
};

// Helper: try to extract the first {...} block from a string (best-effort)
function extractFirstJsonBlock(s: string): string | null {
  const firstBrace = s.indexOf("{");
  if (firstBrace === -1) return null;
  // find matching closing brace by scanning (simple stack)
  let depth = 0;
  for (let i = firstBrace; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return s.slice(firstBrace, i + 1);
      }
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required", success: false },
        { status: 400 },
      );
    }

    const apiKey = (process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "").trim();
    console.log("[generate-content] GROQ_API_KEY present:", apiKey.length > 0);
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GROQ_API_KEY is missing. Set GROQ_API_KEY in env and restart.",
          success: false,
        },
        { status: 401 },
      );
    }

    const models = [
      "gemma2-9b-it",
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant"
    ];

    let lastErrorText = "";

    for (const model of models) {
      try {
        console.log(`[generate-content] Trying Groq model: ${model}`);

        // timeout for fetch
        const controller = new AbortController();
        const timeoutMs = 20_000; // 20s
        const id = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: MIND_MAP_SYSTEM_PROMPT },
              { role: "user", content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 2048,
          }),
        }).finally(() => clearTimeout(id));

        if (!res.ok) {
          const errText = await res.text().catch(() => `HTTP ${res.status}`);
          lastErrorText = `status=${res.status} ${errText}`;
          console.warn(`[generate-content] Model ${model} failed:`, lastErrorText);

          if (res.status === 401 || res.status === 403) {
            return NextResponse.json(
              {
                error: "Invalid or unauthorized GROQ_API_KEY.",
                details: errText,
                success: false,
              },
              { status: 401 },
            );
          }
          // try next model for other errors
          continue;
        }

        const data: GroqResponse = await res.json().catch((e) => {
          lastErrorText = `failed-to-parse-json: ${String(e)}`;
          return {};
        });

        let aiResponse = data?.choices?.[0]?.message?.content ?? "";

        // Basic cleanups
        aiResponse = aiResponse
          .replace(/```json\s*/gi, '')
          .replace(/```\s*/g, '')
          .replace(/^[\s\n]*/, '')
          .replace(/[\s\n]*$/, '')
          .trim();

        // Try direct JSON parse first
        let parsed: any = null;
        let parseError: Error | null = null;
        try {
          parsed = JSON.parse(aiResponse);
        } catch (e) {
          parseError = e as Error;
          // Attempt to salvage: extract first {...} block and parse that
          const block = extractFirstJsonBlock(aiResponse);
          if (block) {
            try {
              parsed = JSON.parse(block);
            } catch (e2) {
              parseError = e2 as Error;
            }
          }
        }

        if (!parsed) {
          console.warn("[generate-content] Failed to parse AI response as JSON:", parseError);
          console.log("[generate-content] Raw AI response:", aiResponse);
          return NextResponse.json({
            text: aiResponse,
            mindMap: null,
            model,
            success: false,
            warning: "AI response was not valid JSON",
            parseError: String(parseError),
          }, { status: 200 });
        }

        // Validate minimal structure
        if (!parsed.root || !parsed.root.id || !parsed.root.text || !Array.isArray(parsed.root.children)) {
          return NextResponse.json({
            error: "AI returned JSON but it does not follow the required mind-map structure",
            mindMap: parsed,
            model,
            success: false
          }, { status: 200 });
        }

        return NextResponse.json({
          text: aiResponse,
          mindMap: parsed,
          model,
          success: true
        }, { status: 200 });

      } catch (e: any) {
        lastErrorText = e?.message || String(e);
        console.warn(`[generate-content] Model ${model} threw:`, lastErrorText);
        // continue to next model
        continue;
      }
    }

    // All models exhausted
    return NextResponse.json(
      {
        error: "All AI models are currently unavailable",
        details: lastErrorText,
        success: false,
      },
      { status: 503 },
    );

  } catch (error: any) {
    console.error("Content generation failed:", error);
    return NextResponse.json(
      {
        error: "Content generation service is temporarily unavailable",
        details: error?.message || "Unknown error occurred",
        success: false,
      },
      { status: 500 },
    );
  }
}
