from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pythonping import ping
import ipaddress
import uuid
import threading
import time
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import re

app = FastAPI()

# 👉 CORS pour autoriser React à appeler FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # à restreindre en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scan_progress = {}  # {scan_id: {"progress": int, "scanned": int, "total": int}}
scan_results = {}  # {scan_id: [{"ip": "x.x.x.x", "status": "online/offline"}, ...]}
stop_flags = {}  # <-- Ajouté pour gérer l'arrêt du scan

def scan_network(scan_id, subnet):
    try:
        ips = parse_ip_range(subnet)
        if ips:
            hosts = [ipaddress.IPv4Address(ip) for ip in ips]
        else:
            network = ipaddress.ip_network(subnet, strict=False)
            hosts = list(network.hosts())
        total = len(hosts)
        results = []
        stop_event = stop_flags.get(scan_id)
        for idx, ip in enumerate(hosts):
            if stop_event and stop_event.is_set():
                break
            response = ping(str(ip), count=1, timeout=1)
            status = "online" if response.success() else "offline"
            results.append({"ip": str(ip), "status": status})
            progress = int((idx + 1) / total * 100)
            scan_progress[scan_id] = {
                "progress": progress,
                "scanned": idx + 1,
                "total": total
            }
            scan_results[scan_id] = results.copy()
        scan_progress[scan_id] = {
            "progress": 100,
            "scanned": len(results),
            "total": total
        }
        scan_results[scan_id] = results
    except Exception:
        scan_progress[scan_id] = {
            "progress": 100,
            "scanned": 0,
            "total": 0
        }
        scan_results[scan_id] = []

@app.get("/")
def read_root():
    return {"message": "Hello depuis FastAPI 👋"}

@app.get("/discover")
def discover(subnet: str = Query(...)):
    devices = []

    # Génère toutes les IP du subnet
    ips = parse_ip_range(subnet)
    if ips:
        # Range détecté
        for ip in ips:
            response = ping(str(ip), count=1, timeout=1)
            status = "online" if response.success() else "offline"
            devices.append({"ip": str(ip), "status": status})
        return {"devices": devices}
    else:
        # Subnet CIDR classique
        try:
            network = ipaddress.ip_network(subnet, strict=False)
        except ValueError:
            return {"error": "Subnet invalide"}
        for ip in network.hosts():
            response = ping(str(ip), count=1, timeout=1)
            status = "online" if response.success() else "offline"
            devices.append({"ip": str(ip), "status": status})

    return {"devices": devices}

class ScanRequest(BaseModel):
    subnet: str

@app.post('/scan')
def start_scan(req: ScanRequest):
    subnet = req.subnet
    scan_id = str(uuid.uuid4())
    scan_progress[scan_id] = 0
    stop_flags[scan_id] = threading.Event()  # <-- Initialise le flag d'arrêt
    threading.Thread(target=scan_network, args=(scan_id, subnet)).start()
    return {"scan_id": scan_id}

@app.post('/scan/stop/{scan_id}')
def stop_scan(scan_id: str):
    if scan_id in scan_progress:
        if scan_id not in stop_flags:
            stop_flags[scan_id] = threading.Event()
        stop_flags[scan_id].set()
        return {"status": "stopping"}
    return {"status": "not_found"}

@app.get('/scan/progress/{scan_id}')
def get_progress(scan_id: str):
    data = scan_progress.get(scan_id, {"progress": 0, "scanned": 0, "total": 0})
    return JSONResponse(content=data)

@app.get('/scan/results/{scan_id}')
def get_scan_results(scan_id: str):
    results = scan_results.get(scan_id, [])
    return {"devices": results}

def parse_ip_range(subnet):
    # Format long: 192.168.254.70-192.168.254.74
    m = re.match(r"^(\d{1,3}(?:\.\d{1,3}){3})-(\d{1,3}(?:\.\d{1,3}){3})$", subnet)
    if m:
        start_ip = m.group(1)
        end_ip = m.group(2)
        start = int(ipaddress.IPv4Address(start_ip))
        end = int(ipaddress.IPv4Address(end_ip))
        return [str(ipaddress.IPv4Address(ip)) for ip in range(start, end + 1)]
    # Format court: 192.168.254.70-74
    m = re.match(r"^(\d{1,3}\.\d{1,3}\.\d{1,3}\.)(\d{1,3})-(\d{1,3})$", subnet)
    if m:
        prefix = m.group(1)
        start = int(m.group(2))
        end = int(m.group(3))
        return [f"{prefix}{i}" for i in range(start, end + 1)]
    return None

if __name__ == "__main__":
    app.run(debug=True)
