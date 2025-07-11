import GET_DeviceConfig from "../../../api/Devices/GET/GET_DeviceConfig";

/**
 * Télécharge la configuration d'un appareil
 * 
 * @param {Object} device - L'appareil dont on veut télécharger la configuration
 * @param {Object} creds - Identifiants pour la connexion
 * @returns {Promise<void>}
 */
export async function downloadConfig({ device, creds }) {
  try {
    // Récupération de la configuration via l'API
    const configContent = await GET_DeviceConfig({ device, creds });
    
    // Création d'un blob pour le téléchargement
    const blob = new Blob([configContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    
    // Création d'un lien de téléchargement et déclenchement
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `config_${device.hostname || device.ip}_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Nettoyage
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return configContent;
  } catch (error) {
    console.error("Erreur lors du téléchargement de la configuration:", error);
    throw error;
  }
}