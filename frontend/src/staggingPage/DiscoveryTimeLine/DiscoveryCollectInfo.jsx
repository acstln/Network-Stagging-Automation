import React, { useState } from "react";
import "./DiscoveryCollectInfo.css";
import { collectSwitchInfo } from "../../api/collectInfo";

export default function CollectInfoStep({ onCollect, disabled, project, onResultsUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleCollect = async () => {
    if (!project?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await fetch(`http://127.0.0.1:8000/projects/${project.id}/collect`, { method: "POST" });
      if (onResultsUpdate) onResultsUpdate();
    } catch (error) {
      console.error("Error collecting info:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="h3 is-4">Collect Informations</h3>
      <span className="stepNumber">5</span>
      <button
        className="btn btn-sm btn-collect"
        type="button"
        onClick={handleCollect}
        disabled={disabled || loading}
      >
        {loading ? "Collecting..." : "Collect Informations"}
      </button>
    </div>
  );
}