# First install the library:
# pip install config-client

from fastapi import FastAPI
from config import ConfigClient
import requests
import threading
import time
import uvicorn
import os

def load_config(app_name="datamanager", profile="dev", label="main", config_server="http://localhost:8888"):
    try:
        url = f"{config_server}/{app_name}/{profile}/{label}"
        print(f"Fetching config from {url}")
        response = requests.get(url)
        if response.status_code == 200:
            config_data = response.json()
            # Merge all sources (last one has highest priority)
            config = {}
            for source in reversed(config_data.get("propertySources", [])):
                config.update(source["source"])
            return config
        else:
            print(f"⚠️ Config server returned status {response.status_code}")
    except Exception as e:
        print("❌ Error fetching config:", e)
    return {}




config = load_config()




# Extract values with defaults
EUREKA_SERVER = config.get("eureka.client.service-url.defaultZone", "http://localhost:8761/eureka")
SERVICE_NAME = config.get("service.name", "datamanager")
SERVICE_PORT = config.get("service.port", 8083)
SERVICE_HOST = config.get("service.host", "localhost")

# Or use dot notation (if the library supports it)
# EUREKA_SERVER = config.eureka.server
# SERVICE_NAME = config.eureka.service.name

app = FastAPI(title="datamanager", version="1.0.0")

def register_with_eureka():
    """Register this service with Eureka"""
    registration_data = {
        "instance": {
            "instanceId": f"{SERVICE_HOST}:{SERVICE_NAME}:{SERVICE_PORT}",
            "hostName": SERVICE_HOST,
            "app": SERVICE_NAME.upper(),  # This should be DATAMANAGER
            "ipAddr": SERVICE_HOST,
            "port": {"$": SERVICE_PORT, "@enabled": "true"},
            "securePort": {"$": 443, "@enabled": "false"},
            "homePageUrl": f"http://{SERVICE_HOST}:{SERVICE_PORT}/",
            "statusPageUrl": f"http://{SERVICE_HOST}:{SERVICE_PORT}/actuator/info",
            "healthCheckUrl": f"http://{SERVICE_HOST}:{SERVICE_PORT}/actuator/health",
            "dataCenterInfo": {
                "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
                "name": "MyOwn"
            },
            "status": "UP",
            "vipAddress": SERVICE_NAME.upper(),  # Add this
            "secureVipAddress": SERVICE_NAME.upper()  # Add this
        }
    }
    
    try:
        BASE_EUREKA_URL = EUREKA_SERVER.rstrip("/")
        print(f"Registering with URL: {BASE_EUREKA_URL}/apps/{SERVICE_NAME.upper()}")
        response = requests.post(
            f"{BASE_EUREKA_URL}/apps/{SERVICE_NAME.upper()}",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Registration response: {response.status_code}")
        if response.status_code == 204:
            print(f"✅ Successfully registered {SERVICE_NAME} with Eureka")
        else:
            print(f"❌ Failed to register with Eureka: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error registering with Eureka: {e}")
    
    try:
        BASE_EUREKA_URL = EUREKA_SERVER.rstrip("/")
        response = requests.post(
            f"{BASE_EUREKA_URL}/apps/{SERVICE_NAME.upper()}",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 204:
            print(f"Successfully registered {SERVICE_NAME} with Eureka")
        else:
            print(f"Failed to register with Eureka: {response.status_code}")
    except Exception as e:
        print(f"Error registering with Eureka: {e}")

def send_heartbeat():
    """Send heartbeat to Eureka every 30 seconds"""
    while True:
        try:
            response = requests.put(
                f"{EUREKA_SERVER}/apps/{SERVICE_NAME.upper()}/{SERVICE_HOST}:{SERVICE_NAME}:{SERVICE_PORT}"
            )
            if response.status_code == 200:
                print("Heartbeat sent successfully")
        except Exception as e:
            print(f"Error sending heartbeat: {e}")
        time.sleep(30)

@app.on_event("startup")
async def startup_event():
    """Register with Eureka on startup"""
    register_with_eureka()
    # Start heartbeat thread
    heartbeat_thread = threading.Thread(target=send_heartbeat, daemon=True)
    heartbeat_thread.start()

@app.get("/test")
async def test():
    """Test endpoint"""
    return "datamanager test 2"

@app.get("/actuator/health")
async def health():
    """Health check endpoint for Eureka"""
    return {"status": "UP"}

@app.get("/actuator/info")
async def info():
    """Info endpoint for Eureka"""
    return {"app": SERVICE_NAME, "version": "1.0.0"}

@app.get("/config")
async def get_config():
    """Debug endpoint to view current configuration"""
    return config.config

@app.post("/actuator/refresh")
async def refresh_config():
    """Refresh configuration from config server"""
    global config, EUREKA_SERVER, SERVICE_NAME, SERVICE_PORT, SERVICE_HOST
    
    # Reload configuration
    config = load_config()
    
    # Update global variables
    EUREKA_SERVER = config.get("eureka.server", "http://localhost:8761/eureka")
    SERVICE_NAME = config.get("service.name", "datamanager")
    SERVICE_PORT = config.get("service.port", 8083)
    SERVICE_HOST = config.get("service.host", "localhost")
    
    return {"status": "Configuration refreshed"}

if __name__ == "__main__":
    print(f"Starting {SERVICE_NAME} on port {SERVICE_PORT}")
    print(f"Eureka server: {EUREKA_SERVER}")
    uvicorn.run(app, host="0.0.0.0", port=SERVICE_PORT)