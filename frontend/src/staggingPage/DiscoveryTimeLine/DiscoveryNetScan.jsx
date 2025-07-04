import React, { useState, useEffect } from "react";
import SubnetForm from "./DiscoverySubnetForm";
import DiscoveryStatusMessage from "./DiscoveryStatusMessage";

export default function NetScan({ defaultSubnet, onResultsUpdate }) {
  const [subnet, setSubnet] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanned, setScanned] = useState(0);
  const [total, setTotal] = useState(0);
  const [scanResults, setScanResults] = useState([]);
  const [error, setError] = useState(null);

  const handleDiscover = async (subnet) => {
    setLoading(true);
    setError(null);
    setScanResults([]);
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
        setScanResults(dataResults.devices);
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

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 32 }}>
      <div style={{ flex: 1 }}>
        <span className="stepNumber">1</span>
        <SubnetForm
          subnet={subnet}
          setSubnet={setSubnet}
          onDiscover={handleDiscover}
          loading={loading}
          defaultSubnet={defaultSubnet}
        />
        <DiscoveryStatusMessage
          loading={loading}
          error={error}
          scanProgress={scanProgress}
          scanned={scanned}
          total={total}
        />
      </div>
    </div>
  );
}
