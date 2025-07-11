const API_URL = "http://127.0.0.1:8000";

/**
 * Récupère la liste de tous les devices.
 */
export async function GET_DeviceList() {
  const res = await fetch(`${API_URL}/devices`);
  if (!res.ok) throw new Error("Erreur lors du chargement des devices");
  return res.json();
}