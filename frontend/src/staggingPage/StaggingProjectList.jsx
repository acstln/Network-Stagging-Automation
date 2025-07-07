import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProject, fetchProjects } from "../api/projects";

export default function StaggingProjectList({ projects, onCreate, onSelect }) {
  const [form, setForm] = useState({ name: "", creator: "", description: "" });
  const [projectsList, setProjects] = useState(projects);
  const navigate = useNavigate();

  useEffect(() => {
    const getProjects = async () => {
      const fetchedProjects = await fetchProjects();
      setProjects(fetchedProjects);
    };

    getProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name && form.creator) {
      const newProject = await createProject(form); // newProject.id vient du backend !
      setProjects([...projectsList, newProject]);
      setForm({ name: "", creator: "", description: "" });
      navigate(`/stagging/${newProject.id}`); // Utilise bien newProject.id ici
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Projets de stagging</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          placeholder="Nom du projet"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          placeholder="Créateur"
          value={form.creator}
          onChange={e => setForm(f => ({ ...f, creator: e.target.value }))}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <button type="submit">Créer</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Créateur</th>
            <th>Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {projectsList.map(p => (
            <tr key={p.id} onClick={() => navigate(`/stagging/${p.id}`)} style={{ cursor: "pointer" }}>
              <td>{p.name}</td>
              <td>{p.creator}</td>
              <td>{p.description}</td>
              <td>{p.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}