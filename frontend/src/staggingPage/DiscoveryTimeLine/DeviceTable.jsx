import React from "react";

export default function DeviceTable({ devices }) {
  if (!devices.length) return null;

  return (
    <table className="Table Table--bordered width-full mt-4">
      <thead>
        <tr>
          <th>IP Address</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {devices.map((device) => (
          <tr key={device.ip}>
            <td>{device.ip}</td>
            <td>
              <span
                className={`Label mr-2 ${
                  device.status === "online"
                    ? "Label--success"
                    : "Label--danger"
                }`}
              >
                {device.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}