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
  regenerationSeed = 0,
  previousLayout?: PosterLayout,
): Promise<PosterLayout> => {
  const layoutVariants: PosterLayout[] = [
    {
      photoArrangement: "single",
      decoration: ["soft circular accent"],
      headlinePosition: "top-center",
      footerStyle: "simple",
    },
    {
      photoArrangement: "two-column",
      decoration: ["subtle side frame"],
      headlinePosition: "top-right",
      footerStyle: "centered",
    },
    {
      photoArrangement: "three-column",
      decoration: ["minimal grid accent"],
      headlinePosition: "top-left",
      footerStyle: "divided",
    },
    {
      photoArrangement: "single",
      decoration: ["soft diagonal highlight"],
      headlinePosition: "top-left",
      footerStyle: "centered",
    },
    {
      photoArrangement: "two-column",
      decoration: ["soft corner glow"],
      headlinePosition: "top-center",
      footerStyle: "divided",
    },
  ];

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

This is regeneration variant seed: ${regenerationSeed}
Previous layout: ${previousLayout ? JSON.stringify(previousLayout) : "none"}

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

- If this is a regeneration, make the layout visibly different from the previous layout whenever possible. Use a different photo arrangement, headline position, or footer style from the previous version.

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

  const cleanedText = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const parsed = JSON.parse(cleanedText);

  const validatedLayout = posterLayoutSchema.parse(parsed);

  if (
    previousLayout &&
    JSON.stringify(validatedLayout) === JSON.stringify(previousLayout)
  ) {
    const candidate =
      layoutVariants[(regenerationSeed + 1) % layoutVariants.length] ??
      layoutVariants[0]!;

    return {
      ...candidate,
      decoration: candidate.decoration,
    };
  }

  return validatedLayout;
};
