import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function DeviceInfo() {
  const { deviceId } = useParams();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/devices/${deviceId}`)
      .then(res => res.json())
      .then(setDevice)
      .finally(() => setLoading(false));
  }, [deviceId]);

  if (loading) return <div>Chargement...</div>;
  if (!device) return <div>Device introuvable</div>;

  let configHistory = [];
  try {
    configHistory = JSON.parse(device.configuration || "[]");
  } catch {
    configHistory = [];
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 12px #eee", padding: 32 }}>
      <h2 style={{ marginBottom: 24, color: "#0969da" }}>
        Informations du device <span style={{ color: "#222" }}>{device.name || device.ip}</span>
      </h2>
      <table style={{ width: "100%", marginBottom: 32, borderCollapse: "collapse" }}>
        <tbody>
          <tr><td style={{ fontWeight: 500 }}>IP</td><td>{device.ip}</td></tr>
          <tr><td style={{ fontWeight: 500 }}>Nom</td><td>{device.name}</td></tr>
          <tr><td style={{ fontWeight: 500 }}>Status</td><td>{device.status}</td></tr>
          <tr><td style={{ fontWeight: 500 }}>Modèle</td><td>{device.model}</td></tr>
          <tr><td style={{ fontWeight: 500 }}>Numéro de série</td><td>{device.serial}</td></tr>
          <tr><td style={{ fontWeight: 500 }}>Version</td><td>{device.version}</td></tr>
          <tr><td style={{ fontWeight: 500 }}>Vendor</td><td>{device.vendor}</td></tr>
          <tr><td style={{ fontWeight: 500 }}>OS</td><td>{device.os}</td></tr>
        </tbody>
      </table>

      <h3 style={{ marginBottom: 12 }}>Historique des configurations (max 5)</h3>
      {configHistory.length === 0 ? (
        <div style={{ color: "#888", fontStyle: "italic" }}>Aucune configuration sauvegardée.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Version</th>
              <th style={{ textAlign: "left", padding: 8 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {configHistory.map((entry, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8 }}>
                  Backup #{configHistory.length - idx}
                  <br />
                  <span style={{ color: "#888", fontSize: 12 }}>
                    {entry.date ? new Date(entry.date).toLocaleString() : ""}
                  </span>
                </td>
                <td style={{ padding: 8 }}>
                  <button
                    style={{
                      background: "#0969da",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 12px",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      const blob = new Blob([entry], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `config_device_${device.id}_backup${configHistory.length - idx}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }, 0);
                    }}
                  >
                    Télécharger
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}