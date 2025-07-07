import React, { useState, useRef } from "react";
import "./DiscoveryTable.css";
import DataActions from "./DataActions";

const OS_OPTIONS = [
  { os: "IOS-XE", vendor: "Cisco" },
  { os: "IOS-XR", vendor: "Cisco" },
  { os: "NX-OS", vendor: "Cisco" },
  { os: "ACXOS", vendor: "Aruba" },
  { os: "JunOS", vendor: "Juniper" },
];

export default function DiscoveryTable({ scanResults = [], onReset }) {
  const [selected, setSelected] = useState([]);
  const [showOsMenu, setShowOsMenu] = useState(false);
  const [selectedOs, setSelectedOs] = useState(OS_OPTIONS[0].os);
  const osBtnRef = useRef(null);

  const selectAll = () => {
    if (selected.length === scanResults.length) {
      setSelected([]);
    } else {
      setSelected(scanResults.map((d) => d.id));
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selected.length === 0) return;
    await Promise.all(
      selected.map((id) =>
        fetch(`http://127.0.0.1:8000/devices/${id}`, { method: "DELETE" })
      )
    );
    setSelected([]);
    if (onReset) onReset();
  };

  const handleSetOs = async (osObj) => {
    setShowOsMenu(false);
    if (!osObj) return;
    await Promise.all(
      selected.map((id) =>
        fetch(`http://127.0.0.1:8000/devices/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ os: osObj.os, vendor: osObj.vendor }),
        })
      )
    );
    if (onReset) onReset();
  };

  // Ferme le menu si on clique ailleurs
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (osBtnRef.current && !osBtnRef.current.contains(event.target)) {
        setShowOsMenu(false);
      }
    }
    if (showOsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOsMenu]);

  return (
    <div className="discovery-table-container">
      <div className="discovery-table-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h6 className="discovery-table-title" style={{ margin: 0 }}>Scanned Devices</h6>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DataActions
            selected={selected}
            setShowOsMenu={setShowOsMenu}
            showOsMenu={showOsMenu}
            onSetOs={handleSetOs}
            selectedOs={selectedOs}
            setSelectedOs={setSelectedOs}
            onDelete={handleDelete}
          />
        </div>
      </div>
      <table className="discovery-table">
        <thead>
          <tr>
            <th style={{ width: 36 }}>
              <input
                type="checkbox"
                checked={
                  selected.length === scanResults.length &&
                  scanResults.length > 0
                }
                onChange={selectAll}
                style={{ accentColor: "#0969da" }}
              />
            </th>
            <th>Status</th>
            <th>IP</th>
            <th>Vendor</th>
            <th>Model</th>
            <th>OS</th>
            <th>Serial</th>
            <th>Version</th>
          </tr>
        </thead>
        <tbody>
          {scanResults.map((device) => (
            <tr key={device.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(device.id)}
                  onChange={() => toggleSelect(device.id)}
                />
              </td>
              <td>
                <span
                  className={
                    "status-badge " +
                    (device.status === "online"
                      ? "status-online"
                      : device.status === "offline"
                      ? "status-offline"
                      : "status-unknown")
                  }
                >
                  {device.status || "unknown"}
                </span>
              </td>
              <td>{device.ip || ""}</td>
              <td>{device.vendor || ""}</td>
              <td>{device.model || ""}</td>
              <td>{device.os || ""}</td>
              <td>{device.serial || ""}</td>
              <td>{device.version || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {scanResults.length === 0 && (
        <div className="discovery-table-empty">
          Aucun résultat pour l’instant…
        </div>
      )}
    </div>
  );
}