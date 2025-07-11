const API_URL = "http://127.0.0.1:8000";

/**
 * Récupère un projet par son ID.
 * @param {number|string} projectId - ID du projet à récupérer
 * @returns {Promise<Object>} - Données du projet
 */
export default async function GET_ProjectById(projectId) {
  try {
    const res = await fetch(`${API_URL}/projects/${projectId}`);

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${res.statusText || "Erreur réseau"}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération du projet ${projectId}:`, error);
    throw error;
  }
}

// Si vous avez besoin d'un export nommé également, vous pouvez faire:
export { GET_ProjectById };