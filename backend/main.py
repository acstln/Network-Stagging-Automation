from fastapi import FastAPI, Query, Body, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from pythonping import ping
import ipaddress
import uuid
import threading
import time
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import re
import subprocess
import json
from sqlmodel import Session, select
from backend.bdd.models import Project, Device
from backend.bdd.database import engine, init_db
from typing import List

app = FastAPI()
init_db()

# 👉 CORS pour autoriser React à appeler FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou ["http://localhost:5173"] si tu veux restreindre
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scan_progress = {}  # {scan_id: {"progress": int, "scanned": int, "total": int}}
scan_results = {}  # {scan_id: [{"ip": "x.x.x.x", "status": "online/offline"}, ...]}
stop_flags = {}  # <-- Ajouté pour gérer l'arrêt du scan

def scan_network(scan_id, subnet, project_id):
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
            # Ping l'IP
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

            # Ajoute ou met à jour en base à chaque résultat
            with Session(engine) as session:
                device = session.exec(
                    select(Device).where(Device.project_id == project_id, Device.ip == str(ip))
                ).first()
                if device:
                    if device.status != status:
                        device.status = status  # Met à jour le status si changé
                        session.add(device)
                else:
                    device = Device(
                        ip=str(ip),
                        status=status,
                        project_id=project_id
                    )
                    session.add(device)
                session.commit()
    except Exception as e:
        print("Erreur dans le scan:", e)
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
    project_id: int  # <-- ajoute cette ligne

@app.post('/scan')
def start_scan(req: ScanRequest):
    subnet = req.subnet
    project_id = req.project_id
    scan_id = str(uuid.uuid4())
    scan_progress[scan_id] = 0
    stop_flags[scan_id] = threading.Event()
    threading.Thread(target=scan_network, args=(scan_id, subnet, project_id)).start()  # <-- passe project_id
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

@app.post("/collect_info")
def collect_info(ip: str = Body(...), username: str = Body(...), password: str = Body(...), os_type: str = Body(...)):
    # Appelle le playbook Ansible en ligne de commande
    cmd = [
        "ansible-playbook",
        "-i", f"{ip},",  # virgule pour inventaire inline
        "--extra-vars", f"ansible_user={username} ansible_password={password} ansible_network_os={os_type}",
        "/Users/acas/Documents/dev/Axians/Network-Stagging-Automation/ansible/get_cisco_info_to_file.yml"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    # Lis le fichier généré par le playbook
    try:
        with open("/Users/acas/Documents/dev/Axians/Network-Stagging-Automation/ansible/output.txt") as f:
            lines = f.read().splitlines()
        data = {}
        for line in lines:
            if ":" in line:
                k, v = line.split(":", 1)
                data[k.strip().lower()] = v.strip()
        return data
    except Exception as e:
        return {"error": str(e), "ansible_output": result.stdout, "ansible_error": result.stderr}

@app.post("/projects/", response_model=Project)
def create_project(project: Project):
    with Session(engine) as session:
        session.add(project)
        session.commit()
        session.refresh(project)
        return project  # <-- c'est ce qui renvoie l'id généré

@app.post("/devices/", response_model=Device)
def create_device(device: Device):
    with Session(engine) as session:
        session.add(device)
        session.commit()
        session.refresh(device)
        return device

@app.get("/projects/", response_model=List[Project])
def list_projects():
    with Session(engine) as session:
        return session.exec(select(Project)).all()

@app.get("/projects/{project_id}", response_model=Project)
def get_project(project_id: int):
    with Session(engine) as session:
        project = session.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project

@app.get("/devices")
def list_devices():
    with Session(engine) as session:
        devices = session.exec(select(Device)).all()
        return [d.dict() for d in devices]

@app.get("/projects/{project_id}/devices")
def get_project_devices(project_id: int):
    with Session(engine) as session:
        devices = session.exec(
            select(Device).where(Device.project_id == project_id)
        ).all()
        return [d.dict() for d in devices]

@app.delete("/devices/{device_id}")
def delete_device(device_id: int = Path(...)):
    with Session(engine) as session:
        device = session.get(Device, device_id)
        if device:
            session.delete(device)
            session.commit()
        return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
