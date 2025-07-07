import React, { useState } from "react";
import "./DiscoveryTable.css";

export default function DiscoveryTable({ scanResults = [], onReset }) {
  const [selected, setSelected] = useState([]);

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
    // Appel API pour supprimer chaque device sélectionné
    await Promise.all(
      selected.map((id) =>
        fetch(`http://127.0.0.1:8000/devices/${id}`, { method: "DELETE" })
      )
    );
    setSelected([]);
    if (onReset) onReset(); // Rafraîchit la liste sans reload la page
  };

  return (
    <div className="discovery-table-container">
      <div className="discovery-table-header">
        <h6 className="discovery-table-title">Résultats du scan</h6>
        <button
          onClick={handleDelete}
          disabled={selected.length === 0}
          style={{
            background: selected.length === 0 ? "#ccc" : "#cf222e",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 18px",
            fontWeight: 600,
            cursor: selected.length === 0 ? "not-allowed" : "pointer",
            marginLeft: 12,
          }}
        >
          Delete
        </button>
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