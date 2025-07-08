import React, { useState, useRef, useEffect } from "react";
import "../common/CommonDeviceActions.css";
import { rediscoverDevices } from "./DeviceOperations/rediscover";
import { checkAvailability } from "./DeviceOperations/checkAvailability";
import { downloadConfig } from "./DeviceOperations/DownloadConfig";
import { backupConfig } from "./DeviceOperations/BackupConfig";
import ErrorModal from "../../../common/components/ErrorModal";
import ButtonTrash from "../../../medias/ButtonTrash";
import ButtonExport from "../../../medias/ButtonExport";
import ButtonGear from "../../../medias/ButtonGear";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  return (
    <div className="cred-modal-overlay">
      <div className="cred-modal">
        <h3>Authentification SSH</h3>
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
        <div className="cred-modal-actions">
          <button className="action-btn" onClick={() => onSubmit({ username, password })} disabled={!username || !password}>
            Valider
          </button>
          <button className="action-btn action-btn--delete" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StaggingDeviceActions({ selected, devices = [], onRefresh, setSelected, projectId }) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [exportAnimating, setExportAnimating] = useState(false);
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
      setShowExportMenu(false);
      setShowActionsMenu(false);
    }
    if (showExportMenu || showActionsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu, showActionsMenu]);

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

  const handleAction = async (action) => {
    setShowActionsMenu(false);

    if (action === "rediscover") {
      if (!selectedDevices.length) return;
      const missingVendorOrOs = selectedDevices.find(
        d => !d.vendor || !d.os
      );
      if (missingVendorOrOs) {
        setErrorMessage(
          "At least one selected device is missing its Vendor or OS information.\n\n" +
          "Please define the Vendor and OS for all selected devices in the Overview tab before running Rediscover."
        );
        setErrorModalOpen(true);
        return;
      }
      const creds = await askCredentials();
      if (!creds) return;
      try {
        await rediscoverDevices({ projectId, creds, selectedDevices });
        if (onRefresh) setTimeout(onRefresh, 700);
      } catch (e) {
        setErrorMessage(e.message);
        setErrorModalOpen(true);
      }
      return;
    } else if (action === "check-availability") {
      if (!selectedDevices.length) return;
      try {
        await checkAvailability({ selectedDevices });
        if (onRefresh) onRefresh();
      } catch (e) {
        setErrorMessage("An error occurred while checking device availability.");
        setErrorModalOpen(true);
      }
      return;
    } else if (action === "download-config") {
      if (!selectedDevices.length) return;
      const creds = await askCredentials();
      if (!creds) return;
      try {
        for (const device of selectedDevices) {
          const config = await downloadConfig({ device, creds });
          downloadFile(
            `config_${device.name || device.ip || device.id}.txt`,
            config,
            "text/plain"
          );
        }
        if (onRefresh) onRefresh();
      } catch (e) {
        setErrorMessage(e.message);
        setErrorModalOpen(true);
      }
      return;
    } else if (action === "backup-config") {
      if (!selectedDevices.length) return;
      const creds = await askCredentials();
      if (!creds) return;
      try {
        for (const device of selectedDevices) {
          await backupConfig({ device, creds });
        }
        if (onRefresh) onRefresh();
        alert("Backup terminé !");
      } catch (e) {
        setErrorMessage(e.message);
        setErrorModalOpen(true);
      }
      return;
    }
    alert(`Action "${action}" sur ${selectedDevices.length} device(s)`);
  };

  const handleExportClick = () => {
    if (devices.length === 0) return;
    setShowExportMenu((v) => !v);
  };

  const handleExportType = (type) => {
    setShowExportMenu(false);
    if (!devices.length) return;
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

  return (
    <div className="device-actions-group" style={{ display: "flex", gap: 8 }}>
      {/* Delete à gauche, icône poubelle custom */}
      <button
        className="flat-icon"
        disabled={selected.length === 0}
        onClick={handleDelete}
        title="Delete"
      >
        <ButtonTrash />
      </button>
      {/* Espaceur pour pousser les boutons à droite */}
      <div style={{ flex: 1 }} />
      {/* Export juste à gauche de la roue crantée */}
      <div ref={exportBtnRef} style={{ position: "relative" }}>
        <button
          className={`flat-icon${exportAnimating ? " export-animating" : ""}`}
          disabled={devices.length === 0 || exportAnimating}
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
      <div ref={actionsBtnRef} style={{ marginLeft: "auto", position: "relative" }}>
        <button
          className="flat-icon"
          type="button"
          disabled={selected.length === 0}
          onClick={() => setShowActionsMenu(v => !v)}
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
            <div
              className="action-btn-dropdown-option"
              onClick={() => handleAction("check-availability")}
            >
              Check Availability
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