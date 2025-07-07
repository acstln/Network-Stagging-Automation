import React from "react";

export default function StaggingDevices({ devices }) {
  if (!devices || devices.length === 0) {
    return <div>Aucun device pour ce projet.</div>;
  }

  return (
    <div>
      <h3>Liste des devices du projet</h3>
      <table style={{ width: "100%" }}>
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