import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StaggingOverview from "./Overview/StaggingOverview";
import StaggingDevices from "./DevicesPage/StaggingDevices";
import "./StaggingProjectMenu.css";

export default function StaggingProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/projects/${projectId}`)
      .then((res) => res.json())
      .then(setProject);
  }, [projectId]);

  if (!project) return <div>Chargement...</div>;

  return (
    <div>
      <div className="project-tabs-bar">
        <button className="project-tab-back" onClick={() => navigate("/stagging")}>
          {/* Icône maison flat design SVG */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 9.5L10 4L17 9.5V16A1 1 0 0 1 16 17H4A1 1 0 0 1 3 16V9.5Z" stroke="#23272f" strokeWidth="1.5" strokeLinejoin="round"/>
            <rect x="7" y="13" width="6" height="4" rx="1" fill="#f6f8fa" stroke="#23272f" strokeWidth="1"/>
          </svg>
        </button>
        <div className="project-name-navbar">{project.name}</div>
        <div className="project-tabs">
          <button
            className={`project-tab${tab === "overview" ? " active" : ""}`}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          <button
            className={`project-tab${tab === "devices" ? " active" : ""}`}
            onClick={() => setTab("devices")}
          >
            Devices
          </button>
        </div>
        <div style={{ flex: 1 }} />
      </div>
      <div className="project-content">
        {tab === "overview" && <StaggingOverview project={project} />}
        {tab === "devices" && <StaggingDevices devices={project.devices} />}
      </div>
    </div>
  );
}