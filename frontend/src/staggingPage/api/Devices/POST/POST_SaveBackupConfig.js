/**
 * Sauvegarde la configuration d'un appareil dans la base de données
 * avec rotation automatique des 5 dernières configurations
 * 
 * @param {number} deviceId - ID de l'appareil
 * @param {string} config - Contenu de la configuration
 * @param {Object} options - Options supplémentaires
 * @param {string} options.comment - Commentaire facultatif sur cette sauvegarde
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export default async function POST_SaveBackupConfig(deviceId, config, options = {}) {
  const res = await fetch(`http://127.0.0.1:8000/devices/${deviceId}/backup_config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      config,
      max_backups: 5, // Paramètre pour limiter le nombre de configurations sauvegardées
      timestamp: new Date().toISOString(),
      comment: options.comment || `Backup du ${new Date().toLocaleString()}`
    }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Échec de la sauvegarde de la configuration");
  }
  
  return res.json();
}