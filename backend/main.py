from fastapi import FastAPI, Query, Body, HTTPException, Path, Request
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
from sqlmodel import Session, select, delete
from backend.bdd.models import Project, Device
from backend.bdd.database import engine, init_db
from typing import List
import os
import logging
from datetime import datetime
#from backend.DeviceOperations.download_config import download_iosxe_config

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

@app.get("/projects/{project_id}")
def get_project(project_id: int):
    with Session(engine) as session:
        project = session.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        devices = session.exec(select(Device).where(Device.project_id == project_id)).all()
        project_dict = project.dict()
        project_dict["devices"] = [d.dict() for d in devices]
        return project_dict

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

@app.delete("/projects/{project_id}")
def delete_project(project_id: int):
    with Session(engine) as session:
        # Supprimer d'abord tous les devices liés à ce projet
        session.exec(delete(Device).where(Device.project_id == project_id))
        # Puis supprimer le projet lui-même
        project = session.get(Project, project_id)
        if project:
            session.delete(project)
            session.commit()
        return {"ok": True}

# Détermine le chemin absolu du dossier ansible/playbooks
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PLAYBOOKS_DIR = os.path.abspath(os.path.join(BASE_DIR, "../ansible/Playbooks"))

GET_INFO_PLAYBOOKS = {
    "IOS-XE": os.path.join(PLAYBOOKS_DIR, "GetDeviceInfo/get_cisco_iosxe_info.yml"),
    "IOS-XR": os.path.join(PLAYBOOKS_DIR, "GetDeviceInfo/get_cisco_iosxr_info.yml"),
    "NX-OS": os.path.join(PLAYBOOKS_DIR, "GetDeviceInfo/get_cisco_nxos_info.yml"),
    "AOS-CX": os.path.join(PLAYBOOKS_DIR, "GetDeviceInfo/get_aruba_acxos_info.yml"),
    "JunOS": os.path.join(PLAYBOOKS_DIR, "GetDeviceInfo/get_juniper_junos_info.yml"),
}

GET_CONFIG_PLAYBOOKS = {
    "IOS-XE": os.path.join(PLAYBOOKS_DIR, "GetDeviceConfiguration/get_cisco_iosxe_config.yml"),
    # Ajoute ici les autres OS plus tard
}

@app.post("/projects/{project_id}/collect")
async def collect_info(project_id: int, body: dict):
    username = body["username"]
    password = body["password"]
    devices = body.get("devices")  # liste d'IDs ou d'IPs

    with Session(engine) as session:
        all_devices = session.exec(
            select(Device).where(
                Device.project_id == project_id,
                Device.status == "online",
                Device.vendor != None,
                Device.os != None
            )
        ).all()

        if devices:
            all_devices = [d for d in all_devices if (d.id in devices or d.ip in devices)]

        results = []
        for device in all_devices:
            playbook_path = GET_INFO_PLAYBOOKS.get(device.os)
            if not playbook_path or not os.path.exists(playbook_path):
                results.append({
                    "ip": device.ip,
                    "status": "error",
                    "message": f"Playbook not found for OS: {device.os}"
                })
                continue

            # Fichier temporaire pour la sortie
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=f"_info_{device.id}.txt") as tmpfile:
                output_file = tmpfile.name

            result = subprocess.run(
                [
                    "ansible-playbook",
                    playbook_path,
                    "-i", f"{device.ip},",
                    "--extra-vars", f"username={username} password={password} output_file={output_file}"
                ],
                capture_output=True,
                text=True,
                env=os.environ
            )
            if result.returncode != 0:
                msg = result.stderr or result.stdout or "Erreur inconnue"
                results.append({
                    "ip": device.ip,
                    "status": "error",
                    "message": msg,
                })
                continue

            # Lecture et mise à jour des champs du device
            if os.path.exists(output_file):
                with open(output_file) as f:
                    lines = f.readlines()
                facts = {}
                for line in lines:
                    if ":" in line:
                        k, v = line.split(":", 1)
                        facts[k.strip()] = v.strip()

                for key, value in facts.items():
                    if key == "Model":
                        device.model = value
                    elif key == "Serial":
                        device.serial = value
                    elif key == "Version":
                        device.version = value
                    elif key == "Hostname":
                        device.name = value
                
                model = facts.get("Model", "")
                serial = facts.get("Serial", "")

                # Récupère les listes stackées (JSON stringifié dans le fichier)
                stacked_models = facts.get("StackedModels", None)
                stacked_serials = facts.get("StackedSerials", None)

                if stacked_models:
                    try:
                        models_list = json.loads(stacked_models)
                    except Exception:
                        models_list = [model] if model else []
                else:
                    models_list = [model] if model else []

                if stacked_serials:
                    try:
                        serials_list = json.loads(stacked_serials)
                    except Exception:
                        serials_list = [serial] if serial else []
                else:
                    serials_list = [serial] if serial else []

                device.model = json.dumps(models_list)
                device.serial = json.dumps(serials_list)


                session.add(device)
                session.commit()
                os.remove(output_file)
                results.append({
                    "ip": device.ip,
                    "status": "ok",
                    "message": "Collecte réussie"
                })
            else:
                results.append({
                    "ip": device.ip,
                    "status": "error",
                    "message": "Fichier de sortie non trouvé"
                })
    return {"results": results}

@app.patch("/devices/{device_id}")
def patch_device(device_id: int, data: dict = Body(...)):
    with Session(engine) as session:
        device = session.get(Device, device_id)
        if not device:
            return {"error": "Device not found"}
        if "os" in data:
            device.os = data["os"]
        if "vendor" in data:
            device.vendor = data["vendor"]
        session.add(device)
        session.commit()
        return device.dict()

@app.post("/devices/{device_id}/ping")
def ping_device(device_id: int):
    # Fait un ping réel (ou équivalent) sur l'IP du device
    # Met à jour le champ status dans la base ("online" ou "offline")
    # Retourne {"online": True/False}
    with Session(engine) as session:
        device = session.get(Device, device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        response = ping(device.ip, count=1, timeout=1)
        status = "online" if response.success() else "offline"
        device.status = status
        session.add(device)
        session.commit()
        return {"online": status == "online"}

@app.post("/devices/{device_id}/download_config")
def download_config(device_id: int, body: dict):
    # Récupère l'IP, l'OS, etc. depuis la base
    with Session(engine) as session:
        device = session.get(Device, device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        if device.os != "IOS-XE":
            raise HTTPException(status_code=400, detail="Download config not implemented for this OS")
        username = body["username"]
        password = body["password"]
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_config_{device_id}.txt") as tmpfile:
            output_file = tmpfile.name
            print(tempfile)


        result = download_iosxe_config(device.ip, username, password)
        if "error" in result:
            return JSONResponse(status_code=500, content={"error": result["error"]})
        return {"config": result["config"]}

import os
print("Current working directory:", os.getcwd())

os.environ["ANSIBLE_HOST_KEY_CHECKING"] = "False"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

import os
import subprocess

def download_iosxe_config(ip, username, password):
    playbook_path = GET_CONFIG_PLAYBOOKS["IOS-XE"]
    if not os.path.exists(playbook_path):
        return {"error": f"Playbook not found: {playbook_path}"}
    result = subprocess.run(
        [
            "ansible-playbook",
            playbook_path,
            "-i", f"{ip},",
            "--extra-vars", f"username={username} password={password}"
        ],
        capture_output=True,
        text=True,
        env=os.environ
    )
    if result.returncode != 0:
        return {"error": result.stderr or result.stdout}
    # Cherche la config dans la sortie standard (debug)
    import re
    config = ""
    for line in result.stdout.splitlines():
        m = re.search(r'"msg":\s*"(.+)"', line)
        if m:
            config = m.group(1).encode('utf-8').decode('unicode_escape')
            break
    if not config:
        config = result.stdout
    return {"config": config}

import json

@app.post("/devices/{device_id}/backup_config")
def backup_config(device_id: int, body: dict):
    """
    Sauvegarde une configuration pour un appareil avec rotation des 5 dernières versions
    """
    try:
        with Session(engine) as session:
            device = session.get(Device, device_id)
            if not device:
                raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
            
            config = body.get("config", "")
            max_backups = body.get("max_backups", 5)
            timestamp = body.get("timestamp", datetime.now().isoformat())
            comment = body.get("comment", f"Backup du {datetime.now().strftime('%d/%m/%Y %H:%M')}")
            
            # Vérifier si le champ configurations existe déjà et est valide
            existing_configs = []
            try:
                if device.configuration:
                    existing_configs = json.loads(device.configuration)
                    if not isinstance(existing_configs, list):
                        existing_configs = []
            except (json.JSONDecodeError, TypeError):
                existing_configs = []
            
            # Créer un objet pour la nouvelle configuration
            new_config = {
                "content": config,
                "date": timestamp,
                "comment": comment
            }
            
            # Ajouter la nouvelle configuration au début de la liste
            existing_configs.insert(0, new_config)
            
            # Limiter le nombre de configurations
            if len(existing_configs) > max_backups:
                existing_configs = existing_configs[:max_backups]
            
            # Enregistrer la liste mise à jour
            device.configuration = json.dumps(existing_configs)
            session.add(device)
            session.commit()
            
            return {
                "success": True,
                "message": f"Configuration saved successfully",
                "config_count": len(existing_configs),
                "timestamp": timestamp
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving backup: {str(e)}")

@app.get("/devices/{device_id}")
def get_device(device_id: int):
    with Session(engine) as session:
        device = session.get(Device, device_id)
        if not device:
            raise HTTPException(status_code=404, detail="Device not found")
        return device.dict()

# Ajoute cet import s'il n'existe pas déjà
from fastapi import Query

# Ajoute cette route à la fin du fichier, avant le if __name__ == "__main__":
@app.get("/check-availability")
def check_devices_availability(device_ids: str = Query(None)):
    """
    Vérifie la disponibilité des devices par ping et met à jour leur statut dans la BDD.
    Si device_ids est fourni (format: "1,2,3"), vérifie seulement ces devices.
    Sinon, vérifie tous les devices.
    """
    with Session(engine) as session:
        # Détermine quels devices vérifier
        if device_ids:
            ids = [int(id) for id in device_ids.split(",") if id.strip().isdigit()]
            devices = session.exec(select(Device).where(Device.id.in_(ids))).all()
        else:
            devices = session.exec(select(Device)).all()
        
        # Vérifie chaque device et met à jour son statut
        updated_devices = []
        for device in devices:
            response = ping(device.ip, count=1, timeout=1)
            status = "online" if response.success() else "offline"
            
            # Met à jour uniquement si le statut a changé
            if device.status != status:
                device.status = status
                session.add(device)
            
            updated_devices.append(device.dict())
        
        # Sauvegarde les changements
        session.commit()
        
        return {"devices": updated_devices}
