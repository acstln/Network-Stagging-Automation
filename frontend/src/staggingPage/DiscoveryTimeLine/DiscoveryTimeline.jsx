import React from "react";
import "./DiscoveryTimeline.css";
import DiscoveryNetScan from "./DiscoveryNetScan";
import DiscoveryCredentials from "./DiscoveryCredentials";
import DiscoveryDeviceType from "./DiscoveryDeviceType";
import DiscoverySoftwareUpload from "./DiscoverySoftwareUpload";
import DiscoveryCollectInfo from "./DiscoveryCollectInfo";

export default function StepTimeline({ scanResults, onResultsUpdate }) {
  const [credentials, setCredentials] = React.useState(null);

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
    <div className="staggingTimeLine" style={{ margin: "48px auto 0 auto", display: "flex", gap: 32 }}>
      <div style={{ flex: 1 }}>
        <div className="timeLine__heading">
          <h4>Staging Steps</h4>
        </div>
        <div className="step">
          <DiscoveryNetScan
            defaultSubnet="192.168.254.64/28"
            onResultsUpdate={onResultsUpdate}
            scanResults={scanResults}
          />
        </div>
        <div className="step">
          <DiscoveryCredentials onSubmit={setCredentials} />
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
    </div>
  );
}