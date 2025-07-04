import React, { useState } from "react";

export default function SoftwareUploadStep({ onUpload }) {
  const [showUpload, setShowUpload] = useState(false);
  const [firmwareFile, setFirmwareFile] = useState(null);
  const [firmwareName, setFirmwareName] = useState("");

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!firmwareFile || !firmwareName) return;
    onUpload({ firmwareFile, firmwareName });
    setShowUpload(false);
    setFirmwareFile(null);
    setFirmwareName("");
  };

  return (
    <div>
      <h5>Software Upload</h5>
      <span className="stepNumber">4</span>
      <p>
        If needed, you can upload the required firmware here. The file will be stored and available later for device upgrades.
      </p>
      <button
        className="btn btn-sm btn-primary"
        type="button"
        onClick={() => setShowUpload(true)}
      >
        Upload Software
      </button>
      {showUpload && (
        <div className="modal-overlay">
          <div className="modal">
            <h6>Upload a firmware</h6>
            <form onSubmit={handleUploadSubmit} className="upload-form">
              <input
                type="file"
                accept=".bin,.img,.tar,.zip"
                onChange={e => setFirmwareFile(e.target.files[0])}
                required
              />
              <input
                type="text"
                placeholder="Firmware name"
                value={firmwareName}
                onChange={e => setFirmwareName(e.target.value)}
                required
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn btn-sm btn-primary">
                  Upload
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowUpload(false)} />
        </div>
      )}
    </div>
  );
}