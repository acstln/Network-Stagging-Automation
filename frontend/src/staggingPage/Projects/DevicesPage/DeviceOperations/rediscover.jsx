import { checkAvailability } from "./checkAvailability";

export async function rediscoverDevices({ projectId, creds, selectedDevices, onStatusUpdate }) {
  // 1. Vérifie la disponibilité de chaque device
  const availabilityResults = await checkAvailability({ selectedDevices });

  // 1b. Mets à jour le status localement si un callback est fourni
  if (typeof onStatusUpdate === "function") {
    availabilityResults.forEach(({ id, online }) => {
      onStatusUpdate(id, online ? "online" : "offline");
    });
  }

  // 2. Filtre les devices qui sont UP
  const upDevices = selectedDevices.filter(device => {
    const found = availabilityResults.find(r => r.id === device.id);
    return found && found.online === true;
  });

  // 3. Pour ceux qui sont DOWN, prépare un message d'erreur
  const downDevices = selectedDevices.filter(device => {
    const found = availabilityResults.find(r => r.id === device.id);
    return !found || found.online === false;
  });

  if (downDevices.length > 0) {
    const names = downDevices.map(d => d.name || d.ip || d.id).join(", ");
    throw new Error(
      `The following devices are not reachable (offline): ${names}.\n\n` +
      `Please check their connectivity before running Rediscover.`
    );
  }

  // 4. Lance la collecte uniquement sur les devices UP
  const res = await fetch(`http://127.0.0.1:8000/projects/${projectId}/collect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: creds.username,
      password: creds.password,
      devices: upDevices.map(d => d.id || d.ip),
    }),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    console.error("Error parsing response from collect:", e);
    throw new Error("An unexpected error occurred during collection.");
  }

  if (!res.ok) {
    // Si le backend renvoie une erreur globale
    console.error("Collect API error:", data);
    throw new Error(data?.detail || "Erreur lors de la collecte");
  }

  // Gestion des erreurs playbook device par device (si backend renvoie un tableau de résultats)
  if (Array.isArray(data.results)) {
    const errors = data.results.filter(r => r.status === "error");
    if (errors.length > 0) {
      errors.forEach(err => {
        console.error(`Playbook error for device ${err.ip || err.id}: ${err.message}`);
      });
      const msg = errors.map(err =>
        `Device ${err.ip || err.id}: ${err.message}`
      ).join("\n");
      throw new Error(
        "Some devices failed during collection:\n\n" + msg
      );
    }
  }

  return data;
}