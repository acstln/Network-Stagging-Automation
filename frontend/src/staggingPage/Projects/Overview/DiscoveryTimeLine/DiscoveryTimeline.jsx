import React, { useState } from "react";
import "./DiscoveryTimeline.css";
import DiscoveryNetScan from "./DiscoveryNetScan";
import DiscoveryCredentials from "./DiscoveryCredentials";
import DiscoveryDeviceType from "./DiscoveryDeviceType";
import DiscoverySoftwareUpload from "./DiscoverySoftwareUpload";
import DiscoveryCollectInfo from "./DiscoveryCollectInfo";
// Import de l'API extraite
import POST_CollectInfo from "../../../api/Projects/POST/POST_CollectInfo";

/**
 * Composant principal pour la timeline de découverte
 * Gère la progression à travers les différentes étapes du processus de découverte
 */
export default function DiscoveryTimeline({ scanResults, onResultsUpdate, project, setIsScanning }) {
  // État pour stocker les identifiants entrés par l'utilisateur
  const [credentials, setCredentials] = useState(null);
  
  // État pour stocker les types d'appareils sélectionnés
  const [deviceType, setDeviceType] = useState([]);
  
  // Évaluation de la complétion des étapes
  
  // Étape 1: Découverte réussie si au moins un appareil est en ligne
  const isDiscoveryCompleted = scanResults && scanResults.some((d) => d.status === "online");
  
  // Étape 2: Identifiants fournis
  const isCredentialsCompleted = !!credentials;
  
  // Étape 3: Au moins un type d'appareil sélectionné
  const isDeviceTypeCompleted = deviceType && deviceType.length > 0;
  
  // Vérification que tous les appareils ont les informations nécessaires
  const allDevicesHaveInfo = scanResults && scanResults.length > 0 && scanResults.every(
    d => d.model && d.serial && d.version
  );
  
  // Vérification que tous les appareils ont un OS défini
  const allDevicesHaveOs = scanResults && scanResults.length > 0 && scanResults.every(
    d => d.os
  );
  
  // Toutes les étapes requises sont complétées
  const allStepsCompleted = isDiscoveryCompleted && isCredentialsCompleted && 
                            isDeviceTypeCompleted && allDevicesHaveOs;

  /**
   * Gère la sélection des types d'appareils
   * @param {Array} models - Les modèles sélectionnés
   */
  const handleDeviceTypeSelected = (models) => {
    setDeviceType(models);
  };

  /**
   * Démarre la collecte d'informations sur les appareils
   * @returns {Promise<Object>} - Résultats de la collecte
   */
  const handleCollectInfo = async () => {
    if (!credentials || !credentials.username || !credentials.password) {
      alert("Please enter credentials first.");
      return;
    }
    
    // Utilisation de l'API extraite
    return await POST_CollectInfo(project.id, credentials);
  };

  return (
    <div className="staggingTimeLine" style={{ margin: "48px auto 0 auto", display: "flex", gap: 32 }}>
      <div style={{ flex: 1 }}>
        {/* Étape 1: Scan réseau */}
        <div className="step">
          <DiscoveryNetScan
            defaultSubnet="172.17.77.0/29" // Subnet prérempli comme demandé
            onResultsUpdate={onResultsUpdate}
            scanResults={scanResults}
            completed={isDiscoveryCompleted}
            project={project}
            setIsScanning={setIsScanning}
          />
        </div>
        
        {/* Étape 2: Saisie des identifiants */}
        <div className="step">
          <DiscoveryCredentials 
            onSubmit={setCredentials} 
            completed={isCredentialsCompleted} 
          />
        </div>
        
        {/* Étape 3: Définition des types d'appareils */}
        <div className="step">
          <DiscoveryDeviceType 
            devices={scanResults} 
            onDeviceTypeSelected={handleDeviceTypeSelected} 
            completed={isDeviceTypeCompleted} 
          />
        </div>
        
        {/* Étape 4: Téléchargement de logiciels (optionnel) */}
        <div className="step">
          <DiscoverySoftwareUpload onUpload={() => {}} />
        </div>
        
        {/* Étape 5: Collecte d'informations */}
        <div className="step">
          <DiscoveryCollectInfo
            onCollect={handleCollectInfo}
            disabled={!allStepsCompleted}
            project={project}
            onResultsUpdate={onResultsUpdate}
          />
        </div>
      </div>
    </div>
  );
}