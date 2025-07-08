import React, { useState, useEffect } from "react";
import DiscoveryTable from "./DiscoveryResults/DiscoveryDevices";
import DiscoveryTimeline from "./DiscoveryTimeLine/DiscoveryTimeline";
import PresentationBlock from "./DiscoveryTimeLine/PresentationBlock";
import StaggingMainContainer from "../common/StaggingMainContainer";
import "./StaggingOverview.css"; // <-- Ajoute l'import CSS

export default function StaggingOverview({ project }) {
  const [scanResults, setScanResults] = useState([]);

  // Fonction pour charger les devices du projet
  const fetchDevices = () => {
    if (!project?.id) return;
    fetch(`http://127.0.0.1:8000/projects/${project.id}/devices`)
      .then((res) => res.json())
      .then((results) => setScanResults(results || []));
  };

  useEffect(() => {
    fetchDevices();
  }, [project]);

  return (
    <StaggingMainContainer>
      <PresentationBlock />
      <div className="stagging-overview-layout">
        {/* Bloc gauche */}
        <div className="stagging-overview-timeline" id="discoveryTimeline">
          <DiscoveryTimeline
            scanResults={scanResults}
            onResultsUpdate={fetchDevices}
            project={project}
          />
        </div>
        {/* Espace */}
        <div className="stagging-overview-spacer" />
        {/* Bloc droit */}
        <div className="stagging-overview-results" id="discoveryResults">
          <DiscoveryTable scanResults={scanResults} onReset={fetchDevices} />
        </div>
      </div>
    </StaggingMainContainer>
  );
}