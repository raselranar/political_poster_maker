import mongoose, { Document, Schema } from "mongoose";

export type PosterStatus = "draft" | "generating" | "completed" | "failed";

export interface Poster extends Document {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;

  formData: {
    name: string;
    designation?: string;
    organization?: string;
    district: string;
    occasion: "victory" | "tribute" | "campaign";
    headline: string;
  };

  photoUrls: string[];

  generatedImageUrl?: string;

  status: PosterStatus;

  regenerationCount: number;

  aiLayout?: Record<string, unknown>;

  errorMessage?: string | undefined;

  createdAt: Date;
  updatedAt: Date;
}

const posterSchema = new Schema<Poster>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },

    formData: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      designation: {
        type: String,
        trim: true,
      },

      organization: {
        type: String,
        trim: true,
      },

      district: {
        type: String,
        required: true,
        trim: true,
      },

      occasion: {
        type: String,
        enum: ["victory", "tribute", "campaign"],
        required: true,
      },

      headline: {
        type: String,
        required: true,
        trim: true,
      },
    },

    photoUrls: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length >= 1 && value.length <= 3,
        message: "Poster must have between 1 and 3 photos",
      },
    },

    generatedImageUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: ["draft", "generating", "completed", "failed"],
      default: "draft",
    },

    regenerationCount: {
      type: Number,
      default: 0,
    },

    aiLayout: {
      type: Schema.Types.Mixed,
    },

    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Poster = mongoose.model<Poster>("Poster", posterSchema);
