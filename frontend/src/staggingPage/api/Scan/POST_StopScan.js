/**
 * Arrête un scan en cours
 * @param {string} scanId - Identifiant du scan à arrêter
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export default async function POST_StopScan(scanId) {
  const res = await fetch(`http://127.0.0.1:8000/scan/stop/${scanId}`, {
    method: "POST"
  });
  
  if (!res.ok) {
    throw new Error("Erreur lors de l'arrêt du scan");
  }
  
  return res.json();
}