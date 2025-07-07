import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StaggingOverview from "./StaggingOverview";
import StaggingDevices from "./StaggingDevices";

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
    <div style={{ padding: 24 }}>
      <button onClick={() => navigate("/stagging")}>← Retour</button>
      <h2>{project.name}</h2>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setTab("overview")}
          style={{ fontWeight: tab === "overview" ? "bold" : "normal" }}
        >
          Overview
        </button>
        <button
          onClick={() => setTab("devices")}
          style={{
            fontWeight: tab === "devices" ? "bold" : "normal",
            marginLeft: 8,
          }}
        >
          Devices
        </button>
      </div>
      {tab === "overview" && <StaggingOverview project={project} />}
      {tab === "devices" && <StaggingDevices devices={project.devices || []} />}
    </div>
  );
}