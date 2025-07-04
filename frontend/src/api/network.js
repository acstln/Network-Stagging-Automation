export async function discoverDevices(subnet) {
  const response = await fetch(`http://127.0.0.1:8000/discover?subnet=${subnet}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la requête.");
  }
  return response.json();
}