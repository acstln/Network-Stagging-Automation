import React, { useRef } from "react";
import "../../common/CommonDeviceActions.css";

const OS_OPTIONS = [
  { os: "IOS-XE", vendor: "Cisco" },
  { os: "IOS-XR", vendor: "Cisco" },
  { os: "NX-OS", vendor: "Cisco" },
  { os: "ACXOS", vendor: "Aruba" },
  { os: "JunOS", vendor: "Juniper" },
];

export default function DiscoveryDeviceActions({
  selected,
  setShowOsMenu,
  onDelete,
  showOsMenu,
  onSetOs,
  selectedOs,
  setSelectedOs,
}) {
  const osBtnRef = useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (osBtnRef.current && !osBtnRef.current.contains(event.target)) {
        setShowOsMenu(false);
      }
    }
    if (showOsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOsMenu, setShowOsMenu]);

  return (
    <div className="device-actions-group">
      <div className="action-btn-dropdown-container" ref={osBtnRef}>
        <button
          className="action-btn"
          type="button"
          disabled={selected.length === 0}
          onClick={() => selected.length > 0 && setShowOsMenu((v) => !v)}
        >
          Set OS
        </button>
        {showOsMenu && (
          <div className="action-btn-dropdown-menu">
            {OS_OPTIONS.map((opt) => (
              <div
                key={opt.os}
                className={
                  "action-btn-dropdown-option" +
                  (selectedOs === opt.os ? " selected" : "")
                }
                onClick={() => onSetOs(opt)}
                onMouseEnter={() => setSelectedOs(opt.os)}
              >
                {opt.os}{" "}
                <span style={{ color: "#888", fontSize: 12 }}>
                  ({opt.vendor})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        className="action-btn action-btn--delete"
        type="button"
        disabled={selected.length === 0}
        onClick={onDelete}
      >
        Delete
      </button>
    </div>
  );
}