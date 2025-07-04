import React, { useState } from "react";
import "./DiscoveryTimeline.css";
import DiscoveryNetScan from "./DiscoveryNetScan";
import DiscoveryCredentials from "./DiscoveryCredentials";
import DiscoveryDeviceType from "./DiscoveryDeviceType";
import DiscoverySoftwareUpload from "./SoftwareUpload";
import DiscoveryCollectInfo from "./DiscoveryCollectInfo";

export default function StepTimeline({ onResultsUpdate }) {
  const [scanResults, setScanResults] = useState([]);

  const handleCredentialsSubmit = (data) => {
    alert(`Username: ${data.username}\nPassword: ${data.password}`);
  };
  const handleDeviceTypeSubmit = (data) => {
    alert(`Vendor: ${data.vendor}\nModel: ${data.model}`);
  };
  const handleSoftwareUpload = (data) => {
    alert(`Firmware "${data.firmwareName}" prêt à uploader: ${data.firmwareFile.name}`);
  };
  const handleCollectInfo = () => {
    alert("Collecting information...");
  };

  return (
    <div className="staggingTimeLine" style={{ margin: "48px auto 0 auto" }}>
      <div className="timeLine__heading">
        <h4>Staging Steps</h4>
      </div>
      <div className="step">
        <DiscoveryNetScan defaultSubnet="192.168.254.64/28" onResultsUpdate={onResultsUpdate} />
      </div>
      <div className="step">
        <DiscoveryCredentials onSubmit={handleCredentialsSubmit} />
      </div>
      <div className="step">
        <DiscoveryDeviceType onSubmit={handleDeviceTypeSubmit} />
      </div>
      <div className="step">
        <DiscoverySoftwareUpload onUpload={handleSoftwareUpload} />
      </div>
      <div className="step">
        <DiscoveryCollectInfo onCollect={handleCollectInfo} />
      </div>
    </div>
  );
}