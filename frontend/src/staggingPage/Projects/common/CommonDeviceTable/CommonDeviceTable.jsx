import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ExternalLinkIcon from "../../../../medias/ExternalLinkIcon";
import OperationIndicator from "./OperationIndicator";
import { GET_DeviceList } from "../../../api/Devices/GET/GET_DeviceList";

export default function CommonDeviceTable({ 
  title = "Devices", 
  actionComponent: ActionComponent,
  refreshKey,
  onRefresh,
  columns = ["checkbox", "ip", "status", "model", "serial", "vendor", "os"],
  projectId,
  initialDevices = [],
  deviceOperations = {},
  startOperation,
  completeOperation
}) {
  const [devices, setDevices] = useState(initialDevices);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const previousDeviceCount = useRef(0);
  
  // Fetch data from API
  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      console.log("Récupération des devices depuis l'API...");
      const results = await GET_DeviceList();
      console.log(`${results?.length || 0} devices récupérés`);
      
      if (results && results.length > 0) {
        setDevices(results);
        
        // Keep count for next update
        previousDeviceCount.current = results.length;
      } else {
        setDevices([]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des devices:", error);
      setDevices([]);
      setIsLoading(false);
    }
  };

  // Fonction de rafraîchissement - expose fetchDevices à l'extérieur
  const refreshTable = () => {
    console.log("Rafraîchissement de la table...");
    return fetchDevices();
  };

  // Initial load and when refreshKey or initialDevices changes
  useEffect(() => {
    if (initialDevices && initialDevices.length > 0) {
      console.log("Initialisation avec devices fournis:", initialDevices.length);
      setDevices(initialDevices);
    } else {
      fetchDevices();
    }
  }, [refreshKey, initialDevices.length]);

  // Reset selected on refresh if devices change dramatically
  useEffect(() => {
    if (Math.abs(devices.length - previousDeviceCount.current) > 5) {
      setSelected([]);
    }
  }, [devices.length]);

  const selectAll = () => {
    if (selected.length === devices.length) {
      setSelected([]);
    } else {
      setSelected(devices.map(d => d.id || d.ip));
    }
  };

  const toggleSelect = id => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  function renderStacked(main, stackedJson) {
    let stacked = [];
    try {
      stacked = JSON.parse(stackedJson || "[]");
    } catch {
      // ignore parsing errors
    }
    if (!stacked || !Array.isArray(stacked) || stacked.length === 0) return main || "";
    // Return main + each stacked on a new line
    return (
      <span>
        <div>{main}</div>
        {stacked.map((val, i) => (
          <div key={i} style={{ fontSize: "0.9em", color: "#555" }}>{val}</div>
        ))}
      </span>
    );
  }

  function renderMulti(jsonStr) {
    let arr = [];
    try {
      arr = JSON.parse(jsonStr || "[]");
    } catch {
      // ignore parsing errors
    }
    if (!arr || !Array.isArray(arr) || arr.length === 0) return jsonStr || "";
    return (
      <span>
        {arr.map((val, i) => (
          <div key={i}>{val}</div>
        ))}
      </span>
    );
  }

  // Helper to render cell content based on column type
  const renderCell = (d, col) => {
    if (columnDefinitions[col]) {
      return columnDefinitions[col].render(d);
    }
    return d[col] || "";
  };

  // Map column names to header text
  const getColumnHeader = (col) => {
    if (columnDefinitions[col]) {
      return columnDefinitions[col].header;
    }
    return col.charAt(0).toUpperCase() + col.slice(1);
  };

  // Simple function with no animations
  const getRowClassName = (device) => {
    return "";
  };

  const columnDefinitions = {
    checkbox: {
      header: "",
      width: 40,
      render: (item) => (
        <input
          type="checkbox"
          checked={selected.includes(item.id || item.ip)}
          onChange={() => toggleSelect(item.id || item.ip)}
        />
      ),
    },
    name: {
      header: "Nom",
      render: (item) => {
        return (
          <Link
            to={`/devices/${item.id}`}
            style={{
              color: "#0969da",
              textDecoration: "none",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <ExternalLinkIcon width={16} height={16} color="#0969da" style={{ marginRight: 2 }} />
            {item.name || item.ip}
          </Link>
        );
      },
    },
    ip: {
      header: "IP",
      render: (item) => item.ip,
    },
    status: {
      header: "Status",
      render: (item) => (
        <span
          className={
            "status-badge " +
            (item.status === "online"
              ? "status-online"
              : item.status === "offline"
              ? "status-offline"
              : "status-unknown")
          }
        >
          {item.status || "unknown"}
        </span>
      ),
    },
    model: {
      header: "Model",
      render: (item) => renderMulti(item.model),
    },
    serial: {
      header: "Serial",
      render: (item) => renderMulti(item.serial),
    },
    version: {
      header: "Version",
      render: (item) => item.version,
    },
    vendor: {
      header: "Vendor",
      render: (item) => item.vendor,
    },
    os: {
      header: "OS",
      render: (item) => item.os,
    },
    selected: {
      header: "Sélectionné",
      render: (item) => (item.selected ? "Oui" : "Non"),
    },
    operation: {
      header: "",
      width: 40,
      render: (item) => (
        <OperationIndicator status={deviceOperations?.[item.id]?.status} />
      ),
    },
  };

  return (
    <div className="common-table-container">
      <div className="common-device-actions-group">
        <h6 className="device-table-title" style={{ margin: 0 }}>
          {title} {isLoading && <span className="loading-indicator">⟳</span>}
        </h6>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {ActionComponent && ActionComponent({
            selected,
            devices: devices,
            onRefresh: onRefresh,
            setSelected,
            projectId: projectId,
            startOperation: startOperation,
            completeOperation: completeOperation
          })}
        </div>
      </div>
      
      <table className="common-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col}>
                {col === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={selected.length === devices.length && devices.length > 0}
                    onChange={selectAll}
                    disabled={devices.length === 0}
                  />
                ) : getColumnHeader(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {devices.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", color: "#888" }}>
                Aucun device pour ce projet.
              </td>
            </tr>
          ) : (
            devices.map(d => (
              <tr key={d.id || d.ip} className={getRowClassName(d)}>
                {columns.map(col => (
                  <td key={`${d.id || d.ip}-${col}`}>
                    {renderCell(d, col)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}