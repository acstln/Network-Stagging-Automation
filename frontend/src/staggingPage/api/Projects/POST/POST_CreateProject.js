const API_URL = "http://127.0.0.1:8000";

/**
 * Crée un nouveau projet.
 */
export async function POST_CreateProject({ name, creator, description }) {
  const res = await fetch(`${API_URL}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      creator,
      description,
      created_at: new Date().toISOString()
    }),
  });
  if (!res.ok) throw new Error("Erreur lors de la création du projet");
  return res.json();
}