import React, { useState, useEffect } from "react";
import axios from "axios";
import SubnetForm from "./DiscoverySubnetForm";
import DiscoveryStatusMessage from "./DiscoveryStatusMessage";

export default function DiscoveryNetScan({ defaultSubnet, onResultsUpdate, scanResults }) {
  const [subnet, setSubnet] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanned, setScanned] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

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
        body: JSON.stringify({ subnet }),
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
      try {
        const res = await fetch(`http://127.0.0.1:8000/scan/progress/${scanId}`);
        const data = await res.json();
        setScanProgress(data.progress);
        setScanned(data.scanned);
        setTotal(data.total);

        const resResults = await fetch(`http://127.0.0.1:8000/scan/results/${scanId}`);
        const dataResults = await resResults.json();
        // Quand tu reçois des résultats :
        if (onResultsUpdate) {
          onResultsUpdate(dataResults.devices);
        }

        if (data.progress >= 100) {
          clearInterval(interval);
          setLoading(false);
          setScanId(null);
        }
      } catch (err) {
        setError("Erreur lors du polling");
        setLoading(false);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [scanId]);

  // Fonction pour stopper le scan
  const handleStopScan = async () => {
    if (!scanId) return;
    try {
      await axios.post("http://127.0.0.1:8000/scan/stop/" + scanId);
      setLoading(false);
      setScanId(null);
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

  // Pour la bulle :
  const hasOnlineDevice = scanResults.some(device => device.status === "online");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 2 }}>
        <h3 className="h3 is-4" style={{ margin: 0 }}>Device Discovery</h3>
        <span className={`stepNumber${hasOnlineDevice ? " completed" : ""}`}>1</span>
      </div>
      {/* Formulaire de scan */}
      <SubnetForm
        subnet={subnet}
        setSubnet={setSubnet}
        onDiscover={handleDiscover}
        loading={loading}
        defaultSubnet={defaultSubnet}
      />
      {/* Barre de progression et bouton Stop */}
      {loading && scanId && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <DiscoveryStatusMessage
            loading={loading}
            error={error}
            scanProgress={scanProgress}
            scanned={scanned}
            total={total}
          />
          <button
            type="button"
            className="btn btn-danger btn-sm"
            style={{ marginLeft: 8 }}
            onClick={handleStopScan}
          >
            Stop Scan
          </button>
        </div>
      )}
    </div>
  );
}
