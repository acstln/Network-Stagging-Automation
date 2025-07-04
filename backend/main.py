from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pythonping import ping
import ipaddress
import uuid
import threading
import time
from fastapi.responses import JSONResponse
from pydantic import BaseModel

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

def scan_network(scan_id, subnet):
    try:
        network = ipaddress.ip_network(subnet, strict=False)
        hosts = list(network.hosts())
        total = len(hosts)
        results = []
        for idx, ip in enumerate(hosts):
            response = ping(str(ip), count=1, timeout=1)
            status = "online" if response.success() else "offline"
            results.append({"ip": str(ip), "status": status})
            progress = int((idx + 1) / total * 100)
            scan_progress[scan_id] = {
                "progress": progress,
                "scanned": idx + 1,
                "total": total
            }
            scan_results[scan_id] = results.copy()  # <-- AJOUTE CETTE LIGNE ICI
        scan_progress[scan_id] = {
            "progress": 100,
            "scanned": total,
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
    threading.Thread(target=scan_network, args=(scan_id, subnet)).start()
    return {"scan_id": scan_id}

@app.get('/scan/progress/{scan_id}')
def get_progress(scan_id: str):
    data = scan_progress.get(scan_id, {"progress": 0, "scanned": 0, "total": 0})
    return JSONResponse(content=data)

@app.get('/scan/results/{scan_id}')
def get_scan_results(scan_id: str):
    results = scan_results.get(scan_id, [])
    return {"devices": results}

if __name__ == "__main__":
    app.run(debug=True)
