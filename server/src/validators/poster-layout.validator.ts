import { z } from "zod";

export const posterLayoutSchema = z.object({
  backgroundStyle: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),

  photoArrangement: z.enum(["single", "two-column", "three-column"]),

  decoration: z.array(z.string()),

  headlinePosition: z.string(),

  footerStyle: z.string(),
});

export type PosterLayout = z.infer<typeof posterLayoutSchema>;
