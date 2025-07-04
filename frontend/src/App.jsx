import React, { useState } from "react";
import TopBar from "./common/components/TopBar";
import StaggingPage from "./staggingPage/StaggingPage";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div style={{ paddingTop: 56 }}>
      <TopBar setPage={setPage} />
      {page === "home" && (
        <div className="container-lg mt-6">
          <h1 className="f2 mb-3">Bienvenue sur Faststage !</h1>
          <p className="f4">
            Cette application vous permet de découvrir et gérer votre réseau
            facilement.
            <br />
            Utilisez le menu pour accéder aux différentes fonctionnalités.
          </p>
        </div>
      )}
      {page === "stagging" && <StaggingPage />}
      {/* Tu pourras ajouter d'autres pages ici plus tard */}
    </div>
  );
}

export default App;
