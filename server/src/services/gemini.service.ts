import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import {
  posterLayoutSchema,
  type PosterLayout,
} from "../validators/poster-layout.validator.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
export const generatePosterLayout = async (
  occasion: string,
  templateTitle: string,
  photoCount: number,
): Promise<PosterLayout> => {
  const prompt = `
You are a visual poster layout assistant.

Your job is ONLY to suggest visual layout properties.

Do NOT generate, rewrite, translate, modify, or correct any user text.

The exact user-provided text will be rendered separately by the application.

Poster occasion:
${occasion}

Template:
${templateTitle}

Number of photos:
${photoCount}

Return ONLY valid JSON.

Use exactly this structure:

{
  "backgroundStyle": "short description",
  "primaryColor": "#000000",
  "secondaryColor": "#FFFFFF",
  "photoArrangement": "single",
  "decoration": [],
  "headlinePosition": "top-center",
  "footerStyle": "simple"
}

Rules:

- photoArrangement must be one of:
  single, two-column, three-column
- decoration must be an array of short visual descriptions.
- Do not include political slogans.
- Do not invent names, organizations, locations, or other text.
- Do not return markdown.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
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
