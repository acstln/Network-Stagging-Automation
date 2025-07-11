import React, { useState } from "react";
import ButtonCheckAvailability from "../../../../medias/ButtonReload";
import { GET_CheckAvailability } from "../../../api/Devices/GET/GET_CheckAvailability";

export default function CheckAvailability({ devices = [], onRefresh, style }) {
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (checking) return;
    
    setChecking(true);
    setError("");
    
    try {
      // Si l'API échoue, on simule juste un rafraîchissement
      if (devices.length) {
        try {
          console.log("Tentative de vérification via l'API...");
          await GET_CheckAvailability(devices);
        } catch (apiError) {
          console.warn("API check-availability a échoué, on rafraîchit simplement les données:", apiError);
          // On continue pour rafraîchir quand même
        }
        
        // On rafraîchit quoi qu'il arrive après un délai
        setTimeout(() => {
          if (typeof onRefresh === "function") {
            console.log("Rafraîchissement du tableau après vérification");
            onRefresh();
          }
          setChecking(false);
        }, 1000);
      } else {
        console.log("Aucun device à vérifier");
        setChecking(false);
      }
    } catch (e) {
      console.error("Erreur dans CheckAvailability:", e);
      setError(e?.message || "Une erreur est survenue");
      setChecking(false);
    }
  };

  return (
    <>
      <button
        className={`flat-icon${checking ? " spinning" : ""}`}
        type="button"
        onClick={handleClick}
        title="Check Availability"
        style={style}
        disabled={checking}
      >
        <ButtonCheckAvailability />
      </button>
      {error && (
        <div style={{ color: "#cf222e", fontSize: 13, marginTop: 4 }}>{error}</div>
      )}
    </>
  );
}