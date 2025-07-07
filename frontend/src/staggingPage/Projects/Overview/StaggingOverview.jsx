import React, { useState, useEffect } from "react";
import DiscoveryTable from "./DiscoveryResults/DiscoveryTable";
import DiscoveryTimeline from "./DiscoveryTimeLine/DiscoveryTimeline";
import PresentationBlock from "./DiscoveryTimeLine/PresentationBlock";
import StaggingMainContainer from "../common/StaggingMainContainer";

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
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          width: "100%",
          margin: "0 auto",
          minHeight: 400,
        }}
      >
        {/* Bloc gauche */}
        <div
          id="discoveryTimeline"
          style={{
            flex: "0 0 40%",
            maxWidth: "40%",
            padding: 24,
            minHeight: 400,
            borderRight: "1px solid #d0d7de",
          }}
        >
          <DiscoveryTimeline
            scanResults={scanResults}
            onResultsUpdate={fetchDevices}
            project={project}
          />
        </div>
        {/* Espace */}
        <div
          style={{
            flex: "0 0 3%",
            maxWidth: "3%",
            minHeight: 400,
          }}
        />
        {/* Bloc droit */}
        <div
          id="discoveryResults"
          style={{
            flex: "0 0 57%",
            maxWidth: "57%",
            padding: 24,
            minHeight: 400,
            marginLeft: 1,
          }}
        >
          <DiscoveryTable scanResults={scanResults} onReset={fetchDevices} />
        </div>
      </div>
    </StaggingMainContainer>
  );
}