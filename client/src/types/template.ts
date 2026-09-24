export type OccasionType = "victory" | "tribute" | "campaign";

export interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
}

export interface TextSlot {
  type: "headline" | "name" | "designation" | "organization" | "footer";

  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight?: string;
  align?: "left" | "center" | "right";
}

export interface Template {
  _id: string;
  title: string;
  occasionType: OccasionType;
  thumbnailUrl: string;

  layoutConfig: {
    width: number;
    height: number;
    backgroundColor: string;
    photoSlots: PhotoSlot[];
    textSlots: TextSlot[];
  };

  isActive: boolean;
}
