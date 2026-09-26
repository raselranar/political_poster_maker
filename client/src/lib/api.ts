const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, options);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function getTemplates() {
  return apiRequest("/api/templates", {
    cache: "no-store",
  });
}

export async function uploadPhotos(files: File[], token: string) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("photos", file);
  });

  return apiRequest("/api/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

export async function createPoster(
  data: {
    templateId: string;
    name: string;
    designation?: string;
    organization?: string;
    district: string;
    occasion: string;
    headline: string;
    photoUrls: string[];
  },
  token: string,
) {
  return apiRequest("/api/posters", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

export async function getPoster(posterId: string, token: string) {
  return apiRequest(`/api/posters/${posterId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
}
