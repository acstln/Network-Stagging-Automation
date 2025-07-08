import React, { useState, useRef, useEffect } from "react";
import "../common/CommonDeviceActions.css";

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

export default function DeviceActions({ selected, devices = [], onRefresh, setSelected }) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportAnimating, setExportAnimating] = useState(false);
  const exportBtnRef = useRef(null);

  // Ferme le menu export si on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportBtnRef.current && !exportBtnRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    }
    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

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

    // Retire la classe après la durée de l'animation CSS (0.35s)
    setTimeout(() => {
      setExportAnimating(false);
    }, 750); // 0.35s (animation) + 0.4s (délai avant download)
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
    <div className="device-actions-group">
      <div className="action-btn-dropdown-container" ref={exportBtnRef}>
        <button
          className={`action-btn${exportAnimating ? " export-animating" : ""}`}
          disabled={devices.length === 0 || exportAnimating}
          onClick={handleExportClick}
          type="button"
        >
          Export
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
      <button
        className="action-btn action-btn--delete"
        disabled={selected.length === 0}
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
}