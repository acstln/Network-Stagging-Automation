import React, { useState } from "react";
import DataActions from "./DataActions";
import "./DiscoveryTable.css";

export default function DiscoveryResults({ scanResults, onReset }) {
  const [selected, setSelected] = useState([]);

  const toggleSelect = (ip) => {
    setSelected((prev) =>
      prev.includes(ip) ? prev.filter((item) => item !== ip) : [...prev, ip]
    );
  };

  const selectAll = (e) => {
    if (e.target.checked) {
      setSelected(scanResults.map((d) => d.ip));
    } else {
      setSelected([]);
    }
  };

  return (
    <div className="discovery-table-container">
      <div className="discovery-table-header">
        <h6 className="discovery-table-title">Résultats du scan</h6>
        <DataActions onReset={onReset} />
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
            <th>Serial</th>
            <th>Version</th>
          </tr>
        </thead>
        <tbody>
          {scanResults.map((device) => (
            <tr key={device.ip}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(device.ip)}
                  onChange={() => toggleSelect(device.ip)}
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