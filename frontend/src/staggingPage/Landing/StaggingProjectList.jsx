import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { POST_CreateProject } from "../api/Projects/POST/POST_CreateProject";
import { GET_ProjectList } from "../api/Projects/GET/GET_ProjectList";
import { DELETE_Project } from "../api/Projects/DELETE/DELETE_Project";
import "./StaggingProjectList.css";
import ButtonTrash from "../../medias/ButtonTrash"; // Ajout de l'import
import PopupModal from "../../common/components/PopupModal";

export default function StaggingProjectList() {
  const [form, setForm] = useState({ name: "", creator: "", description: "" });
  const [projectsList, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getProjects = async () => {
      const fetchedProjects = await GET_ProjectList();
      setProjects(fetchedProjects);
    };
    getProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (form.name && form.creator) {
      const newProject = await POST_CreateProject(form);
      setProjects([...projectsList, newProject]);
      setForm({ name: "", creator: "", description: "" });
      setShowModal(false);
      navigate(`/stagging/${newProject.id}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await DELETE_Project(id);
    setProjects(projectsList.filter(p => p.id !== id));
  };

  return (
    <div className="stagging-projects-root">
      <div className="stagging-projects-header-vertical">
        <h2 className="stagging-projects-title">Stagging Projects</h2>
        <button className="btn-create-dark" onClick={() => setShowModal(true)}>
          + Create Stagging Project
        </button>
      </div>
      <div className="stagging-projects-tiles">
        {projectsList.length === 0 && (
          <div className="stagging-projects-empty">No projects yet.</div>
        )}
        {projectsList.map((p) => (
          <div className="stagging-project-tile" key={p.id} onClick={() => navigate(`/stagging/${p.id}`)}>
            <div className="tile-header">
              <span className="tile-logo" style={{marginRight: 10}}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7a2 2 0 0 1 2-2h4.172a2 2 0 0 1 1.414.586l1.828 1.828A2 2 0 0 0 13.828 8H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" fill="#bdbdbd"/>
                  <rect x="3" y="7" width="18" height="12" rx="2" stroke="#E4E4E4" strokeWidth="1.2" fill="none"/>
                </svg>
              </span>
              <span className="tile-title">{p.name}</span>
              <button
                className="tile-delete"
                title="Delete project"
                onClick={e => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
              >
                <span className="trash-icon" aria-label="delete">
                  {/* Utilisation du composant ButtonTrash */}
                  <ButtonTrash width={22} height={22} />
                </span>
              </button>
            </div>
            <div className="tile-meta">
              <span className="tile-author-badge">{p.creator}</span>
              <span className="tile-date">{p.createdAt}</span>
            </div>
            <div className="tile-desc">{p.description}</div>
          </div>
        ))}
      </div>
      {showModal && (
        <PopupModal open={showModal} title="Create a new Stagging Project" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Project name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              autoFocus
            />
            <input
              placeholder="Creator"
              value={form.creator}
              onChange={e => setForm(f => ({ ...f, creator: e.target.value }))}
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
            />
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-create"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </PopupModal>
      )}
      {confirmDeleteId && (
        <PopupModal open={!!confirmDeleteId} title="Delete Project" onClose={() => setConfirmDeleteId(null)}>
          <p>
            Are you sure you want to delete this project?<br />
            <span style={{ color: "#cf222e", fontWeight: 500 }}>This action cannot be undone.</span>
          </p>
          <div className="modal-actions">
            <button
              className="btn-cancel-dark"
              onClick={() => setConfirmDeleteId(null)}
            >
              Cancel
            </button>
            <button
              className="btn-delete-dark"
              onClick={async () => {
                await handleDelete(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
            >
              Delete
            </button>
          </div>
        </PopupModal>
      )}
    </div>
  );
}