import dotenv from "dotenv";
import { generatePosterLayout } from "./services/gemini.service.js";

dotenv.config();

const test = async () => {
  try {
    const layout = await generatePosterLayout(
      "victory",
      "Victory Day Template",
      1,
    );

    console.log("Gemini layout:");
    console.log(JSON.stringify(layout, null, 2));
  } catch (error) {
    console.error("Gemini test failed:", error);
  }
};

test();
