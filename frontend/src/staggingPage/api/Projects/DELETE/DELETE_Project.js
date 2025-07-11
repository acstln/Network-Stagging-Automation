const API_URL = "http://127.0.0.1:8000";

/**
 * Supprime un projet par son ID.
 */
export async function DELETE_Project(id) {
  await fetch(`${API_URL}/projects/${id}`, { method: "DELETE" });
}