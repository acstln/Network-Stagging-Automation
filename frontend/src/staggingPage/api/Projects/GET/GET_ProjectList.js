const API_URL = "http://127.0.0.1:8000";

/**
 * Récupère la liste de tous les projets.
 */
export async function GET_ProjectList() {
  const res = await fetch(`${API_URL}/projects/`);
  if (!res.ok) throw new Error("Erreur lors du chargement des projets");
  return res.json();
}