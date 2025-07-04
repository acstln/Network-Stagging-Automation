import React from "react";
import "./DiscoverySubnetForm.css";

export default function SubnetForm({ subnet, setSubnet, onDiscover, loading, defaultSubnet }) {
  React.useEffect(() => {
    if (!subnet && defaultSubnet) {
      setSubnet(defaultSubnet);
    }
  }, [subnet, defaultSubnet, setSubnet]);

  const handleDiscover = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subnet }),
    });
    const data = await res.json();
    setScanId(data.scan_id);
  };

  return (
    <form
      className="subnet-form"
      onSubmit={e => {
        e.preventDefault();
        onDiscover(subnet);
      }}
    >
      <input
        type="text"
        value={subnet}
        onChange={(e) => setSubnet(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
      >
        Discover
      </button>
    </form>
  );
}