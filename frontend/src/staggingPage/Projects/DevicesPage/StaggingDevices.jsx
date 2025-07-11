import React, { useState, useEffect, useCallback } from "react";
import "./StaggingDevices.css";
import "../common/CommonTable.css";
import DeviceActions from "./StaggingDeviceActions";
import StaggingMainContainer from "../common/StaggingMainContainer";
import CommonDeviceTable from "../common/CommonDeviceTable/CommonDeviceTable";

export default function StaggingDevices({ devices = [], refreshKey, onRefresh, projectId }) {
  // État pour suivre les opérations en cours sur chaque appareil
  const [deviceOperations, setDeviceOperations] = useState({});
  const [selected, setSelected] = useState([]); // Ajout pour gérer la sélection
  const [tableData, setTableData] = useState(devices); // État pour le tableau
  const [tableUpdateCounter, setTableUpdateCounter] = useState(0); // Compteur pour forcer la mise à jour
  const [operationStatus, setOperationStatus] = useState({ type: null, message: "" }); // État pour le statut des opérations

  // Mise à jour des données du tableau lorsque les props devices changent
  useEffect(() => {
    setTableData(devices);
  }, [devices]);

  // Fonction pour démarrer une opération sur des appareils
  const startOperation = (deviceIds) => {
    console.log("⚙️ Démarrage d'opération pour:", deviceIds);
    const updates = {};
    deviceIds.forEach(id => {
      updates[id] = { status: 'running' };
    });
    setDeviceOperations(prev => ({ ...prev, ...updates }));
  };

  // Fonction pour terminer une opération sur des appareils
  const completeOperation = (deviceIds, success = true) => {
    console.log("✓ Fin d'opération pour:", deviceIds, "succès:", success);
    const updates = {};
    deviceIds.forEach(id => {
      updates[id] = { status: success ? 'success' : 'error' };
    });
    setDeviceOperations(prev => ({ ...prev, ...updates }));
    
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

  // Fonction de rafraîchissement améliorée
  const fetchDevices = useCallback(async () => {
    try {
      console.log("Rafraîchissement des données d'appareils...");
      const response = await fetch(`http://127.0.0.1:8000/projects/${projectId}/devices`);
      const results = await response.json();
      
      // Mettre à jour les données et incrémenter le compteur (comme dans DiscoveryDevices)
      setTableData(results);
      setTableUpdateCounter(prev => prev + 1);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    }
  }, [projectId]);

  // Fonction qui sera appelée depuis StaggingDeviceActions
  const handleRefresh = () => {
    fetchDevices();
  };

  // Nouvelle fonction pour gérer les actions des appareils
  const handleAction = async (action, selectedDevices) => {
    if (action === "rediscover") {
      // Afficher l'indicateur de progression
      setOperationStatus({
        type: "running",
        message: `Redécouverte de ${selectedDevices.length} appareil(s)...`
      });
      
      // Démarrer l'opération au niveau du composant parent
      if (startOperation) startOperation(selected);
      
      // Demander les credentials
      const creds = await askCredentials();
      if (!creds) {
        // Annulation par l'utilisateur
        setOperationStatus({ type: null, message: "" });
        if (completeOperation) completeOperation(selected, false);
        return;
      }
      
      try {
        // Exécuter la redécouverte
        await rediscoverDevices({
          projectId,
          creds,
          selectedDevices
        });
        
        // Marqueur de succès pour l'indicateur par ligne
        if (completeOperation) completeOperation(selected, true);
        
        // Afficher un message de succès
        setOperationStatus({
          type: "success",
          message: `Redécouverte réussie de ${selectedDevices.length} appareil(s)!`
        });
        
        // Rafraîchir les données (avec un léger délai pour permettre au serveur de se mettre à jour)
        if (onRefresh) setTimeout(onRefresh, 300);
        
        // Effacer l'indicateur après 3 secondes
        setTimeout(() => {
          setOperationStatus({ type: null, message: "" });
        }, 3000);
      } catch (err) {
        console.error("Erreur lors de la redécouverte:", err);
        setOperationStatus({
          type: "error",
          message: `Erreur lors de la redécouverte: ${err.message}`
        });
        
        // Marquer l'opération comme échouée
        if (completeOperation) completeOperation(selected, false);
        
        // Effacer l'indicateur après 3 secondes
        setTimeout(() => {
          setOperationStatus({ type: null, message: "" });
        }, 3000);
      }
    }
  };

  return (
    <StaggingMainContainer>
      <CommonDeviceTable
        title="Device List"
        devices={tableData}
        actionComponent={(props) => (
          <DeviceActions 
            {...props} 
            startOperation={startOperation}
            completeOperation={completeOperation}
          />
        )}
        selected={selected}
        setSelected={setSelected}
        refreshKey={tableUpdateCounter} // Utiliser le compteur comme refreshKey
        onRefresh={handleRefresh}
        projectId={projectId}
        columns={["checkbox", "name", "ip", "status", "model", "serial", "version", "vendor", "os"]} 
        deviceOperations={deviceOperations}
        startOperation={startOperation}
        completeOperation={completeOperation}
      />
    </StaggingMainContainer>
  );
}