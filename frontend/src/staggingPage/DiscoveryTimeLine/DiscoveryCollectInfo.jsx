import React from "react";
import "./DiscoveryCollectInfo.css";
import { collectSwitchInfo } from "../../api/collectInfo";

export default function CollectInfoStep({ onCollect, disabled }) {
  const handleCollect = async () => {
    try {
      // Replace these with actual values or get them from your state/context
      const ip = "127.0.0.1";
      const username = "admin";
      const password = "password";
      const os_type = "windows";

      const data = await collectSwitchInfo(ip, username, password, os_type);
      console.log("Collected data:", data);

      // Call the onCollect prop to notify parent component
      onCollect();
    } catch (error) {
      console.error("Error collecting info:", error);
    }
  };

  return (
    <div>
      <h3 className="h3 is-4">Collect Informations</h3>
      <span className="stepNumber">5</span>
      <button
        className="btn btn-sm btn-collect"
        type="button"
        onClick={handleCollect}
        disabled={disabled}
      >
        Collect Informations
      </button>
    </div>
  );
}