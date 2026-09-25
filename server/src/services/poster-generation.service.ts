import { Poster } from "../models/Poster.js";
import { Template } from "../models/Template.js";
import { uploadBufferToCloudinary } from "./cloudinary.service.js";
import { generatePosterLayout } from "./grok.service.js";
import { renderPoster } from "./poster-renderer.service.js";

export const generatePoster = async (posterId: string) => {
  console.log("generatePoster started:", posterId);
  const poster = await Poster.findById(posterId);

  if (!poster) {
    throw new Error("Poster not found");
  }

  try {
    const template = await Template.findById(poster.templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    /*
     * 1. Ask Gemini for visual layout instructions.
     */
    const layout = await generatePosterLayout(
      poster.formData.occasion,
      template.title,
      poster.photoUrls.length,
    );

    /*
     * 2. Render the exact user content using Puppeteer.
     */
    const imageBuffer = await renderPoster({
      name: poster.formData.name,
      designation: poster.formData.designation!,
      organization: poster.formData.organization!,
      district: poster.formData.district,
      headline: poster.formData.headline,

      photoUrls: poster.photoUrls,

      backgroundColor: template.layoutConfig.backgroundColor,

      primaryColor: layout.primaryColor,

      secondaryColor: layout.secondaryColor,

      backgroundStyle: layout.backgroundStyle,
    });

    /*
     * 3. Upload generated PNG to Cloudinary.
     */
    const uploadedImage = await uploadBufferToCloudinary(
      imageBuffer,
      "ai-political-poster-maker/generated",
    );

    /*
     * 4. Save result.
     */
    poster.status = "completed";

    poster.generatedImageUrl = uploadedImage.secure_url;

    poster.aiLayout = layout;

    poster.errorMessage = undefined;

    await poster.save();

    return poster;
  } catch (error) {
    console.error(`Poster generation failed: ${posterId}`, error);

    poster.status = "failed";

    poster.errorMessage =
      error instanceof Error ? error.message : "Poster generation failed";

    await poster.save();

    throw error;
  }
};
