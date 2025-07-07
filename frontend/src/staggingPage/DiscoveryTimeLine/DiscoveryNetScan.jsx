import React, { useState, useEffect } from "react";
import axios from "axios";
import DiscoverySubnetForm from "./DiscoverySubnetForm";
import DiscoveryStatusMessage from "./DiscoveryStatusMessage";


export default function DiscoveryNetScan({ defaultSubnet, onResultsUpdate, scanResults, completed, project }) {
  const [subnet, setSubnet] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanned, setScanned] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [scanSaved, setScanSaved] = useState(false);

  const handleDiscover = async (subnet) => {
    setLoading(true);
    setError(null);
    setScanProgress(0);
    setScanned(0);
    setTotal(0);
    try {
      const res = await fetch("http://127.0.0.1:8000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subnet, project_id: project.id }), // <-- ajoute project_id ici
      });
      if (!res.ok) throw new Error("Erreur lors du lancement du scan");
      const data = await res.json();
      setScanId(data.scan_id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!scanId) return;
    const interval = setInterval(async () => {
      const res = await fetch(`http://127.0.0.1:8000/scan/progress/${scanId}`);
      const data = await res.json();
      setScanProgress(data.progress);
      setScanned(data.scanned);
      setTotal(data.total);

      // Rafraîchir le tableau à chaque tick
      if (onResultsUpdate) onResultsUpdate();

      if (data.progress >= 100) {
        clearInterval(interval);
        setLoading(false);
        setScanId(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [scanId, onResultsUpdate]);

  // Fonction pour stopper le scan
  const handleStopScan = async () => {
    if (!scanId) return;
    try {
      await axios.post("http://127.0.0.1:8000/scan/stop/" + scanId);
      setLoading(false);
      setScanId(null);
      // Ajoute un petit délai avant le refresh
      setTimeout(() => {
        if (onResultsUpdate) onResultsUpdate();
      }, 500); // 500ms, ajuste si besoin
    } catch (err) {
      // Optionnel : afficher une erreur
    }
  };

  const handleReset = () => {
    setSubnet("");
    setScanId(null);
    setScanProgress(0);
    setScanned(0);
    setTotal(0);
    setError(null);
    if (onResultsUpdate) {
      onResultsUpdate([]); // Vide les résultats dans le parent
    }
  };

  // Affiche TOUJOURS le formulaire
  return (
    <div>
      <div className="credentials-header">
        <h3 className="h3 is-4" style={{ margin: 0 }}>Scan réseau</h3>
        {error && (
          <div className="credentials-message" style={{ background: "#ffdce0", color: "#cf222e", border: "1px solid #ffb3b3" }}>
            {error}
          </div>
        )}
      </div>
      <span className={`stepNumber${completed ? " completed" : ""}`}>1</span>
      <DiscoverySubnetForm
        onDiscover={handleDiscover}
        loading={loading}
      />
      <DiscoveryStatusMessage
        loading={loading}
        error={error}
        scanProgress={scanProgress}
        scanned={scanned}
        total={total}
      />
      {loading && (
        <button
          type="button"
          style={{
            marginTop: 12,
            background: "#cf222e",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 18px",
            fontWeight: 600,
            cursor: "pointer"
          }}
          onClick={handleStopScan}
        >
          Stop Scan
        </button>
      )}
    </div>
  );
}
