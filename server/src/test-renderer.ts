import fs from "fs";
import { renderPoster } from "./services/poster-renderer.service.js";

const testPhotoUrl = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="650" viewBox="0 0 600 650"><rect width="600" height="650" fill="#dce8df"/><circle cx="300" cy="190" r="100" fill="#e3a77b"/><path d="M120 650c15-180 110-270 180-270s165 90 180 270" fill="#24634d"/></svg>',
)}`;

const test = async () => {
  try {
    const image = await renderPoster({
      name: "রাশেদ রানা",
      designation: "উন্নয়নকর্মী ও সমাজসেবক",
      organization: "স্থানীয় উন্নয়ন পরিষদ, ঢাকা জেলা",
      district: "ঢাকা",
      headline: "জনগণের সেবায় নিবেদিত একজন বিশ্বস্ত প্রতিনিধি",
      photoUrls: [testPhotoUrl],
      backgroundColor: "#006A4E",
      primaryColor: "#006A4E",
      secondaryColor: "#FFFFFF",
      photoSlots: [
        {
          x: 300,
          y: 300,
          width: 600,
          height: 650,
          borderRadius: 300,
        },
      ],
      textSlots: [
        {
          type: "headline",
          x: 80,
          y: 80,
          width: 1040,
          height: 180,
          fontSize: 70,
          fontWeight: 700,
          align: "center",
        },
        {
          type: "name",
          x: 80,
          y: 1000,
          width: 1040,
          height: 100,
          fontSize: 48,
          fontWeight: 700,
          align: "center",
        },
        {
          type: "designation",
          x: 80,
          y: 1120,
          width: 1040,
          height: 80,
          fontSize: 34,
          fontWeight: 500,
          align: "center",
        },
        {
          type: "organization",
          x: 80,
          y: 1210,
          width: 1040,
          height: 90,
          fontSize: 32,
          fontWeight: 500,
          align: "center",
        },
        {
          type: "footer",
          x: 80,
          y: 1390,
          width: 1040,
          height: 70,
          fontSize: 28,
          fontWeight: 500,
          align: "center",
        },
      ],
    });

    fs.writeFileSync("poster-test.png", image);

    console.log("Poster generated successfully:");

    console.log("server/poster-test.png");
  } catch (error) {
    console.error("Renderer failed:", error);
  }
};

test();
