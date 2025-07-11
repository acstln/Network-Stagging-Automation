import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./ErrorModal.css"; // Nous allons créer ce fichier CSS

/**
 * Composant modal d'erreur autonome
 * 
 * @param {boolean} open - Si le modal est ouvert
 * @param {string} message - Le message d'erreur à afficher
 * @param {function} onClose - Fonction à appeler pour fermer le modal
 * @param {string} title - Titre du modal (par défaut "Error")
 */
export default function ErrorModal({ open, message, onClose, title = "Error" }) {
  if (!open) return null;
  
  // Fermeture du modal avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);
  
  // Empêcher la propagation du clic dans le contenu
  const handleContentClick = (e) => {
    e.stopPropagation();
  };
  
  return ReactDOM.createPortal(
    <div className="error-modal-overlay" onClick={onClose}>
      <div className="error-modal-content" onClick={handleContentClick}>
        <h3 className="error-modal-title">{title}</h3>
        
        <div className="error-modal-message">
          {message}
        </div>
        
        <div className="error-modal-actions">
          <button 
            className="error-modal-button"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}