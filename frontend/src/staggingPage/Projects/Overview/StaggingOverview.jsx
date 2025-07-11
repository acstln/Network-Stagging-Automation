import React, { useState, useEffect, useCallback } from "react";
import DiscoveryTable from "./DiscoveryResults/DiscoveryDevices";
import DiscoveryTimeline from "./DiscoveryTimeLine/DiscoveryTimeline";
import PresentationBlock from "./DiscoveryTimeLine/PresentationBlock";
import StaggingMainContainer from "../common/StaggingMainContainer";
import { GET_DeviceList } from "../../api/Devices/GET/GET_DeviceList";
import "./StaggingOverview.css";

export default function StaggingOverview({ project, refreshKey }) {
  const [scanResults, setScanResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  // Ajout d'un compteur de mise à jour pour forcer le rendu du tableau
  const [tableUpdateCounter, setTableUpdateCounter] = useState(0);

  // Fonction pour récupérer les devices
  const fetchDevices = useCallback(async () => {
    try {
      console.log("Récupération des devices...");
      const results = await GET_DeviceList();
      console.log(`${results?.length || 0} devices récupérés`);
      setScanResults(results || []);

      // Incrémente le compteur pour forcer le rendu du tableau
      setTableUpdateCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur lors de la récupération des devices:", error);
      setScanResults([]);
    }
  }, []);

  // Charge les devices au chargement initial et quand refreshKey change
  useEffect(() => {
    fetchDevices();
  }, [refreshKey, fetchDevices]);

  // Gestion du rafraîchissement pendant le scan
  useEffect(() => {
    let intervalId = null;

    if (isScanning) {
      console.log("Scan en cours - Démarrage du rafraîchissement automatique");
      // Rafraîchissement immédiat puis toutes les 2 secondes
      fetchDevices();
      intervalId = setInterval(fetchDevices, 2000);
    }

    // Nettoyage à la fin du scan ou à la destruction du composant
    return () => {
      if (intervalId) {
        console.log("Arrêt du rafraîchissement automatique");
        clearInterval(intervalId);

        // Rafraîchissement final après l'arrêt du scan
        setTimeout(fetchDevices, 1000);
      }
    };
  }, [isScanning, fetchDevices]);

  // Fonction appelée lors du changement d'état du scan
  const handleScanStateChange = useCallback(
    (scanning) => {
      console.log("État du scan modifié:", scanning);
      setIsScanning(scanning);

      // Rafraîchissement immédiat au changement d'état
      fetchDevices();

      // Rafraîchissement final après la fin du scan
      if (!scanning) {
        setTimeout(fetchDevices, 1000);
      }
    },
    [fetchDevices]
  );

  return (
    <StaggingMainContainer>
      <PresentationBlock />
      <div className="stagging-overview-layout">
        {/* Bloc gauche */}
        <div className="stagging-overview-timeline" id="discoveryTimeline">
          <DiscoveryTimeline
            scanResults={scanResults}
            onResultsUpdate={fetchDevices}
            project={project}
            setIsScanning={handleScanStateChange}
          />
        </div>
        {/* Espace */}
        <div className="stagging-overview-spacer" />
        {/* Bloc droit */}
        <div className="stagging-overview-results" id="discoveryResults">
          <DiscoveryTable
            scanResults={scanResults} // Passer les résultats directement
            onReset={fetchDevices}
            refreshKey={tableUpdateCounter} // Utiliser le compteur comme refreshKey
          />
        </div>
      </div>
    </StaggingMainContainer>
  );
}