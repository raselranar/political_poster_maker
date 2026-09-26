import "dotenv/config";
import {
  posterLayoutSchema,
  type PosterLayout,
} from "../validators/poster-layout.validator.js";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
// import Groq from "groq-sdk";

// const ai = new Groq({
//   apiKey: process.env.GROQ_API_KEY!,
// });
export const generatePosterLayout = async (
  occasion: string,
  templateTitle: string,
  photoCount: number,
): Promise<PosterLayout> => {
  const prompt = `
You are a professional poster layout assistant.

Your job is ONLY to suggest visual layout properties.

Do NOT generate, rewrite, translate, modify, correct, or invent any user text.

The exact user-provided text will be rendered separately by the application.

Poster occasion:
${occasion}

Template:
${templateTitle}

Number of photos:
${photoCount}

Return ONLY valid JSON.
Do not return markdown.
Do not add explanations.

Use exactly this structure:

{
  "photoArrangement": "single",
  "decoration": [],
  "headlinePosition": "top-center",
  "footerStyle": "simple"
}

Rules:

- photoArrangement must be one of:
  single, two-column, three-column

- Choose photoArrangement according to the number of photos.

- decoration must be an array of short visual descriptions.

- Keep decorations minimal and professional.

- Decorations must never contain text.

- Decorations must not cover or interfere with user text.

- headlinePosition must be one of:
  top-center, top-left, top-right

- footerStyle must be one of:
  simple, centered, divided

- Maintain strong visual hierarchy:
  headline > name > designation > organization

- Keep sufficient whitespace around text.

- Do not include political slogans or political messaging.

- Do not invent names, organizations, locations, slogans, or any other text.

Return ONLY the JSON object.
`;
  const response = await generateText({
    model: groq("openai/gpt-oss-20b"),
    prompt: prompt,
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Groq returned an empty response");
  }

  // Remove accidental markdown code fences.
  const cleanedText = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleanedText);

  const validatedLayout = posterLayoutSchema.parse(parsed);

  return validatedLayout;
};
