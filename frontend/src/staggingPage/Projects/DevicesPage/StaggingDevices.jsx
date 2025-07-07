import React from "react";
import "./StaggingDevices.css";

export default function StaggingDevices({ devices }) {
  if (!devices || devices.length === 0) {
    return <div style={{ padding: 32, textAlign: "center" }}>Aucun device pour ce projet.</div>;
  }

  return (
    <div className="devices-table-container">
      <table className="devices-table">
        <thead>
          <tr>
            <th>IP</th>
            <th>Nom</th>
            <th>Status</th>
            <th>Model</th>
            <th>Serial</th>
            <th>Version</th>
            <th>Vendor</th>
            <th>OS</th>
            <th>Sélectionné</th>
          </tr>
        </thead>
        <tbody>
          {devices.map(d => (
            <tr key={d.id || d.ip}>
              <td>{d.ip}</td>
              <td>{d.name}</td>
              <td>{d.status}</td>
              <td>{d.model}</td>
              <td>{d.serial}</td>
              <td>{d.version}</td>
              <td>{d.vendor}</td>
              <td>{d.os}</td>
              <td>{d.selected ? "Oui" : "Non"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}