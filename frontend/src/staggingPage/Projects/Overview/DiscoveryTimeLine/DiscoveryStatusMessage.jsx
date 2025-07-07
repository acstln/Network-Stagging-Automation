import React from "react";

export default function DiscoveryStatusMessage({ loading, error, scanProgress, scanned, total }) {
  if (loading)
    return (
      <div>
        <div className="flash flash-info mb-3">
          Scanning network... {scanProgress}% ({scanned}/{total})
        </div>
        <div style={{ marginTop: 8, width: 220 }}>
          <div style={{
            background: "#eaecef",
            borderRadius: 6,
            height: 8,
            width: "100%",
            overflow: "hidden"
          }}>
            <div style={{
              background: "#0969da",
              height: "100%",
              width: `${scanProgress}%`,
              transition: "width 0.3s"
            }} />
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flash flash-error mb-3">{error}</div>
    );
  return null;
}