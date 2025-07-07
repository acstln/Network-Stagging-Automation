import React, { useState } from "react";
import Select from "react-select";
import "./DiscoveryDeviceType.css";

const options = [
	{
		label: "Cisco",
		options: [
			{ value: "Catalyst 9K", label: "Catalyst 9K" },
			{ value: "Nexus N9K", label: "Nexus N9K" },
			{ value: "ASR", label: "ASR" },
			{ value: "NCS", label: "NCS" },
		],
	},
	{
		label: "Aruba",
		options: [
			{ value: "CX-Series", label: "CX-Series" },
			{ value: "CX6000", label: "CX6000" },
			{ value: "CX6100", label: "CX6100" },
			{ value: "CX6200", label: "CX6200" },
			{ value: "CX8100", label: "CX8100" },
		],
	},
	{
		label: "Juniper",
		options: [
			{ value: "EX-Series", label: "EX-Series" },
			{ value: "EX4400", label: "EX4400" },
			{ value: "EX4100", label: "EX4100" },
			{ value: "EX4650", label: "EX4650" },
		],
	},
];

function getOsFromModel(selectedModel) {
	if (selectedModel === "Catalyst 9K") return "IOS-XE";
	if (selectedModel === "Nexus N9K") return "NX-OS";
	if (selectedModel === "ASR") return "IOS-XR";
	if (selectedModel === "NCS") return "IOS-XR";
	if (
		selectedModel === "CX-Series" ||
		selectedModel === "CX6000" ||
		selectedModel === "CX6100" ||
		selectedModel === "CX6200" ||
		selectedModel === "CX8100"
	)
		return "AOS-CX";
	if (
		selectedModel === "EX-Series" ||
		selectedModel === "EX4400" ||
		selectedModel === "EX4100" ||
		selectedModel === "EX4650"
	)
		return "JunOS";
	return "";
}

export default function DiscoveryDeviceType({
	onDeviceTypeSelected,
	devices = [],
}) {
	const [models, setModels] = useState([]);

	const handleChange = (selectedOptions) => {
		setModels(selectedOptions || []);
		if (onDeviceTypeSelected) {
			onDeviceTypeSelected(
				(selectedOptions || []).map((opt) => ({
					model: opt.value,
					os: getOsFromModel(opt.value),
				}))
			);
		}
	};

	// Liste des OS détectés pour chaque modèle sélectionné
	const detectedOsList = (models || [])
		.map((opt) => getOsFromModel(opt.value))
		.filter(Boolean);

	// Vérifie si tous les devices ont un OS défini
	const allDevicesHaveOs =
		devices.length > 0 && devices.every((d) => !!d.os);

	return (
		<div>
			<h3 className="h3 is-4" style={{ margin: 0 }}>
				Define Device Type
			</h3>
			<span
				className={`stepNumber${
					allDevicesHaveOs ? " completed" : ""
				}`}
			>
				3
			</span>
			<div style={{ maxWidth: 350, marginTop: 12, marginBottom: 8 }}>
				<Select
					classNamePrefix="device-type-select"
					options={options}
					value={models}
					onChange={handleChange}
					placeholder="Select or search models..."
					isClearable
					isMulti
				/>
			</div>
			{detectedOsList.length > 0 && (
				<div
					style={{
						marginTop: 8,
						color: "#187943",
						fontWeight: 500,
					}}
				>
					Detected OS: {detectedOsList.join(", ")}
				</div>
			)}
			<div
				style={{
					marginTop: 12,
					background: "#f6f8fa",
					border: "1px solid #d0d7de",
					borderRadius: 6,
					color: "#24292f",
					fontWeight: 500,
					padding: "12px 16px",
					display: "flex",
					alignItems: "center",
					gap: 8,
					maxWidth: 420,
				}}
			>
				<span style={{ fontSize: 20, color: "#cf222e" }}>⚠️</span>
				<span>
					Please define the OS for each device using the results table on
					the right.
					<br />
					The step will be validated only when all devices have an OS set.
				</span>
			</div>
		</div>
	);
}