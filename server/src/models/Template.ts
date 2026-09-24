import mongoose, { Schema, type Document } from "mongoose";

export type OccasionType = "victory" | "tribute" | "campaign";
interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
}
interface TextSlot {
  type: "headline" | "name" | "designation" | "organization" | "footer";
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight?: string;
  align?: "left" | "center" | "right";
}

interface LayoutConfig {
  width: number;
  height: number;
  backgroundColor: string;
  photoSlots: PhotoSlot[];
  textSlots: TextSlot[];
}

interface Template extends Document {
  title: string;
  occasionType: OccasionType;
  thumbnailUrl: string;
  layoutConfig: LayoutConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const photoSlotSchema = new Schema<PhotoSlot>(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    borderRadius: { type: Number, default: 0 },
  },
  { _id: false },
);

const textSlotSchema = new Schema<TextSlot>(
  {
    type: {
      type: String,
      enum: ["headline", "name", "designation", "organization", "footer"],
      required: true,
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    fontSize: { type: Number, required: true },
    fontWeight: { type: String },
    align: {
      type: String,
      enum: ["left", "center", "right"],
      default: "center",
    },
  },
  { _id: false },
);

const layoutConfigSchema = new Schema<LayoutConfig>(
  {
    width: { type: Number, required: true },
    height: { type: Number, required: true },

    backgroundColor: {
      type: String,
      required: true,
    },

    photoSlots: {
      type: [photoSlotSchema],
      default: [],
    },

    textSlots: {
      type: [textSlotSchema],
      default: [],
    },
  },
  { _id: false },
);

const templateSchema = new Schema<Template>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    occasionType: {
      type: String,
      enum: ["victory", "tribute", "campaign"],
      required: true,
    },

    thumbnailUrl: {
      type: String,
      required: true,
    },

    layoutConfig: {
      type: layoutConfigSchema,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Template = mongoose.model<Template>("Template", templateSchema);
