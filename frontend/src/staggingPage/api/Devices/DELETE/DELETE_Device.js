const API_URL = "http://127.0.0.1:8000";

/**
 * Supprime un device par son ID.
 */
export async function DELETE_Device(id) {
  await fetch(`${API_URL}/devices/${id}`, { method: "DELETE" });
}