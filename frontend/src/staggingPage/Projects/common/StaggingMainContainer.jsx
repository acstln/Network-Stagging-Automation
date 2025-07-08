import React from "react";

/**
 * Ce composant permet d'afficher le contenu principal de la page stagging.
 * Il gère le scroll horizontal si la fenêtre est plus petite que 1400px.
 * Le wrapper externe prend toute la largeur de l'écran (100vw) et permet le scroll.
 * Le conteneur interne impose une largeur minimale et contient le contenu réel.
 */
export default function StaggingMainContainer({ children, style }) {
  return (
    // Wrapper pour le scroll horizontal
    <div
      id="stagging-main-scroll-wrapper"
      style={{
        overflowX: "auto",
        margin: 0,
      }}
    >
      {/* Conteneur principal du contenu stagging */}
      <div
        id="stagging-main-container"
        style={{
          minHeight: "100vh",
          marginTop: 0,
          width: "90vw",
          minWidth: 1400,
          boxSizing: "border-box",
          margin: "0 auto",
          padding: 10,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}