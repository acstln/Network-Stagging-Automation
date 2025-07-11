import React, { useRef, useState } from "react";
import "../../common/CommonDeviceActions/CommonDeviceActions.css";
import CheckAvailability from "../../common/CommonDeviceActions/CheckAvailability";
// Vérifier que le chemin correspond exactement au nom du fichier
import DeleteDeviceButton from "../../common/CommonDeviceActions/DeleteDeviceButton";

// Liste des OS disponibles
const OS_OPTIONS = [
  { os: "IOS-XE", vendor: "Cisco" },
  { os: "IOS-XR", vendor: "Cisco" },
  { os: "NX-OS", vendor: "Cisco" },
  { os: "ACXOS", vendor: "Aruba" },
  { os: "JunOS", vendor: "Juniper" },
];

export default function DiscoveryDeviceActions({
  selected = [],
  devices = [],
  onRefresh,
  setSelected
}) {
  const [showOsMenu, setShowOsMenu] = useState(false);
  const [selectedOs, setSelectedOs] = useState(OS_OPTIONS[0]);
  const [showProvisionedPopup, setShowProvisionedPopup] = useState(false);
  const osBtnRef = useRef(null);

  // Fonction pour définir l'OS des devices sélectionnés
  const handleSetOs = async (osObj) => {
    setShowOsMenu(false);
    if (!osObj) return;
    
    // Vérifier si un appareil est déjà provisionné
    const provisioned = selected
      .map((id) => devices.find((d) => d.id === id))
      .find((d) => d && d.model && d.serial);
      
    if (provisioned) {
      setShowProvisionedPopup(true);
      return;
    }
    
    try {
      await Promise.all(
        selected.map((id) =>
          fetch(`http://127.0.0.1:8000/devices/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ os: osObj.os, vendor: osObj.vendor }),
          })
        )
      );
      
      // Rafraîchir après la mise à jour
      if (onRefresh) setTimeout(onRefresh, 400);
    } catch (error) {
      console.error("Erreur lors de la définition de l'OS:", error);
    }
  };

  // Fermer le menu OS si on clique ailleurs
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (osBtnRef.current && !osBtnRef.current.contains(event.target)) {
        setShowOsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [osBtnRef]);

  return (
    <div className="device-actions-group">
      <div className={`action-btn-dropdown-container${showOsMenu ? " active" : ""}`} ref={osBtnRef}>
        <button
          className="action-btn"
          type="button"
          disabled={selected.length === 0}
          onClick={() => selected.length > 0 && setShowOsMenu((v) => !v)}
        >
          Set OS
        </button>
        {showOsMenu && (
          <div className="action-btn-dropdown-menu">
            {OS_OPTIONS.map((os) => (
              <div
                key={os.os}
                className="action-btn-dropdown-option"
                onClick={() => handleSetOs(os)}
              >
                {os.os} ({os.vendor})
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Utiliser le nom correct du composant */}
      <DeleteDeviceButton 
        selected={selected} 
        onRefresh={onRefresh}
        setSelected={setSelected}
      />
      
      <CheckAvailability 
        devices={devices} 
        onRefresh={onRefresh}
        style={{ marginLeft: 8 }} 
      />

      {/* Popup d'avertissement pour les appareils provisionnés */}
      {showProvisionedPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Device Already Provisioned</h3>
            <p>
              One or more of the selected devices is already provisioned.
              <br />
              If you need to change a provisioned device, please delete it first
              and then add it again to restart the process.
            </p>
            <button
              className="btn btn-sm btn-collect"
              onClick={() => setShowProvisionedPopup(false)}
              style={{ marginTop: 16 }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}