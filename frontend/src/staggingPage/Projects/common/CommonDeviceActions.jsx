import React from "react";
import "./CommonDeviceActions.css";

export default function CommonDeviceActions({
  onActionsClick,
  onExportClick,
  onDeleteClick,
  actionsDisabled,
  exportDisabled,
  deleteDisabled,
  exportAnimating,
  children
}) {
  return (
    <div className="device-actions-group">
      {/* Actions (roue crantée) */}
      <button
        className="action-btn"
        type="button"
        disabled={actionsDisabled}
        onClick={onActionsClick}
        title="Actions"
        style={{ minWidth: 36, maxWidth: 36, padding: 0, justifyContent: "center" }}
      >
        {/* Icône roue crantée */}
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" stroke="#0969da" strokeWidth="1.5" fill="none"/>
          <path d="M10 6v2M10 12v2M14 10h-2M8 10H6M13.07 6.93l-1.41 1.41M8.34 11.66l-1.41 1.41M13.07 13.07l-1.41-1.41M8.34 8.34l-1.41-1.41" stroke="#0969da" strokeWidth="1"/>
        </svg>
      </button>
      {/* Export */}
      <button
        className={`action-btn${exportAnimating ? " export-animating" : ""}`}
        disabled={exportDisabled}
        onClick={onExportClick}
        type="button"
        title="Export"
        style={{ minWidth: 90, justifyContent: "center" }}
      >
        {/* Icône export */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: 6 }}>
          <path d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5" stroke="#0969da" strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="3" y="15" width="14" height="2" rx="1" fill="#0969da"/>
        </svg>
        Export
      </button>
      {/* Delete */}
      <button
        className="action-btn action-btn--delete"
        disabled={deleteDisabled}
        onClick={onDeleteClick}
        title="Delete"
      >
        Delete
      </button>
      {/* Pour dropdowns ou modals */}
      {children}
    </div>
  );
}