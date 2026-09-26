import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Template } from "../models/Template.js";

dotenv.config();

const templates = [
  {
    title: "Victory Day",
    occasionType: "victory",

    thumbnailUrl: "https://placehold.co/600x800?text=Victory+Day",

    layoutConfig: {
      backgroundColor: "#F5F5F5",
      primaryColor: "#0F172A",
      secondaryColor: "#334155",

      photoSlots: [
        {
          x: 300,
          y: 280,
          width: 600,
          height: 650,
          borderRadius: 200,
        },
      ],

      textSlots: [
        {
          type: "headline",
          x: 100,
          y: 70,
          width: 1000,
          height: 160,
          fontSize: 70,
          fontWeight: 700,
          align: "center",
        },
        {
          type: "name",
          x: 100,
          y: 1000,
          width: 1000,
          height: 100,
          fontSize: 48,
          fontWeight: 700,
          align: "center",
        },
        {
          type: "designation",
          x: 100,
          y: 1110,
          width: 1000,
          height: 80,
          fontSize: 34,
          fontWeight: 500,
          align: "center",
        },
        {
          type: "organization",
          x: 100,
          y: 1200,
          width: 1000,
          height: 80,
          fontSize: 32,
          fontWeight: 500,
          align: "center",
        },
      ],
    },

    isActive: true,
  },

  {
    title: "Tribute",
    occasionType: "tribute",

    thumbnailUrl: "https://placehold.co/600x800?text=Tribute",

    layoutConfig: {
      backgroundColor: "#FFFFFF",
      primaryColor: "#1E293B",
      secondaryColor: "#64748B",

      photoSlots: [
        {
          x: 80,
          y: 300,
          width: 320,
          height: 430,
          borderRadius: 20,
        },
        {
          x: 440,
          y: 300,
          width: 320,
          height: 430,
          borderRadius: 20,
        },
        {
          x: 800,
          y: 300,
          width: 320,
          height: 430,
          borderRadius: 20,
        },
      ],

      textSlots: [
        {
          type: "headline",
          x: 100,
          y: 70,
          width: 1000,
          height: 160,
          fontSize: 68,
          fontWeight: 700,
          align: "center",
        },
        {
          type: "name",
          x: 100,
          y: 800,
          width: 1000,
          height: 100,
          fontSize: 48,
          fontWeight: 700,
          align: "center",
        },
        {
          type: "designation",
          x: 100,
          y: 910,
          width: 1000,
          height: 80,
          fontSize: 34,
          fontWeight: 500,
          align: "center",
        },
        {
          type: "organization",
          x: 100,
          y: 1000,
          width: 1000,
          height: 80,
          fontSize: 32,
          fontWeight: 500,
          align: "center",
        },
      ],
    },

    isActive: true,
  },

  {
    title: "Campaign",
    occasionType: "campaign",

    thumbnailUrl: "https://placehold.co/600x800?text=Campaign",

    layoutConfig: {
      backgroundColor: "#F8FAFC",
      primaryColor: "#111827",
      secondaryColor: "#475569",

      photoSlots: [
        {
          x: 70,
          y: 350,
          width: 560,
          height: 720,
          borderRadius: 20,
        },
      ],

      textSlots: [
        {
          type: "headline",
          x: 680,
          y: 300,
          width: 450,
          height: 240,
          fontSize: 58,
          fontWeight: 700,
          align: "left",
        },
        {
          type: "name",
          x: 680,
          y: 700,
          width: 450,
          height: 120,
          fontSize: 44,
          fontWeight: 700,
          align: "left",
        },
        {
          type: "designation",
          x: 680,
          y: 850,
          width: 450,
          height: 100,
          fontSize: 32,
          fontWeight: 500,
          align: "left",
        },
        {
          type: "organization",
          x: 680,
          y: 970,
          width: 450,
          height: 100,
          fontSize: 30,
          fontWeight: 500,
          align: "left",
        },
      ],
    },

    isActive: true,
  },
];

const seedTemplates = async () => {
  try {
    await connectDB();

    await Template.deleteMany({});

    await Template.insertMany(templates);

    console.log("Templates seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Template seeding failed:", error);

    process.exit(1);
  }
};

seedTemplates();
