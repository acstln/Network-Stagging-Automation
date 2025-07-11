/**
 * Télécharge la configuration d'un appareil (version POST - recommandée)
 * Cette méthode est plus sécurisée car elle envoie les identifiants dans le corps de la requête.
 * 
 * @param {Object} device - L'appareil dont on veut télécharger la configuration
 * @param {Object} creds - Identifiants pour la connexion
 * @returns {Promise<string>} - Configuration de l'appareil
 */
export default async function POST_DownloadConfig({ device, creds }) {
  const res = await fetch(`http://127.0.0.1:8000/devices/${device.id}/download_config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: creds.username,
      password: creds.password,
    }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Échec du téléchargement de la configuration");
  }
  
  const data = await res.json();
  return data.config;
}