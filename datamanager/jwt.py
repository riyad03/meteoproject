from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

app = FastAPI()
security = HTTPBearer()  # looks for Authorization header

SECRET_KEY = "Ou8K3y3HBoMG0vS/QigykfHp17+E/O7xtt2TNgk04HM="
ALGORITHM = "HS256"



def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials  # Extract token from "Bearer <token>"

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")           # e.g., "riyad"
        roles = payload.get("roles", [])       # e.g., ["test"]
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": user_id, "roles": roles, "jwt": token}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")