import React, { useState } from "react";

const modelsByVendor = {
  Cisco: [{ value: "c2960", label: "Catalyst 2960" }],
  Aruba: [{ value: "a2930", label: "2930F" }],
  Juniper: [{ value: "ex2200", label: "EX2200" }],
};

export default function DeviceTypeStep({ onSubmit }) {
  const [vendor, setVendor] = useState("");
  const [model, setModel] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ vendor, model });
  };

  return (
    <div>
      <h5>Device Type</h5>
      <span className="stepNumber">3</span>
      <form className="device-type-form" onSubmit={handleSubmit}>
        <label>Vendor</label>
        <select
          value={vendor}
          onChange={(e) => {
            setVendor(e.target.value);
            setModel("");
          }}
          required
        >
          <option value="">Select a vendor</option>
          <option value="Cisco">Cisco</option>
          <option value="Aruba">Aruba</option>
          <option value="Juniper">Juniper</option>
        </select>
        <label>Model</label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
          disabled={!vendor}
        >
          <option value="">Select a model</option>
          {vendor &&
            modelsByVendor[vendor].map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
        </select>
        <button type="submit" className="btn btn-sm btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}