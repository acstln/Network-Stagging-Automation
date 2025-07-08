export async function checkAvailability({ selectedDevices }) {
  // Pour chaque device sélectionné, on fait un appel API pour tester le ping
  // On suppose que tu as une route /devices/{id}/ping qui retourne { online: true/false }
  const results = await Promise.all(
    selectedDevices.map(async (device) => {
      const res = await fetch(`http://127.0.0.1:8000/devices/${device.id}/ping`, {
        method: "POST",
      });
      if (!res.ok) return { id: device.id, online: null };
      const data = await res.json();
      return { id: device.id, online: data.online };
    })
  );
  return results;
}