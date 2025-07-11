import GET_DeviceConfig from "../../../api/Devices/GET/GET_DeviceConfig";
import POST_SaveBackupConfig from "../../../api/Devices/POST/POST_SaveBackupConfig";

/**
 * Récupère et sauvegarde la configuration d'un appareil
 * 
 * @param {Object} device - L'appareil à sauvegarder
 * @param {Object} creds - Identifiants pour la connexion
 * @param {Object} options - Options supplémentaires
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export async function backupConfig({ device, creds, options = {} }) {
  try {
    // 1. Récupération de la configuration actuelle
    const configContent = await GET_DeviceConfig({ device, creds });
    
    // 2. Sauvegarde de la configuration dans la BD avec rotation
    const result = await POST_SaveBackupConfig(device.id, configContent, options);
    
    return {
      success: true,
      message: "Configuration sauvegardée avec succès",
      configCount: result.config_count || 1,
      timestamp: result.timestamp || new Date().toISOString(),
      ...result
    };
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la configuration:", error);
    throw new Error(error.message || "Échec de la sauvegarde de la configuration");
  }
}