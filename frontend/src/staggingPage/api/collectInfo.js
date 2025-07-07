export async function collectSwitchInfo(ip, username, password, os_type) {
  const response = await fetch("http://127.0.0.1:8000/collect_info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ip, username, password, os_type }),
  });
  if (!response.ok) throw new Error("Erreur lors de la collecte d'infos");
  return response.json();
}