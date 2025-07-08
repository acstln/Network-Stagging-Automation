import React, { useState } from "react";
import "./DiscoveryTimeline.css";
import DiscoveryNetScan from "./DiscoveryNetScan";
import DiscoveryCredentials from "./DiscoveryCredentials";
import DiscoveryDeviceType from "./DiscoveryDeviceType";
import DiscoverySoftwareUpload from "./DiscoverySoftwareUpload";
import DiscoveryCollectInfo from "./DiscoveryCollectInfo";

export default function StepTimeline({ scanResults, onResultsUpdate, project }) {
  const [credentials, setCredentials] = useState(null);
  const [deviceType, setDeviceType] = useState([]);
  const [stepsCompleted, setStepsCompleted] = useState({
    credentials: false,
    subnet: false,
    vendor: false,
    collect: false,
  });

  // Etape 1 : Discovery OK si au moins un device online
  const isDiscoveryCompleted = scanResults && scanResults.some((d) => d.status === "online");
  // Etape 2 : Credentials OK si renseignés
  const isCredentialsCompleted = !!credentials;
  // Etape 3 : Device type OK si au moins un type sélectionné
  const isDeviceTypeCompleted = deviceType && deviceType.length > 0;

  // Toutes les étapes (hors upload) doivent être completed
  const allDevicesHaveInfo = scanResults && scanResults.length > 0 && scanResults.every(
    d => d.model && d.serial && d.version
  );
  const allDevicesHaveOs = scanResults && scanResults.length > 0 && scanResults.every(
    d => d.os
  );
  const allStepsCompleted = isDiscoveryCompleted && isCredentialsCompleted && isDeviceTypeCompleted && allDevicesHaveOs;

  const handleDeviceTypeSelected = (models) => {
    setDeviceType(models);
  };

  const handleCollectInfo = async () => {
    if (!credentials || !credentials.username || !credentials.password) {
      alert("Please enter credentials first.");
      return;
    }
    const res = await fetch(`http://127.0.0.1:8000/projects/${project.id}/collect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });
    if (!res.ok) return { results: [{ status: "error", message: "Erreur réseau" }] };
    return await res.json();
  };

  const handleDiscover = () => {
    const allDevicesHaveInfo = scanResults.every(
      (d) => d.model && d.serial && d.version
    );
    if (
      isCredentialsCompleted &&
      isDiscoveryCompleted &&
      isDeviceTypeCompleted &&
      allDevicesHaveInfo
    ) {
      // Ne reset rien, tout est déjà complété
      return;
    }
    // Sinon, reset tous les steps et les states associés
    setStepsCompleted({
      credentials: false,
      subnet: false,
      vendor: false,
      collect: false,
    });
    setCredentials(null);
    setDeviceType([]);
    // Rafraîchit la liste après un petit délai pour laisser la BDD se mettre à jour
    setTimeout(() => {
      if (onResultsUpdate) onResultsUpdate();
    }, 700); // 700ms, ajuste si besoin
  };

  return (
    <div className="staggingTimeLine" style={{ margin: "48px auto 0 auto", display: "flex", gap: 32 }}>
      <div style={{ flex: 1 }}>
        <div className="step">
          <DiscoveryNetScan
            defaultSubnet="192.168.254.64/28"
            onResultsUpdate={onResultsUpdate}
            scanResults={scanResults}
            completed={isDiscoveryCompleted}
            project={project}
          />
        </div>
        <div className="step">
          <DiscoveryCredentials onSubmit={setCredentials} completed={isCredentialsCompleted} />
        </div>
        <div className="step">
          <DiscoveryDeviceType devices={scanResults} onDeviceTypeSelected={handleDeviceTypeSelected} completed={isDeviceTypeCompleted} />
        </div>
        <div className="step">
          <DiscoverySoftwareUpload onUpload={() => {}} />
        </div>
        <div className="step">
          <DiscoveryCollectInfo
            onCollect={handleCollectInfo}
            disabled={!allStepsCompleted}
            project={project}
            onResultsUpdate={onResultsUpdate}
          />
        </div>
      </div>
    </div>
  );
}