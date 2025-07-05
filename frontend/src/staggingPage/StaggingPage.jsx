import React, { useState } from "react";
import DiscoveryResults from "./DiscoveryResults/DiscoveryTable";
import StepTimeline from "./DiscoveryTimeLine/DiscoveryTimeline";
import PresentationBlock from "./DiscoveryTimeLine/PresentationBlock";

export default function StaggingPage() {
  const [scanResults, setScanResults] = useState([]);

  const handleReset = () => setScanResults([]); // Reset function

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
          <StepTimeline scanResults={scanResults} onResultsUpdate={setScanResults} />
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
          <DiscoveryResults scanResults={scanResults} onReset={handleReset} />
        </div>
      </div>
    </div>
  );
}