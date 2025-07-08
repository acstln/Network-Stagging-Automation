import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StaggingOverview from "./Overview/StaggingOverview";
import StaggingDevices from "./DevicesPage/StaggingDevices";
import "./StaggingProjectMenu.css";

export default function StaggingProjectPage() {
  const { projectId } = useParams(); // Récupère l'ID du projet depuis l'URL
  const navigate = useNavigate();    // Pour naviguer entre les pages
  const [project, setProject] = useState(null); // Stocke les infos du projet courant
  const [tab, setTab] = useState("overview");  // Onglet actif ("overview" ou "devices")
  const [refreshKey, setRefreshKey] = useState(0); // Clé pour forcer le refresh des tableaux

  // Fonction pour charger les infos du projet depuis l'API
  const fetchProject = () => {
    fetch(`http://127.0.0.1:8000/projects/${projectId}`)
      .then((res) => res.json())
      .then(setProject);
  };

  // Recharge le projet à chaque changement d'ID (donc à chaque changement de projet)
  useEffect(() => {
    fetchProject();
  }, [projectId]);


  // Gère le clic sur un onglet :
  // - Change l'onglet actif
  // - Incrémente refreshKey (pour forcer le refresh du tableau)
  // - Recharge les infos du projet (pour avoir les devices à jour)
  const handleTabClick = (tabName) => {
    setTab(tabName);
    setRefreshKey((prev) => prev + 1);
    fetchProject();
  };

  // Affiche un message de chargement si le projet n'est pas encore chargé
  if (!project) return <div>Chargement...</div>;

  return (
    <div>
      {/* Barre du haut avec le bouton retour, le nom du projet et les onglets */}
      <div className="project-tabs-bar">
        <button
          className="project-tab-back"
          onClick={() => navigate("/stagging")}
        >
          {/* Icône maison flat design SVG */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M3 9.5L10 4L17 9.5V16A1 1 0 0 1 16 17H4A1 1 0 0 1 3 16V9.5Z"
              stroke="#23272f"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <rect
              x="7"
              y="13"
              width="6"
              height="4"
              rx="1"
              fill="#f6f8fa"
              stroke="#23272f"
              strokeWidth="1"
            />
          </svg>
        </button>
        {/* Nom du projet affiché dans la barre */}
        <div className="project-name-navbar">{project.name}</div>
        {/* Onglets de navigation */}
        <div className="project-tabs">
          <button
            className={`project-tab${tab === "overview" ? " active" : ""}`}
            onClick={() => handleTabClick("overview")}
          >
            Overview
          </button>
          <button
            className={`project-tab${tab === "devices" ? " active" : ""}`}
            onClick={() => handleTabClick("devices")}
          >
            Devices
          </button>
        </div>
        <div style={{ flex: 1 }} />
      </div>
      {/* Contenu de la page : affiche l'onglet sélectionné */}
      <div className="project-content">
        {/* Onglet Overview : visible seulement si tab === "overview" */}
        <div style={{ display: tab === "overview" ? "block" : "none" }}>
          {/* Passe le projet et la clé de refresh au composant */}
          <StaggingOverview project={project} refreshKey={refreshKey} />
        </div>
        {/* Onglet Devices : visible seulement si tab === "devices" */}
        <div style={{ display: tab === "devices" ? "block" : "none" }}>
          {/* Passe la liste des devices et la clé de refresh au composant */}
          <StaggingDevices
            devices={project.devices}
            refreshKey={refreshKey}
            onRefresh={fetchProject} // <-- ajoute cette prop !
          />
        </div>
      </div>
    </div>
  );
}