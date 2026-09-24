export async function getTemplates() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/templates`);
  if (!res.ok) {
    throw new Error("Failed to fetch templates");
  }

  return res.json();
}
