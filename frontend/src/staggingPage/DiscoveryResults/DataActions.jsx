import React from "react";

export default function DataActions({ onReset }) {
  return (
    <button
      type="button"
      className="btn btn-sm"
      style={{
        background: "#f6f8fa",
        border: "1px solid #d0d7de",
        borderRadius: 6,
        color: "#cf222e",
        fontWeight: 500,
        padding: "4px 18px",
        cursor: "pointer",
        transition: "background 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 70,
      }}
      onClick={onReset}
    >
      Reset
    </button>
  );
}