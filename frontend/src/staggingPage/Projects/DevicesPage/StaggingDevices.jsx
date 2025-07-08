import React, { useState } from "react";
import "./StaggingDevices.css";
import "../common/CommonTable.css";
import DeviceActions from "./StaggingDeviceActions";
import StaggingMainContainer from "../common/StaggingMainContainer";
import { Link } from "react-router-dom";

export default function StaggingDevices({ devices = [], refreshKey, onRefresh, projectId }) {
  const [selected, setSelected] = useState([]);

  React.useEffect(() => {
    setSelected([]);
  }, [devices, refreshKey]);

  const toggleSelect = id => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === devices.length) setSelected([]);
    else setSelected(devices.map(d => d.id || d.ip));
  };

  return (
    <StaggingMainContainer>
      <div className="common-table-container stagging-devices-container">
        <div className="common-device-actions-group">
          <h2 className="discovery-table-title" style={{ margin: 0 }}>
            Device List
          </h2>
          <DeviceActions
            selected={selected}
            devices={devices}
            onRefresh={onRefresh} 
            setSelected={setSelected}
            projectId={projectId}
          />
        </div>
        <table className="common-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selected.length === devices.length && devices.length > 0}
                  onChange={selectAll}
                  disabled={devices.length === 0}
                />
              </th>
              <th>Nom</th>
              <th>IP</th>
              <th>Status</th>
              
              <th>Model</th>
              <th>Serial</th>
              <th>Version</th>
              <th>Vendor</th>
              <th>OS</th>
              <th>Sélectionné</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", color: "#888" }}>
                  Aucun device pour ce projet.
                </td>
              </tr>
            ) : (
              devices.map(d => (
                <tr key={d.id || d.ip}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(d.id || d.ip)}
                      onChange={() => toggleSelect(d.id || d.ip)}
                    />
                  </td>
                  <td>
                    <Link
                      to={`/devices/${d.id}`}
                      style={{
                        color: "#0969da",
                        textDecoration: "underline",
                        fontWeight: 500,
                        cursor: "pointer",
                        fontSize: "1rem"
                      }}
                    >
                      {d.name || d.ip}
                    </Link>
                  </td>
                  <td>{d.ip}</td>
                  <td>
                    <span
                      className={
                        "status-badge " +
                        (d.status === "online"
                          ? "status-online"
                          : d.status === "offline"
                          ? "status-offline"
                          : "status-unknown")
                      }
                    >
                      {d.status || "unknown"}
                    </span>
                  </td>
                  <td>{d.model}</td>
                  <td>{d.serial}</td>
                  <td>{d.version}</td>
                  <td>{d.vendor}</td>
                  <td>{d.os}</td>
                  <td>{d.selected ? "Oui" : "Non"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </StaggingMainContainer>
  );
}