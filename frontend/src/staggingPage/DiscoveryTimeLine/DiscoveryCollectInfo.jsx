import React from "react";

export default function CollectInfoStep({ onCollect }) {
  return (
    <div>
      <h5>Collect Informations</h5>
      <span className="stepNumber">5</span>
      <button
        className="btn btn-sm btn-collect"
        type="button"
        onClick={onCollect}
      >
        Collect Informations
      </button>
    </div>
  );
}