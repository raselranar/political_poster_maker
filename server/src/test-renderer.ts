import fs from "fs";
import { renderPoster } from "./services/poster-renderer.service.js";

const test = async () => {
  try {
    const image = await renderPoster({
      name: "Test User",
      designation: "Developer",
      organization: "Test Organization",
      district: "ঢাকা",
      headline: "মহান বিজয় দিবস",
      photoUrls: [
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      ],
      backgroundColor: "#006A4E",
      primaryColor: "#006A4E",
      secondaryColor: "#FFFFFF",
    });

    fs.writeFileSync("poster-test.png", image);

    console.log("Poster generated successfully:");

    console.log("server/poster-test.png");
  } catch (error) {
    console.error("Renderer failed:", error);
  }
};

test();
