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

  const prompt = `You control only four visual choices for a poster. You do not write poster text.

Input:
- occasion: ${occasion}
- template: ${templateTitle}
- photo count: ${photoCount}
- variation number: ${regenerationSeed}
- previous layout: ${previousLayout ? JSON.stringify(previousLayout) : "none"}

Return exactly one JSON object and nothing else. Use double quotes. No markdown. No comments.

Required shape:
{"photoArrangement":"single","decoration":["soft circular accent"],"headlinePosition":"top-center","footerStyle":"simple"}

Allowed values:
- photoArrangement: single for 1 photo, two-column for 2 photos, three-column for 3 photos
- headlinePosition: top-center, top-left, or top-right
- footerStyle: simple, centered, or divided
- decoration: exactly one short visual phrase, with no words that should appear on the poster

Decision rules:
1. Keep photoArrangement exactly matched to the photo count.
2. Keep the headline at the top with clear whitespace. Never hide, remove, or replace it.
3. Use a different headlinePosition, footerStyle, or decoration from the previous layout when possible.
4. For victory use confident geometry; for tribute use restrained framing; for campaign use strong directional composition.
5. Do not invent names, slogans, locations, organizations, or any user-facing text.

Example valid response:
{"photoArrangement":"two-column","decoration":["subtle side frame"],"headlinePosition":"top-left","footerStyle":"centered"}`;
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

  const variation =
    layoutVariants[regenerationSeed % layoutVariants.length] ??
    layoutVariants[0]!;
  const photoArrangement =
    photoCount === 1
      ? "single"
      : photoCount === 2
        ? "two-column"
        : "three-column";
  const validatedLayout = posterLayoutSchema.parse({
    ...parsed,
    photoArrangement,
    decoration: variation.decoration,
    headlinePosition: variation.headlinePosition,
    footerStyle: variation.footerStyle,
  });

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
