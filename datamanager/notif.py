from fastapi import FastAPI, Depends
from typing import Dict
import requests
from jwt import get_current_user

app = FastAPI()


NOTIFICATION_SERVICE_URL = "http://localhost:8086/api/notify/send"



async def notif(msg:str,current_user: dict ):
    print("this is a notification to send")
    # Prepare payload
    payload = {
        "message": msg,
        "userId": str(current_user["user_id"])  # send the current user ID
    }

    # Forward the same JWT to notification service
    headers = {
        "Authorization": f"Bearer {current_user['jwt']}",
        "Content-Type": "application/json"
    }

    # Send POST request to notification service
    response = requests.post(NOTIFICATION_SERVICE_URL, json=payload, headers=headers)

    # Return response from notification service
    return {
        "status": response.status_code,
        "response": response.json()
    }