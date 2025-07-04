import React from "react";

export default function DiscoveryResults({ scanResults }) {
  return (
    <div>
      <h6>Résultats du scan :</h6>
      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>IP</th>
            <th style={{ textAlign: "left" }}>Statut</th>
          </tr>
        </thead>
        <tbody>
          {scanResults.map((device, idx) => (
            <tr key={device.ip + idx}>
              <td>{device.ip}</td>
              <td>{device.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {scanResults.length === 0 && (
        <div style={{ color: "#888", marginTop: 8 }}>
          Aucun résultat pour l’instant…
        </div>
      )}
    </div>
  );
}