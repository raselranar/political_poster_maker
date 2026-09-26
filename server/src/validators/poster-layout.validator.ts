import { z } from "zod";

export const posterLayoutSchema = z.object({
  // backgroundStyle: z.string().optional(),
  photoArrangement: z.enum(["single", "two-column", "three-column"]),
  decoration: z.array(z.string()),
  headlinePosition: z.enum(["top-center", "top-left", "top-right"]),
  footerStyle: z.enum(["simple", "centered", "divided"]),
});

export type PosterLayout = z.infer<typeof posterLayoutSchema>;
