import React, { useState, useEffect } from "react";
import "./StaggingDevices.css";
import "../common/CommonTable.css";
import DeviceActions from "./StaggingDeviceActions";
import StaggingMainContainer from "../common/StaggingMainContainer";
import CommonDeviceTable from "../common/CommonDeviceTable/CommonDeviceTable";

export default function StaggingDevices({ devices = [], refreshKey, onRefresh, projectId }) {
  // État pour suivre les opérations en cours sur chaque appareil
  const [deviceOperations, setDeviceOperations] = useState({});
  const [selected, setSelected] = useState([]); // Ajout pour gérer la sélection
  const [tableData, setTableData] = useState(devices); // Nouvel état pour le tableau

  // Mise à jour des données du tableau lorsque les props devices changent
  useEffect(() => {
    setTableData(devices);
  }, [devices]);

  // Fonction pour démarrer une opération sur des appareils
  const startOperation = (deviceIds) => {
    console.log("⚙️ Démarrage d'opération pour:", deviceIds);
    console.log("État avant:", deviceOperations);
    const updates = {};
    deviceIds.forEach(id => {
      updates[id] = { status: 'running' };
    });
    setDeviceOperations(prev => {
      const newState = { ...prev, ...updates };
      console.log("Nouvel état:", newState);
      return newState;
    });
  };

  // Fonction pour terminer une opération sur des appareils
  const completeOperation = (deviceIds, success = true) => {
    console.log("✓ Fin d'opération pour:", deviceIds, "succès:", success);
    console.log("État avant:", deviceOperations);
    const updates = {};
    deviceIds.forEach(id => {
      updates[id] = { status: success ? 'success' : 'error' };
    });
    setDeviceOperations(prev => {
      const newState = { ...prev, ...updates };
      console.log("Nouvel état:", newState);
      return newState;
    });
    
    // Effacer les indicateurs après 3 secondes
    setTimeout(() => {
      setDeviceOperations(prev => {
        const newState = { ...prev };
        deviceIds.forEach(id => {
          delete newState[id];
        });
        return newState;
      });
    }, 3000);
  };

  // Fonction de rafraîchissement personnalisée
  const handleRefresh = (type = "full") => {
    console.log("Refresh demandé, type:", type);
    
    if (type === "partial") {
      // Rafraîchissement partiel: faire une requête API pour obtenir les données à jour
      // sans recharger toute la page
      fetch(`http://127.0.0.1:8000/projects/${projectId}/devices`)
        .then(response => response.json())
        .then(updatedDevices => {
          console.log("Données mises à jour reçues:", updatedDevices.length, "appareils");
          // Mettre à jour uniquement les données du tableau
          setTableData(updatedDevices);
        })
        .catch(error => {
          console.error("Erreur lors du rafraîchissement partiel:", error);
          // En cas d'erreur, faire un rafraîchissement complet
          if (onRefresh) onRefresh();
        });
    } else {
      // Rafraîchissement complet: utiliser la fonction onRefresh fournie par le parent
      if (onRefresh) onRefresh();
    }
  };

  return (
    <StaggingMainContainer>
      <CommonDeviceTable
        title="Device List"
        devices={tableData} // Utiliser tableData au lieu de devices
        actionComponent={(props) => (
          <DeviceActions 
            {...props} 
            startOperation={startOperation}
            completeOperation={completeOperation}
          />
        )}
        selected={selected}
        setSelected={setSelected}
        refreshKey={refreshKey}
        onRefresh={handleRefresh} // Passer notre fonction handleRefresh
        projectId={projectId}
        columns={["checkbox", "name", "ip", "status", "model", "serial", "version", "vendor", "os"]} 
        deviceOperations={deviceOperations}
        startOperation={startOperation}
        completeOperation={completeOperation}
      />
    </StaggingMainContainer>
  );
}