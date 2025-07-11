/**
 * Vérifie la disponibilité des devices sélectionnés.
 * 
 * @param {Array} devices - Liste des devices à vérifier
 * @returns {Promise} - Résultat de l'opération
 */
export async function POST_CheckAvailability(devices) {
  try {
    // Extrait les IDs des devices à vérifier
    const deviceIds = devices.map(d => d.id).filter(id => id).join(',');
    
    // Utilise la méthode GET pour appeler l'endpoint
    const url = deviceIds 
      ? `http://127.0.0.1:8000/check-availability?device_ids=${deviceIds}`
      : 'http://127.0.0.1:8000/check-availability';
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("Erreur lors de la vérification de disponibilité");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur complète:", error);
    throw error;
  }
}