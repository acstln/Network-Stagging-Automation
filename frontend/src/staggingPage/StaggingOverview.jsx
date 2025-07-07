import React, { useState, useEffect } from "react";
import DiscoveryTable from "./DiscoveryResults/DiscoveryTable";
import DiscoveryTimeline from "./DiscoveryTimeLine/DiscoveryTimeline";
import PresentationBlock from "./DiscoveryTimeLine/PresentationBlock";

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
    <div
      id="stagging-main-container"
      style={{ minHeight: "100vh", marginTop: 10 }}
    >
      <PresentationBlock />
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          width: "90vw",
          margin: "0 auto",
          minHeight: 400,
        }}
      >
        {/* Bloc gauche (40%) */}
        <div
          id="discoveryTimeline"
          style={{
            flex: "0 0 39%",
            maxWidth: "39%",
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
        {/* Bloc centre (2%) */}
        <div
          style={{
            flex: "0 0 1%",
            maxWidth: "1%",
            minHeight: 400,
          }}
        />
        {/* Bloc droit (59%) */}
        <div
          id="discoveryResults"
          style={{
            flex: "0 0 60%",
            maxWidth: "60%",
            padding: 24,
            minHeight: 400,
            marginLeft: 1,
          }}
        >
          <DiscoveryTable scanResults={scanResults} onReset={fetchDevices} />
        </div>
      </div>
    </div>
  );
}