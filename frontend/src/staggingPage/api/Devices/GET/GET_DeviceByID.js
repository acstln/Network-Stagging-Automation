const API_URL = "http://127.0.0.1:8000";

/**
 * Récupère un device par son ID.
 */
export async function GET_DeviceById(id) {
  const res = await fetch(`${API_URL}/devices/${id}`);
  if (!res.ok) throw new Error("Device introuvable");
  return res.json();
}