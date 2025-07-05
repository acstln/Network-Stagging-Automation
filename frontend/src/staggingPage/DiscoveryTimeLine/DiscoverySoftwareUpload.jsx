import React, { useState } from "react";
import "./DiscoverySoftwareUpload.css";

export default function DiscoverySoftwareUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [firmwareName, setFirmwareName] = useState("");
  const [nameError, setNameError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setIsUploaded(false);
    setFirmwareName("");
    setNameError("");
  };

  const handleNameChange = (e) => {
    setFirmwareName(e.target.value);
    setNameError("");
  };

  const handleUpload = () => {
    if (!firmwareName.trim()) {
      setNameError("Veuillez donner un nom au firmware.");
      return;
    }
    setIsUploaded(true);
    if (file && onUpload) {
      onUpload({ firmwareName, firmwareFile: file });
    }
  };

  return (
    <div>
      <h3 className="h3 is-4" style={{ margin: 0 }}>
        Software Upload
        <span style={{ color: "#bbb", fontSize: "0.95em", fontWeight: 400, marginLeft: 8 }}>
          (Optional)
        </span>
      </h3>
      <span className={`stepNumber optional${isUploaded ? " completed" : ""}`}>4</span>
      <label className="upload-label">
        <input
          type="file"
          accept=".zip,.img,.bin,.swi,.pkg"
          onChange={handleFileChange}
          className="upload-input"
        />
        <span className="upload-btn">Parcourir...</span>
      </label>
      {file && (
        <div className="upload-card">
          <div className="upload-file-icon">📦</div>
          <div style={{ flex: 1 }}>
            <div className="upload-file-name">{file.name}</div>
            <div className="upload-file-size">{(file.size / 1024).toFixed(1)} Ko</div>
            <input
              type="text"
              className="upload-firmware-name"
              placeholder="Nom du firmware"
              value={firmwareName}
              onChange={handleNameChange}
              style={{ marginTop: 8, width: "100%" }}
            />
            {nameError && (
              <div style={{ color: "#d32f2f", fontSize: "0.95em", marginTop: 2 }}>{nameError}</div>
            )}
            <button
              type="button"
              className="upload-btn"
              style={{ marginTop: 10 }}
              onClick={handleUpload}
            >
              Valider
            </button>
          </div>
        </div>
      )}
    </div>
  );
}