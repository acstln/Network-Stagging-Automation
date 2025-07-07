import React from "react";

export default function StaggingMainContainer({ children, style }) {
  return (
    <div style={{ width: "100vw", overflowX: "auto" }}>
      <div
        id="stagging-main-container"
        style={{
          minHeight: "100vh",
          marginTop: 10,
          width: "fit-content",
          minWidth: 1400,
          margin: "0 auto",
          boxSizing: "border-box",
          padding: 10,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}