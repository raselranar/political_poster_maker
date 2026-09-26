import "dotenv/config";
import { generatePosterLayout } from "./services/grok.service.js";

const test = async () => {
  try {
    const layout = await generatePosterLayout(
      "victory",
      "Victory Day Template",
      1,
    );

    console.log("Grok layout:");
    console.log(JSON.stringify(layout, null, 2));
  } catch (error) {
    console.error("Grok test failed:", error);
  }
};

test();
