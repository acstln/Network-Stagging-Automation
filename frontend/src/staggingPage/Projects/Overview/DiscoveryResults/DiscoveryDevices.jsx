import React, { useState, useEffect, useRef } from "react";
import "./DiscoveryDevices.css";
import DiscoveryDeviceActions from "./DiscoveryDeviceActions";
import "../../common/CommonTable.css";

const OS_OPTIONS = [
  { os: "IOS-XE", vendor: "Cisco" },
  { os: "IOS-XR", vendor: "Cisco" },
  { os: "NX-OS", vendor: "Cisco" },
  { os: "ACXOS", vendor: "Aruba" },
  { os: "JunOS", vendor: "Juniper" },
];

export default function DiscoveryDevices({ scanResults = [], onReset, refreshKey }) {
  const [selected, setSelected] = useState([]);
  const [showOsMenu, setShowOsMenu] = useState(false);
  const [selectedOs, setSelectedOs] = useState(OS_OPTIONS[0].os);
  const [showProvisionedPopup, setShowProvisionedPopup] = useState(false);
  const osBtnRef = useRef(null);

  // Reset la sélection à chaque refresh du tableau
  useEffect(() => {
    setSelected([]);
  }, [refreshKey, scanResults]);

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
    const provisioned = selected
      .map((id) => scanResults.find((d) => d.id === id))
      .find((d) => d && d.model && d.serial);
    if (provisioned) {
      setShowProvisionedPopup(true);
      return;
    }
    await Promise.all(
      selected.map((id) =>
        fetch(`http://127.0.0.1:8000/devices/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ os: osObj.os, vendor: osObj.vendor }),
        })
      )
    );
    setTimeout(() => {
      if (onReset) onReset();
    }, 400);
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

  function isProvisioned(device) {
    return !!device.model && !!device.serial;
  }

  return (
    <div className="common-table-container">
      <div className="common-device-actions-group" >
        <h6 className="discovery-table-title" style={{ margin: 0 }}>
          Scanned Devices
        </h6>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DiscoveryDeviceActions
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
      <table className="common-table">
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
                disabled={scanResults.length === 0}
              />
            </th>
            <th>IP</th>
            <th>Status</th>
            <th>Model</th>
            <th>Serial</th>
            <th>Version</th>
            <th>Vendor</th>
            <th>OS</th>
          </tr>
        </thead>
        <tbody>
          {scanResults.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: "center", color: "#888" }}>
                Aucun résultat pour l’instant…
              </td>
            </tr>
          ) : (
            scanResults.map((d) => (
              <tr key={d.id || d.ip}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(d.id || d.ip)}
                    onChange={() => toggleSelect(d.id || d.ip)}
                  />
                </td>
                <td>{d.ip}</td>
                <td>
                  <span
                    className={
                      "status-badge " +
                      (d.status === "online"
                        ? "status-online"
                        : d.status === "offline"
                        ? "status-offline"
                        : "status-unknown")
                    }
                  >
                    {d.status || "unknown"}
                  </span>
                </td>
                <td>{d.model}</td>
                <td>{d.serial}</td>
                <td>{d.version}</td>
                <td>{d.vendor}</td>
                <td>{d.os}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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