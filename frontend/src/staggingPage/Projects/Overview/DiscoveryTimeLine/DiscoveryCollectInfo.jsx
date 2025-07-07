import React, { useState } from "react";
import "./DiscoveryCollectInfo.css";

export default function CollectInfoStep({ onCollect, disabled, project, onResultsUpdate }) {
  const [loading, setLoading] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [collectErrors, setCollectErrors] = useState([]);

  const handleClick = async () => {
    setLoading(true);
    setShowCheck(false);
    setCollectErrors([]);
    const res = await onCollect();
    setLoading(false);

    if (res && res.results) {
      const errors = res.results.filter(r => r.status === "error");
      setCollectErrors(errors);
      if (errors.length === 0) {
        // Affiche la coche verte après le spinner, puis la masque après 5s
        setShowCheck(true);
        setTimeout(() => setShowCheck(false), 5000);
      }
    }
    if (onResultsUpdate) onResultsUpdate();
  };

  return (

    <>
      <div className="collect-header">
        <h3>Collect Informations</h3>
        <span className="stepNumber">5</span>
      </div>
      <div className="collect-btn-wrapper">
        
        <button
          className="btn btn-sm btn-collect"
          type="button"
          onClick={handleClick}
          disabled={disabled || loading}
          style={{ minWidth: 170 }}
        >
          {loading ? "Collecting..." : "Collect Informations"}
        </button>
        {loading && <span className="spinner" />}
        {!loading && <span className={`checkmark${showCheck ? " visible" : ""}`}>&#10003;</span>}
        {/* ...erreurs éventuelles... */}
      </div>
    </>
  );
}