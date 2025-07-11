import React from "react";
import "./OperationIndicator.css";

export default function OperationIndicator({ status }) {
  // Si pas de statut, ne rien afficher
  if (!status) return null;
  
  // Si statut 'running', afficher le spinner
  if (status === "running") {
    return (
      <div className="operation-indicator-container">
        <div className="operation-spinner">
          
        </div>
      </div>
    );
  }
  
  // Si statut 'success', afficher la coche
  if (status === "success") {
    return (
      <div className="operation-indicator-container">
        <div className="operation-success">
          
        </div>
      </div>
    );
  }
  
  // Si statut 'error', afficher la croix
  if (status === "error") {
    return (
      <div className="operation-indicator-container">
        <div className="operation-error">
          
        </div>
      </div>
    );
  }
  
  return null;
}