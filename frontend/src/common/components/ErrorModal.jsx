import React from "react";
import "../../staggingPage/Projects/common/CommonDeviceActions.css";

export default function ErrorModal({ open, message, onClose, title = "Error" }) {
  if (!open) return null;
  return (
    <div className="cred-modal-overlay">
      <div className="cred-modal">
        <h3 style={{ color: "#cf222e", marginBottom: 12 }}>{title}</h3>
        <div style={{ margin: "1rem 0", whiteSpace: "pre-line", color: "#444" }}>
          {message}
        </div>
        <div className="cred-modal-actions">
          <button className="action-btn" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}