import React, { useState, useEffect } from "react";
import DiscoverySubnetForm from "./DiscoverySubnetForm";
import DiscoveryStatusMessage from "./DiscoveryStatusMessage";

// Import des API calls
import POST_StartScan from "../../../api/Scan/POST_StartScan";
import GET_ScanProgress from "../../../api/Scan/GET_ScanProgress";
import POST_StopScan from "../../../api/Scan/POST_StopScan";

export default function DiscoveryNetScan({ 
  defaultSubnet, 
  onResultsUpdate, 
  scanResults, 
  completed, 
  project,
  setIsScanning // Nouvel argument
}) {
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
    
    // Signal le début du scan
    if (setIsScanning) setIsScanning(true);
    
    try {
      // Utilisation de l'API dédiée
      const data = await POST_StartScan(subnet, project.id);
      setScanId(data.scan_id);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      // Signal la fin du scan en cas d'erreur
      if (setIsScanning) setIsScanning(false);
    }
  };

  useEffect(() => {
    if (!scanId) return;
    
    const interval = setInterval(async () => {
      try {
        // Utilisation de l'API dédiée
        const data = await GET_ScanProgress(scanId);
        setScanProgress(data.progress);
        setScanned(data.scanned);
        setTotal(data.total);

        // À chaque tick du scan, actualiser le tableau
        if (onResultsUpdate) {
          console.log("Mise à jour des résultats pendant le scan");
          onResultsUpdate();
        }

        if (data.progress >= 100) {
          clearInterval(interval);
          setLoading(false);
          setScanId(null);
          
          // Signal la fin du scan quand il est complété
          if (setIsScanning) setIsScanning(false);
          
          // Actualisation finale après un délai
          setTimeout(() => {
            if (onResultsUpdate) onResultsUpdate();
          }, 1000);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de la progression:", err);
        clearInterval(interval);
        setLoading(false);
        if (setIsScanning) setIsScanning(false);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [scanId, setIsScanning, onResultsUpdate]);

  // Fonction pour stopper le scan
  const handleStopScan = async () => {
    if (!scanId) return;
    
    try {
      // Utilisation de l'API dédiée
      await POST_StopScan(scanId);
      setLoading(false);
      setScanId(null);
      
      // Signal la fin du scan lors de l'arrêt manuel
      if (setIsScanning) setIsScanning(false);
      
      // Ajoute un délai pour le rafraîchissement final
      setTimeout(() => {
        if (onResultsUpdate) onResultsUpdate();
      }, 1000);
    } catch (err) {
      console.error("Erreur lors de l'arrêt du scan:", err);
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
