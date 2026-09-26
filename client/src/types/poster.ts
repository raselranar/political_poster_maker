export interface Poster {
  _id: string;
  generatedImageUrl?: string;
  status: "draft" | "generating" | "completed" | "failed";
  errorMessage?: string;
  regenerationCount: number;
  formData: {
    name: string;
    designation?: string;
    organization?: string;
    district: string;
    occasion: string;
    headline: string;
  };
  photoUrls: string[];
  createdAt: string;
  updatedAt?: string;
}
