/**
 * Récupère la progression d'un scan en cours
 * @param {string} scanId - Identifiant du scan
 * @returns {Promise<Object>} - Progression du scan (progress, scanned, total)
 */
export default async function GET_ScanProgress(scanId) {
  const res = await fetch(`http://127.0.0.1:8000/scan/progress/${scanId}`);
  
  if (!res.ok) {
    throw new Error("Erreur lors de la récupération de la progression du scan");
  }
  
  return res.json();
}