import React from "react";

export default function CollectInfoStep({ onCollect }) {
  return (
    <div>
       <h3 className="h3 is-4">Collect Informations</h3>
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