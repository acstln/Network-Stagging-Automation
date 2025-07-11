import React, { useState, useRef, useEffect } from "react";
import "../common/CommonDeviceActions/CommonDeviceActions.css";
import "../common/CommonDeviceTable/OperationIndicator.css";
import { rediscoverDevices } from "./DeviceOperations/rediscover";
import { checkAvailability } from "./DeviceOperations/checkAvailability";
import { downloadConfig } from "./DeviceOperations/DownloadConfig";
import { backupConfig } from "./DeviceOperations/BackupConfig";
import ErrorModal from "../../../common/components/ErrorModal";
import ButtonTrash from "../../../medias/ButtonTrash";
import ButtonExport from "../../../medias/ButtonExport";
import ButtonGear from "../../../medias/ButtonGear";
import ButtonCheckAvailability from "../../../medias/ButtonReload";
import PopupModal from "../../../common/components/PopupModal";
import CheckAvailability from "../common/CommonDeviceActions/CheckAvailability";
import DeleteButton from "../common/CommonDeviceActions/DeleteDeviceButton";

// Nouveau composant pour l'icône "refresh/check"
function RefreshCircleIcon({ width = 22, height = 22, color = "#0969da", style = {} }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12a9 9 0 1 1-2.648-6.352" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 5h2.5a.5.5 0 0 1 .5.5V8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

function toCSV(devices) {
  if (!devices.length) return "";
  const headers = [
    "IP", "Status", "Nom", "Model", "Serial", "Version", "Vendor", "OS", "Sélectionné"
  ];
  const rows = devices.map(d => [
    d.ip,
    d.status,
    d.name,
    d.model,
    d.serial,
    d.version,
    d.vendor,
    d.os,
    d.selected ? "Oui" : "Non"
  ]);
  return [
    headers.join(","),
    ...rows.map(row =>
      row.map(val =>
        typeof val === "string" && (val.includes(",") || val.includes('"'))
          ? `"${val.replace(/"/g, '""')}"`
          : val ?? ""
      ).join(",")
    ),
  ].join("\r\n");
}

function CredentialsModal({ open, onSubmit, onCancel }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <PopupModal open={open} title="Authentification SSH" onClose={onCancel}>
      <label>
        Username
        <input
          autoFocus
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      <div className="modal-actions">
        
        <button
          className="btn-cancel"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="btn-create"
          onClick={() => onSubmit({ username, password })}
          disabled={!username || !password}
          type="button"
        >
          Validate
        </button>
      </div>
    </PopupModal>
  );
}

export default function StaggingDeviceActions({ 
  selected, 
  devices = [], 
  onRefresh, 
  setSelected, 
  projectId,
  startOperation,
  completeOperation 
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [credModalOpen, setCredModalOpen] = useState(false); // <-- Correction ici
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [checking, setChecking] = useState(false); // Ajout état pour l'animation
  const [exportAnimating, setExportAnimating] = useState(false);
  const [operationStatus, setOperationStatus] = useState({ type: null, message: "" }); // Nouvel état pour le statut de l'opération
  const credPromiseRef = useRef();
  const exportBtnRef = useRef(null);
  const actionsBtnRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        (exportBtnRef.current && exportBtnRef.current.contains(event.target)) ||
        (actionsBtnRef.current && actionsBtnRef.current.contains(event.target))
      ) {
        return;
      }
      
      // Si clic en dehors, fermer les menus
      setShowExportMenu(false);
      setShowActionsMenu(false);
    }
    
    // N'ajouter l'écouteur que lorsqu'un menu est ouvert
    if (showExportMenu || showActionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showExportMenu, showActionsMenu]);

  // Ajouter au début du composant pour vérifier les props reçues
  useEffect(() => {
    console.log("DeviceActions - Props reçues:", { 
      selected, 
      devicesCount: devices.length, 
      hasStartOperation: !!startOperation, 
      hasCompleteOperation: !!completeOperation 
    });
  }, [selected, devices, startOperation, completeOperation]);

  const selectedDevices = devices.filter(d => selected.includes(d.id || d.ip));
  const allSameOS = selectedDevices.length > 0 && selectedDevices.every(d => d.os === selectedDevices[0].os);
  const isJunOS = allSameOS && selectedDevices[0]?.os?.toLowerCase().includes("junos");

  async function askCredentials() {
    setCredModalOpen(true);
    return new Promise((resolve) => {
      credPromiseRef.current = resolve;
    });
  }

  function handleCredSubmit(creds) {
    setCredModalOpen(false);
    credPromiseRef.current && credPromiseRef.current(creds);
  }

  function handleCredCancel() {
    setCredModalOpen(false);
    credPromiseRef.current && credPromiseRef.current(null);
  }

  // Modifiez la fonction handleAction pour qu'elle gère les indicateurs
  const handleAction = async (action) => {
    console.log("Action sélectionnée:", action);
    setShowActionsMenu(false);
    
    console.log("Props disponibles:", { selected, startOperation, completeOperation });
    
    const selectedDevices = devices.filter(d => selected.includes(d.id));
    console.log("Appareils sélectionnés:", selectedDevices);
    
    if (!selectedDevices.length) return;
    
    try {
      if (action === "rediscover") {
        // Afficher l'indicateur de progression
        setOperationStatus({
          type: "running",
          message: `Redécouverte de ${selectedDevices.length} appareil(s)...`
        });
        
        // Démarrer l'opération au niveau du composant parent pour l'indicateur par ligne
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
          
          // Utiliser la même approche que checkAvailability:
          // Faire un refresh normal mais avec un délai pour permettre
          // aux modifications d'être enregistrées côté serveur
          if (onRefresh) {
            setTimeout(() => {
              onRefresh(); // Refresh standard
            }, 700);
          }
          
          // Effacer l'indicateur après 3 secondes
          setTimeout(() => {
            setOperationStatus({ type: null, message: "" });
          }, 3000);
        } catch (err) {
          // Gestion d'erreur (inchangée)
          setErrorMessage(err.message);
          setErrorModalOpen(true);
          
          // Afficher un message d'erreur
          setOperationStatus({
            type: "error",
            message: `Erreur lors de la redécouverte: ${err.message.substring(0, 50)}...`
          });
          
          if (completeOperation) completeOperation(selected, false);
          
          // Effacer l'indicateur après 5 secondes
          setTimeout(() => {
            setOperationStatus({ type: null, message: "" });
          }, 5000);
        }
      } else if (action === "download-config") {
        // Même structure...
        setOperationStatus({
          type: "running",
          message: `Téléchargement de la configuration de ${selectedDevices.length} appareil(s)...`
        });
        
        if (startOperation) startOperation(selected);
        
        const creds = await askCredentials();
        if (!creds) {
          setOperationStatus({ type: null, message: "" });
          if (completeOperation) completeOperation(selected, false);
          return;
        }
        
        try {
          for (const device of selectedDevices) {
            const config = await downloadConfig({ device, creds });
            downloadFile(
              `config_${device.name || device.ip || device.id}.txt`,
              config,
              "text/plain"
            );
          }
          
          setOperationStatus({
            type: "success",
            message: `Configuration téléchargée avec succès!`
          });
          
          if (completeOperation) completeOperation(selected, true);
          
          setTimeout(() => {
            setOperationStatus({ type: null, message: "" });
          }, 3000);
        } catch (e) {
          setErrorMessage(e.message);
          setErrorModalOpen(true);
          
          setOperationStatus({
            type: "error",
            message: `Erreur lors du téléchargement: ${e.message.substring(0, 50)}...`
          });
          
          if (completeOperation) completeOperation(selected, false);
          
          setTimeout(() => {
            setOperationStatus({ type: null, message: "" });
          }, 5000);
        }
      } else if (action === "backup-config") {
        // Afficher l'indicateur de progression
        setOperationStatus({
          type: "running",
          message: `Sauvegarde de la configuration de ${selectedDevices.length} appareil(s)...`
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
          for (const device of selectedDevices) {
            await backupConfig({ device, creds });
          }
          
          
          // Afficher un message de succès
          setOperationStatus({
            type: "success",
            message: `Configuration sauvegardée avec succès!`
          });
          
          // Marquer l'opération comme terminée avec succès
          if (completeOperation) completeOperation(selected, true);
          
          // Effacer l'indicateur après 3 secondes
          setTimeout(() => {
            setOperationStatus({ type: null, message: "" });
          }, 3000);
        } catch (e) {
          // Afficher l'erreur
          setErrorMessage(e.message);
          setErrorModalOpen(true);
          
          // Afficher un message d'erreur
          setOperationStatus({
            type: "error",
            message: `Erreur lors de la sauvegarde: ${e.message.substring(0, 50)}...`
          });
          
          // Marquer l'opération comme terminée avec échec
          if (completeOperation) completeOperation(selected, false);
          
          // Effacer l'indicateur après 5 secondes
          setTimeout(() => {
            setOperationStatus({ type: null, message: "" });
          }, 5000);
        }
      } else if (action === "rename") {
        // Traitement pour renommer les appareils sélectionnés
        if (!selectedDevices.length) return;
        
        // Demander le nouveau nom
        const newName = prompt("Entrez le nouveau nom pour le(s) appareil(s) sélectionné(s):", 
                              selectedDevices.length === 1 ? selectedDevices[0].name || "" : "");
        
        if (newName === null) return; // L'utilisateur a annulé
        
        try {
          // Mettre à jour chaque appareil sélectionné
          await Promise.all(selectedDevices.map(device => 
            fetch(`http://127.0.0.1:8000/devices/${device.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: newName }),
            })
          ));
          
          // Rafraîchir la liste des appareils
          if (onRefresh) setTimeout(onRefresh, 200);
          // Marquer l'opération comme terminée avec succès
          if (completeOperation) completeOperation(selected, true);
        } catch (e) {
          setErrorMessage("Erreur lors du renommage: " + e.message);
          setErrorModalOpen(true);
          // Marquer l'opération comme terminée avec échec
          if (completeOperation) completeOperation(selected, false);
        }
        return;
      } else {
        alert(`Action "${action}" sur ${selectedDevices.length} device(s)`);
        // Marquer l'opération comme terminée avec succès
        if (completeOperation) completeOperation(selected, true);
      }
    } catch (error) {
      console.error(`Erreur lors de l'action ${action}:`, error);
      setErrorMessage(`Erreur lors de l'action ${action}: ${error.message}`);
      setErrorModalOpen(true);
      
      setOperationStatus({
        type: "error",
        message: `Erreur lors de l'action ${action}: ${error.message.substring(0, 50)}...`
      });
      
      if (completeOperation) completeOperation(selected, false);
      
      setTimeout(() => {
        setOperationStatus({ type: null, message: "" });
      }, 5000);
    }
  };

  const handleExportClick = () => {
    if (devices.length === 0) return;
    setShowExportMenu((v) => !v);
  };

  const handleExportType = (type) => {
    setShowExportMenu(false);
    if (!devices.length) return;
    
    // Ajouter cette ligne pour activer l'animation
    setExportAnimating(true);
    
    setTimeout(() => {
      if (type === "csv") {
        const csv = toCSV(devices);
        downloadFile("devices.csv", csv, "text/csv");
      } else if (type === "json") {
        downloadFile("devices.json", JSON.stringify(devices, null, 2), "application/json");
      }
    }, 400);
    
    setTimeout(() => {
      setExportAnimating(false);
    }, 750);
  };

  const handleDelete = async () => {
    if (!selected.length) return;
    await Promise.all(
      selected.map((id) =>
        fetch(`http://127.0.0.1:8000/devices/${id}`, { method: "DELETE" })
      )
    );
    setSelected([]);
    if (onRefresh) {
      setTimeout(() => {
        onRefresh();
      }, 200);
    }
  };

  const handleCheckAvailability = async (devicesToCheck) => {
    await checkAvailability({ selectedDevices: devicesToCheck });
    if (onRefresh) setTimeout(onRefresh, 700);
  };

  return (
    <div className="device-actions-group" style={{ display: "flex", gap: 8 }}>
      {/* Indicateur d'opération - placé tout à gauche */}
      {operationStatus.type && (
        <div className={`operation-status-indicator ${operationStatus.type}`}>
          {operationStatus.type === "running" && <div className="spinner-circle"></div>}
          {operationStatus.type === "success" && "✓ "}
          {operationStatus.type === "error" && "✗ "}
          {operationStatus.message}
        </div>
      )}
      
      {/* Delete à droite de l'indicateur */}
      <DeleteButton 
        selected={selected} 
        onRefresh={onRefresh}
        setSelected={setSelected}
      />
      
      {/* Espaceur pour pousser les boutons à droite */}
      <div style={{ flex: 1 }} />
      {/* Export juste à gauche de la roue crantée */}
      <div ref={exportBtnRef} className={`action-btn-dropdown-container${showExportMenu ? " active" : ""}`}>
        <button
          className={`flat-icon${exportAnimating ? " export-animating" : ""}`}
          disabled={devices.length === 0}
          onClick={handleExportClick}
          type="button"
          title="Export"
        >
          <ButtonExport />
        </button>
        {showExportMenu && (
          <div className="action-btn-dropdown-menu">
            <div
              className="action-btn-dropdown-option"
              onClick={() => handleExportType("csv")}
            >
              CSV
            </div>
            <div
              className="action-btn-dropdown-option"
              onClick={() => handleExportType("json")}
            >
              JSON
            </div>
          </div>
        )}
      </div>
      {/* Roue crantée complètement à droite */}
      <div ref={actionsBtnRef} className={`action-btn-dropdown-container${showActionsMenu ? " active" : ""}`} style={{ marginLeft: "auto" }}>
        <button
          className="flat-icon"
          type="button"
          disabled={selected.length === 0}
          onClick={() => {
            console.log("Gear button clicked, showing menu");
            setShowActionsMenu(prev => !prev);
          }}
          title="Actions"
        >
          <ButtonGear />
        </button>
        {showActionsMenu && (
          <div className="action-btn-dropdown-menu">
            <div
              className="action-btn-dropdown-option"
              onClick={() => handleAction("rediscover")}
            >
              Rediscover
            </div>
            {/* Nouvelle option Rename */}
            <div
              className="action-btn-dropdown-option"
              onClick={() => handleAction("rename")}
            >
              Rename
            </div>
            <div
              className="action-btn-dropdown-option"
              onClick={() => allSameOS && handleAction("upgrade")}
              style={{ color: allSameOS ? undefined : "#bbb", cursor: allSameOS ? "pointer" : "not-allowed" }}
              tabIndex={allSameOS ? 0 : -1}
              aria-disabled={!allSameOS}
            >
              Upgrade
            </div>
            <div
              className="action-btn-dropdown-option"
              onClick={() => allSameOS && handleAction("download-config")}
              style={{ color: allSameOS ? undefined : "#bbb", cursor: allSameOS ? "pointer" : "not-allowed" }}
              tabIndex={allSameOS ? 0 : -1}
              aria-disabled={!allSameOS}
            >
              Download Current Config
            </div>
            <div
              className="action-btn-dropdown-option"
              onClick={() => allSameOS && handleAction("backup-config")}
              style={{ color: allSameOS ? undefined : "#bbb", cursor: allSameOS ? "pointer" : "not-allowed" }}
              tabIndex={allSameOS ? 0 : -1}
              aria-disabled={!allSameOS}
            >
              Backup Config
            </div>
            <div
              className="action-btn-dropdown-option"
              onClick={() => allSameOS && !isJunOS && handleAction("save-config")}
              style={{
                color: allSameOS && !isJunOS ? undefined : "#bbb",
                cursor: allSameOS && !isJunOS ? "pointer" : "not-allowed",
                fontStyle: isJunOS ? "italic" : undefined
              }}
              tabIndex={allSameOS && !isJunOS ? 0 : -1}
              aria-disabled={!allSameOS || isJunOS}
            >
              Save Config
            </div>
            <div
              className="action-btn-dropdown-option"
              onClick={() => allSameOS && handleAction("upload-config")}
              style={{ color: allSameOS ? undefined : "#bbb", cursor: allSameOS ? "pointer" : "not-allowed" }}
              tabIndex={allSameOS ? 0 : -1}
              aria-disabled={!allSameOS}
            >
              Upload Config
            </div>
          </div>
        )}
      </div>
      <CheckAvailability
        devices={devices}
        onRefresh={onRefresh}
        style={{ marginLeft: 4 }}
      />
      {/* Error Modal */}
      {errorModalOpen && (
        <ErrorModal
          open={errorModalOpen}
          message={errorMessage}
          onClose={() => setErrorModalOpen(false)}
        />
      )}
      {/* Credentials Modal */}
      <CredentialsModal
        open={credModalOpen}
        onSubmit={handleCredSubmit}
        onCancel={handleCredCancel}
      />
    </div>
  );
}
