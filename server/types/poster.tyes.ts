export interface TextSlot {
  type: "headline" | "name" | "designation" | "organization" | "footer";
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontWeight?: number;
  align?: "left" | "center" | "right";
}
