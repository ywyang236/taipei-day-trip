import jwt
import os
import datetime
from dotenv import load_dotenv
load_dotenv()

def encoded_jwt(user_id, name, email, exp_date):

    user_id = str(user_id)
    name = str(name)
    email = str(email)
    exp_date = int(exp_date.timestamp())

    payload ={
        "id": user_id,
        "name": name,
        "email": email,
        "exp": exp_date
    }

    return jwt.encode(payload, os.getenv("secret"), algorithm="HS256")


def decoded_jwt(token):
    try:
        user_state = jwt.decode(token, os.getenv("secret"), algorithms=["HS256"])
        return user_state
    
    except jwt.ExpiredSignatureError:
        return "Token 已經過期"
    
    except jwt.InvalidTokenError:
        return "無效的 Token"

    