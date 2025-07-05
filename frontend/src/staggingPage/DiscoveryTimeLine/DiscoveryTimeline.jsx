import React, { useState } from "react";
import "./DiscoveryTimeline.css";
import DiscoveryNetScan from "./DiscoveryNetScan";
import DiscoveryCredentials from "./DiscoveryCredentials";
import DiscoveryDeviceType from "./DiscoveryDeviceType";
import DiscoverySoftwareUpload from "./DiscoverySoftwareUpload";
import DiscoveryCollectInfo from "./DiscoveryCollectInfo";
import { collectSwitchInfo } from "../../api/collectInfo";

export default function StepTimeline({ scanResults, onResultsUpdate }) {
  const [credentials, setCredentials] = useState(null);
  const [deviceType, setDeviceType] = useState([]);

  // Etape 1 : Discovery OK si au moins un device online
  const isDiscoveryCompleted = scanResults && scanResults.some((d) => d.status === "online");
  // Etape 2 : Credentials OK si renseignés
  const isCredentialsCompleted = !!credentials;
  // Etape 3 : Device type OK si au moins un type sélectionné
  const isDeviceTypeCompleted = deviceType && deviceType.length > 0;

  // Toutes les étapes (hors upload) doivent être completed
  const allStepsCompleted = isDiscoveryCompleted && isCredentialsCompleted && isDeviceTypeCompleted;

  const handleDeviceTypeSelected = (models) => {
    setDeviceType(models);
  };

  const handleCollectInfo = async () => {
    // Choisis l'IP à collecter (exemple : le premier device online)
    const selectedDevice = scanResults.find(d => d.status === "online");
    if (!selectedDevice || !credentials || !deviceType.length) return;

    // Récupère l'OS détecté pour ce device
    const selectedOs = deviceType[0].os; // ou adapte selon ton modèle
    try {
      const info = await collectSwitchInfo(
        selectedDevice.ip,
        credentials.username,
        credentials.password,
        selectedOs
      );
      // Mets à jour le tableau
      onResultsUpdate(scanResults.map(d =>
        d.ip === selectedDevice.ip
          ? { ...d, model: info.model, serial: info.serial, version: info.version }
          : d
      ));
    } catch (e) {
      alert("Erreur lors de la collecte : " + e.message);
    }
  };

  return (
    <div className="staggingTimeLine" style={{ margin: "48px auto 0 auto", display: "flex", gap: 32 }}>
      <div style={{ flex: 1 }}>
        <div className="timeLine__heading">
          <h4>Staging Steps</h4>
        </div>
        <div className="step">
          <DiscoveryNetScan
            defaultSubnet="192.168.254.64/28"
            onResultsUpdate={onResultsUpdate}
            scanResults={scanResults}
            completed={isDiscoveryCompleted}
          />
        </div>
        <div className="step">
          <DiscoveryCredentials onSubmit={setCredentials} completed={isCredentialsCompleted} />
        </div>
        <div className="step">
          <DiscoveryDeviceType onDeviceTypeSelected={handleDeviceTypeSelected} completed={isDeviceTypeCompleted} />
        </div>
        <div className="step">
          <DiscoverySoftwareUpload onUpload={() => {}} />
        </div>
        <div className="step">
          <DiscoveryCollectInfo
            onCollect={handleCollectInfo}
            disabled={!allStepsCompleted}
          />
        </div>
      </div>
    </div>
  );
}