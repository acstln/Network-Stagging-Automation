import React from "react";
import "./DiscoveryDevices.css";
import DiscoveryDeviceActions from "./DiscoveryDeviceActions";
import "../../common/CommonTable.css";
import CommonDeviceTable from "../../common/CommonDeviceTable/CommonDeviceTable";

export default function DiscoveryDevices({ onReset, refreshKey, scanResults = [] }) {
  return (
    <div className="common-table-container">
      <CommonDeviceTable
        title="Scanned Devices"
        actionComponent={DiscoveryDeviceActions}
        refreshKey={refreshKey}
        onRefresh={onReset}
        columns={["checkbox", "ip", "status", "model", "serial", "vendor", "os"]}
        initialDevices={scanResults} // Passer les résultats directement
      />
    </div>
  );
}