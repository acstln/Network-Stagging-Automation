import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopBar from "./common/components/TopBar";
import StaggingProjectManager from "./staggingPage/Landing/StaggingProjectManager";
import StaggingProjectPage from "./staggingPage/Projects/StaggingProjectMenu";
import DeviceInfo from "./staggingPage/Projects/DevicesPage/DeviceInfo/DeviceInfo";

function App() {
  return (
    <Router>
      {/* Wrapper principal pour décaler le contenu sous la TopBar fixe */}
      <div id="app-content-wrapper" style={{ paddingTop: 56 }}>
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
          <Route path="/devices/:deviceId" element={<DeviceInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
