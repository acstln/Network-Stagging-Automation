import React, { useState } from "react";
import "./DiscoverySubnetForm.css";

export default function DiscoverySubnetForm({ onDiscover, loading }) {
  const [subnet, setSubnet] = useState("172.17.77.0/29");
  const [error, setError] = useState("");

  function isValidSubnetOrRange(value) {
    // Subnet CIDR
    const cidr = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    // Range complet
    const rangeFull = /^(\d{1,3}\.){3}\d{1,3}-(\d{1,3}\.){3}\d{1,3}$/;
    // Range court (192.168.254.70-74)
    const rangeShort = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.)(\d{1,3})-(\d{1,3})$/;
    return cidr.test(value) || rangeFull.test(value) || rangeShort.test(value);
  }

  function countIps(value) {
    // CIDR
    const cidr = /^(\d{1,3}\.){3}\d{1,3}\/(\d{1,2})$/;
    const mCidr = value.match(cidr);
    if (mCidr) {
      const mask = parseInt(mCidr[2], 10);
      if (mask < 24) return 9999; // trop large
      if (mask === 32) return 1;
      return Math.pow(2, 32 - mask) - 2; // nombre d'IP (hors .0 et .255)
    }
    // Range complet
    const rangeFull = /^(\d{1,3}\.){3}\d{1,3}-(\d{1,3}\.){3}\d{1,3}$/;
    const mRangeFull = value.match(rangeFull);
    if (mRangeFull) {
      const ipToInt = ip => ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0);
      const start = ipToInt(mRangeFull[1]);
      const end = ipToInt(mRangeFull[2]);
      if (end < start) return -1; // Range négatif
      return Math.abs(end - start) + 1;
    }
    // Range court
    const rangeShort = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.)(\d{1,3})-(\d{1,3})$/;
    const mRangeShort = value.match(rangeShort);
    if (mRangeShort) {
      const start = parseInt(mRangeShort[2], 10);
      const end = parseInt(mRangeShort[3], 10);
      if (end < start) return -1; // Range négatif
      return Math.abs(end - start) + 1;
    }
    return 0;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidSubnetOrRange(subnet)) {
      setError("Invalid format. Exemple: 10.1.1.0/24 ou 10.1.1.1-10.1.1.10");
      return;
    }
    const nbIps = countIps(subnet);
    if (nbIps === -1) {
      setError("Invalid format. Ex: 10.1.1.0/27 or 10.1.1.1-10.1.1.99");
      return;
    }
    if (nbIps > 254) {
      setError("You cannot scan larger than a /24 or a range of 254 IPs maximum.");
      return;
    }
    setError("");
    onDiscover(subnet);
  };

  return (
    <form className="subnet-form" onSubmit={handleSubmit}>
      <div className="subnet-input-group">
        <input
          type="text"
          className="subnet-input"
          placeholder="Subnet or Range (10.0.0.1-5)"
          value={subnet}
          onChange={e => setSubnet(e.target.value)}
          required
        />
        <div className="subnet-error-block">
          {error && (
            <span className="subnet-error-message">{error}</span>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{ marginLeft: 12 }}
      >
        Discover
      </button>
    </form>
  );
}