import requests
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

app = FastAPI()
security = HTTPBearer()

SECRET_KEY = "your_jwt_secret_key"
ALGORITHM = "HS256"


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": user_id, "jwtToken": token}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/api/notify/send")
def send_notification(current_user: dict = Depends(get_current_user)):
    payload = {"message": "data sent", "userId": current_user["user_id"]}

    try:
        response = requests.post(
            "http://notification-service.local/api/notify/send",
            json=payload,
            headers={"Authorization": f"Bearer {current_user['jwtToken']}"}
        )
        response.raise_for_status()
        return {"status": "success", "downstream_response": response.json()}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
