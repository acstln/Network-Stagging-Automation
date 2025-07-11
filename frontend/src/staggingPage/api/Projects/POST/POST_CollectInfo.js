/**
 * Démarre la collecte d'informations pour un projet
 * @param {number} projectId - ID du projet
 * @param {Object} credentials - Identifiants pour la connexion aux appareils
 * @returns {Promise<Object>} - Résultats de la collecte
 */
export default async function POST_CollectInfo(projectId, credentials) {
  const res = await fetch(`http://127.0.0.1:8000/projects/${projectId}/collect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });
  
  if (!res.ok) {
    return { results: [{ status: "error", message: `Erreur ${res.status}: ${res.statusText || "Erreur réseau"}` }] };
  }
  
  return res.json();
}