import React, { useState } from "react";
import ButtonTrash from "../../../../medias/ButtonTrash";
import PopupModal from "../../../../common/components/PopupModal";
import "../CommonDeviceActions/CommonDeviceActions.css";

export default function DeleteDeviceButton({ selected = [], onRefresh, setSelected, style }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Afficher la confirmation
  const handleClick = () => {
    console.log("Delete button clicked!", { selected, isDeleting });
    
    if (!selected || selected.length === 0) {
      console.log("No devices selected");
      return;
    }
    
    if (isDeleting) {
      console.log("Already deleting");
      return;
    }
    
    // Afficher le modal au lieu de window.confirm()
    setShowConfirmModal(true);
  };
  
  // Exécuter la suppression après confirmation
  const executeDelete = async () => {
    // Fermer le modal avant de procéder
    setShowConfirmModal(false);
    
    console.log("Starting delete operation for:", selected);
    setIsDeleting(true);
    
    try {
      // Suppression en parallèle de tous les éléments sélectionnés
      const results = await Promise.all(
        selected.map((id) => {
          console.log("Sending DELETE request for ID:", id);
          return fetch(`http://127.0.0.1:8000/devices/${id}`, { 
            method: "DELETE" 
          }).then(response => {
            console.log(`Response for ID ${id}:`, response);
            if (!response.ok) {
              throw new Error(`Error deleting device ${id}: ${response.statusText}`);
            }
            return response;
          });
        })
      );
      
      console.log("Delete operations completed:", results);
      
      // Réinitialiser la sélection
      if (typeof setSelected === "function") {
        console.log("Resetting selection");
        setSelected([]);
      }
      
      // Rafraîchir les données
      if (typeof onRefresh === "function") {
        console.log("Refreshing data");
        setTimeout(onRefresh, 500);
      }
    } catch (error) {
      console.error("Error during delete operation:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        className={`flat-icon${isDeleting ? " spinning" : ""}`}
        type="button"
        onClick={handleClick}
        title={`Delete selected devices (${selected?.length || 0})`}
        disabled={!selected || selected.length === 0 || isDeleting}
        style={style}
      >
        <ButtonTrash />
      </button>
      
      {/* Modal de confirmation */}
      <PopupModal
        open={showConfirmModal}
        title="Confirmation de suppression"
        onClose={() => setShowConfirmModal(false)}
      >
        <p>
          Êtes-vous sûr de vouloir supprimer {selected?.length || 0} appareil(s) ?
          <br />
          Cette action est irréversible.
        </p>
        <div className="modal-actions">
          <button
            className="btn-cancel-dark"
            onClick={() => setShowConfirmModal(false)}
          >
            Annuler
          </button>
          <button
            className="btn-delete-dark"
            onClick={executeDelete}
          >
            Supprimer
          </button>
        </div>
      </PopupModal>
    </>
  );
}