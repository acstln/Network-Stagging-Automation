export async function backupConfig({ device, creds }) {
  const res = await fetch(`http://127.0.0.1:8000/devices/${device.id}/backup_config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: creds.username,
      password: creds.password,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "Failed to backup config");
  }
  return data;
}