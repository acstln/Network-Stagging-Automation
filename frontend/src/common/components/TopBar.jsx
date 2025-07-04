import React from "react";
import logo from "../../medias/logo_netax_long.png";

export default function TopBar({ setPage }) {
  return (
    <header
      className="Header"
      style={{
        background: "#F6F8FA",
        borderBottom: "1px solid #d0d7de",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        zIndex: 100,
        minHeight: 56,
      }}
    >
      <div
        className="d-flex flex-items-center"
        style={{ height: 56, width: "100%" }}
      >
        <div className="d-flex flex-items-center" style={{ marginLeft: 24 }}>
          <img
            src={logo}
            alt="Logo"
            width={150}
            style={{ borderRadius: 4, cursor: "pointer" }}
            onClick={() => setPage("home")}
          />
          <nav className="d-flex flex-items-center ml-4">
            <button className="Header-link mr-3" onClick={() => setPage("home")}>
              Home
            </button>
            <button className="Header-link mr-3" onClick={() => setPage("stagging")}>
              Stagging
            </button>
            <button className="Header-link" onClick={() => setPage("software")}>
              Software
            </button>
          </nav>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ marginRight: 24 }}>
          <button className="Header-link" onClick={() => setPage("help")}>
            Help
          </button>
        </div>
      </div>
    </header>
  );
}