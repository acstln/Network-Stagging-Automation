export async function discoverDevices(subnet) {
  const response = await fetch(`http://127.0.0.1:8000/discover?subnet=${subnet}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la requête.");
  }
  return response.json();
}

export async function deleteDevices(deviceIds) {
  // Adapte l’URL et la méthode à ton backend
  const res = await fetch("/api/devices/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: deviceIds }),
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
  return res.json();
}