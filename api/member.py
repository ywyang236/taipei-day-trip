from flask import *
from modules.mysql_cnx import connection_pool
import modules.jwt as jwt_module
import modules.email as email_module
import datetime
from flask_bcrypt import Bcrypt

member_app = Blueprint("member_app", __name__)
bcrypt = Bcrypt()

# 註冊系統
@member_app.route("/api/user", methods=["POST"],)
def signup():
    name = request.json["name"]
    email = request.json["email"]
    password = request.json["password"]

    if not name or not email or not password:
        return jsonify({"error": True, "message": "請輸入完整資訊"}), 400

    if not email_module.validate_email(email):
        return jsonify({"error": True, "message": "請輸入正確的 Email 格式"}), 400

    if len(password) < 8:
        return jsonify({"error": True, "message": "密碼長度至少 8 個字元"}), 400

    try:
        # 建立資料庫連線
        connection = connection_pool.get_connection()
        cursor = connection.cursor()

        # 檢查帳號是否已經存在
        select_query = "SELECT * FROM members WHERE email = %s"
        values = (email,)
        cursor.execute(select_query, values)
        result = cursor.fetchone()
        
        if result:
            # 帳號已經存在
            return jsonify({"error": True, "message": "註冊失敗，此 Email 已被註冊"}), 400
        
        else:
            # 帳號不存在，可以註冊
            # 密碼加密
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

            # 將用戶輸入插入資料庫
            insert_query = "INSERT INTO members (name, email, password) VALUES (%s, %s, %s)" 
            values = (name, email, hashed_password)
            cursor.execute(insert_query, values)
            connection.commit()

            return jsonify({"ok": True}), 200

    except Exception as e:
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# 登入系統
@member_app.route("/api/user/auth", methods=["PUT"])
def signin():
    email = request.json["email"]
    password = request.json["password"]

    if not email or not password:
        return jsonify({"error": True, "message": "請輸入完整資訊"}), 400

    if not email_module.validate_email(email):
        return jsonify({"error": True, "message": "請輸入正確的 Email 格式"}), 400

    if len(password) < 8:
        return jsonify({"error": True, "message": "密碼長度至少 8 個字元"}), 400

    try:
        # 建立資料庫連線
        connection = connection_pool.get_connection()
        cursor = connection.cursor()

        # 使用提供的email查詢用戶詳細資料
        select_query = "SELECT id, name, password FROM members WHERE email = %s"
        values = (email,)
        cursor.execute(select_query, values)
        result = cursor.fetchone()

        if not result:
            return jsonify({"error": True, "message": "登入失敗，找不到該用戶"}), 400

        user_id, name, hashed_password = result

        # 使用bcrypt驗證密碼
        if not bcrypt.check_password_hash(hashed_password, password):
            return jsonify({"error": True, "message": "登入失敗，密碼不正確"}), 400

        # 產生JWT
        expiration = datetime.datetime.utcnow() + datetime.timedelta(days=7)
        token = jwt_module.encoded_jwt(user_id, name, email, expiration)
        
        return jsonify({"token": token,}), 200


    except Exception as e:
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# 使用者狀態系統
@member_app.route("/api/user/auth", methods=["GET"])
def user_state():
    try:
        # 取得 token
        token = request.headers.get("Authorization")

        if not token or "Bearer " not in token:
            return jsonify({"error": True, "message": "驗證失敗，無法取得 Token"}), 401

        token = token.split(" ")[1]

        # 解碼 token
        user_state = jwt_module.decoded_jwt(token)
        id = user_state["id"]
        name = user_state["name"]
        email = user_state["email"]

        # 建立資料庫連線
        connection = connection_pool.get_connection()
        cursor = connection.cursor()

        # 使用提供的id查詢用戶詳細資料
        select_query = "SELECT * FROM members WHERE id = %s"
        values = (id,)
        cursor.execute(select_query, values)
        result = cursor.fetchone()

        if not result:
            return jsonify({"error": True, "message": "驗證失敗，找不到該用戶"}), 401

        user_id, name, email, password = result

        # 產生JWT
        expiration = datetime.datetime.utcnow() + datetime.timedelta(days=7)
        token = jwt_module.encoded_jwt(user_id, name, email, expiration)
        signature_part = token.split('.')[2]

        payload = {
            "id": user_id,
            "name": name,
            "email": email,
        }

        # 返回使用者資訊
        return jsonify({"data": payload}), 200

    except Exception as e:
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()