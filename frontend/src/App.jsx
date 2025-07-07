import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopBar from "./common/components/TopBar";
import StaggingProjectManager from "./staggingPage/Landing/StaggingProjectManager";
import StaggingProjectPage from "./staggingPage/Projects/StaggingProjectMenu";

function App() {
  return (
    <Router>
      <div style={{ paddingTop: 56 }}>
        <TopBar />
        <Routes>
          <Route
            path="/"
            element={
              <div className="container-lg mt-6">
                <h1 className="f2 mb-3">Bienvenue sur Faststage !</h1>
                <p className="f4">
                  Cette application vous permet de découvrir et gérer votre réseau
                  facilement.
                  <br />
                  Utilisez le menu pour accéder aux différentes fonctionnalités.
                </p>
              </div>
            }
          />
          <Route path="/stagging" element={<StaggingProjectManager />} />
          <Route path="/stagging/:projectId" element={<StaggingProjectPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
