const API_URL = "http://127.0.0.1:8000";

export async function createProject({ name, creator, description }) {
  const res = await fetch(`${API_URL}/projects/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      creator,
      description,
      created_at: new Date().toISOString()
    }),
  });
  if (!res.ok) throw new Error("Erreur lors de la création du projet");
  return res.json();
}

export async function fetchProjects() {
  const res = await fetch(`${API_URL}/projects/`);
  if (!res.ok) throw new Error("Erreur lors du chargement des projets");
  return res.json();
}

export async function fetchProjectById(id) {
  const res = await fetch(`${API_URL}/projects/${id}`);
  if (!res.ok) throw new Error("Projet introuvable");
  return res.json();
}

export async function deleteProject(id) {
  await fetch(`http://127.0.0.1:8000/projects/${id}`, { method: "DELETE" });
}