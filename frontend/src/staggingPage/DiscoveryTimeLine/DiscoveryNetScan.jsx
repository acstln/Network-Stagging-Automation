import React, { useState, useEffect } from "react";
import DiscoverySubnetForm from "./DiscoverySubnetForm";
import DiscoveryStatusMessage from "./DiscoveryStatusMessage";

export default function DiscoveryNetScan({ defaultSubnet, onResultsUpdate, scanResults, completed, project }) {
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanned, setScanned] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  // Lance le scan
  const handleDiscover = async (subnet) => {
    if (!project) {
      setError("Aucun projet sélectionné");
      return;
    }
    setLoading(true);
    setError(null);
    setScanProgress(0);
    setScanned(0);
    setTotal(0);
    try {
      const res = await fetch("http://127.0.0.1:8000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subnet, project_id: project.id }),
      });
      if (!res.ok) throw new Error("Erreur lors du lancement du scan");
      const data = await res.json();
      setScanId(data.scan_id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Polling pour la progression et MAJ du tableau en live
  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/scan/progress/${scanId}`);
        const data = await res.json();
        setScanProgress(data.progress);
        setScanned(data.scanned);
        setTotal(data.total);

        if (onResultsUpdate) onResultsUpdate();

        if (data.progress >= 100) {
          clearInterval(interval);
          setLoading(false);
          setScanId(null); // <-- AJOUTE CETTE LIGNE
        }
      } catch (err) {
        setError("Erreur lors du suivi du scan");
        clearInterval(interval);
        setLoading(false);
        setScanId(null); // <-- AJOUTE CETTE LIGNE aussi ici
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [scanId, onResultsUpdate]);

  // Bouton stop scan (optionnel)
  const handleStopScan = async () => {
    if (!scanId) return;
    try {
      await fetch(`http://127.0.0.1:8000/scan/stop/${scanId}`, { method: "POST" });
      setLoading(false);
      setScanId(null);
    } catch (err) {
      setError("Erreur lors de l'arrêt du scan");
    }
  };

  return (
    <div>
      <h5>1. Scan réseau</h5>
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
