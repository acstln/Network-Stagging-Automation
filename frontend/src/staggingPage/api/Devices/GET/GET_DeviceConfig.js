/**
 * Récupère la configuration d'un appareil
 * 
 * @param {Object} device - L'appareil dont on veut récupérer la configuration
 * @param {Object} creds - Identifiants pour la connexion
 * @returns {Promise<string>} - Configuration de l'appareil
 */
export default async function GET_DeviceConfig({ device, creds }) {
  const res = await fetch(`http://127.0.0.1:8000/devices/${device.id}/download_config`, {
    method: "POST", // On garde POST pour envoyer les identifiants de manière sécurisée
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: creds.username,
      password: creds.password,
    }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Échec de la récupération de la configuration");
  }
  
  const data = await res.json();
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data.config;
}