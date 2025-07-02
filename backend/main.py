from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pythonping import ping
import ipaddress

app = FastAPI()

# 👉 CORS pour autoriser React à appeler FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # à restreindre en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
