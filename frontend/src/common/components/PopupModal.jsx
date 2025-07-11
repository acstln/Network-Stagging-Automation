import React from "react";
import "./PopupModal.css";

export default function PopupModal({ open, title, children, onClose, style, contentStyle }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={contentStyle}
        onClick={e => e.stopPropagation()}
      >
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
}