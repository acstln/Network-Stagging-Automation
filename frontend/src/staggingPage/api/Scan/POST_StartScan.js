/**
 * Lance un scan réseau
 * @param {string} subnet - Sous-réseau à scanner (ex: 172.17.77.0/29)
 * @param {number} project_id - ID du projet
 * @returns {Promise<Object>} - Informations sur le scan démarré (scan_id)
 */
export default async function POST_StartScan(subnet, project_id) {
  const res = await fetch("http://127.0.0.1:8000/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subnet, project_id }),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Erreur lors du lancement du scan");
  }
  
  return res.json();
}