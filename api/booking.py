from flask import *
from modules.mysql_cnx import connection_pool
import modules.jwt as jwt_module
from datetime import datetime

booking_app = Blueprint("booking_app", __name__)


# GET /api/booking 取得尚未確認下單的預定行程
@booking_app.route("/api/booking", methods=["GET"])
def get_unconfirmed_booking():
    # 取得 token
    token = request.headers.get("Authorization")

    if not token or "Bearer " not in token:
        return jsonify({"error": True, "message": "尚未登入，無法預約"}), 403

    token = token.split(" ")[1]

    # 解碼 token 以取得使用者ID
    try:
        user_state = jwt_module.decoded_jwt(token)
        user_id = user_state["id"]
    except Exception as e:
        return jsonify({"error": True, "message": "無法取得使用者資訊，請再試一次 "}), 403

    # 建立資料庫連線並查詢未確認下單的預定行程
    try:
        connection = connection_pool.get_connection()
        cursor = connection.cursor()

        # 查詢使用者姓名
        select_user_name_query = """
        SELECT name FROM members WHERE id = %s
        """
        values = (user_id,)
        cursor.execute(select_user_name_query, values)
        user_name_result = cursor.fetchone()

        if user_name_result:
            user_name = user_name_result[0]
        else:
            return jsonify({"error": True, "message": "無法取得使用者姓名"}), 403

        select_query = """
        SELECT bookings.id, attractions.id, attractions.name, attractions.address, images.url, bookings.date, bookings.time, bookings.price 
        FROM bookings 
        JOIN attractions ON bookings.attractions_id = attractions.id 
        LEFT JOIN (
            SELECT attractions_id, MAX(url) as url 
            FROM images 
            GROUP BY attractions_id
        ) as images ON attractions.id = images.attractions_id
        WHERE bookings.members_id = %s 
        AND bookings.date >= CURDATE()
        ORDER BY bookings.date ASC, FIELD(bookings.time, 'morning', 'afternoon')
        """
        values = (user_id,)
        cursor.execute(select_query, values)
        results = cursor.fetchall()

        all_bookings = []

        for result in results:
            booking_id, attraction_id, name, address, image, date, time, price = result

            booking = {
                "booking_id": booking_id, 
                "attraction": {
                    "id": attraction_id,
                    "name": name,
                    "address": address.replace("  ", ""),
                    "image": image
                },
                "date": date.strftime('%Y-%m-%d'),
                "time": time,
                "price": price
            }
            all_bookings.append(booking)

        return jsonify({"data": all_bookings}), 200

        if not result:
            return jsonify({"data": None}), 200
    except Exception as e:
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# POST /api/booking 建立新的預定行程
@booking_app.route("/api/booking", methods=["POST"])
def create_new_booking():
    # 取得 token
    token = request.headers.get("Authorization")

    # 驗證 token 是否存在且格式正確
    if not token or "Bearer " not in token:
        return jsonify({"error": True, "message": "尚未登入，無法預約"}), 403

    token = token.split(" ")[1]

    # 解碼 token 以取得使用者ID
    try:
        user_state = jwt_module.decoded_jwt(token)
        user_id = user_state["id"]
    except Exception as e:
        return jsonify({"error": True, "message": "無法取得使用者資訊，請再試一次"}), 403

    # 從 request body 中取得預定行程資訊
    data = request.json
    attraction_id = data.get("attractionId")
    date = data.get("date")
    time = data.get("time")
    price = data.get("price")

    # 檢查所選日期是否已過
    if datetime.strptime(date, "%Y-%m-%d").date() < datetime.today().date():
        return jsonify({"error": True, "message": "無法選擇過去日期"}), 400

    # 驗證時間值
    if time not in ["morning", "afternoon"]:
        return jsonify({"error": True, "message": "所選時間有誤"}), 400

    # 驗證取得的資訊是否完整
    if not all([attraction_id, date, time, price]):
        return jsonify({"error": True, "message": "輸入資料不完整或格式錯誤"}), 400

    # 建立資料庫連線並新增預定行程
    try:
        connection = connection_pool.get_connection()
        cursor = connection.cursor()

        # 檢查所選景點是否存在
        attraction_query = "SELECT id FROM attractions WHERE id = %s"
        cursor.execute(attraction_query, (attraction_id,))
        attraction_exists = cursor.fetchone()
        if not attraction_exists:
            return jsonify({"error": True, "message": "所選景點不存在"}), 400

        # 檢查是否已存在相同的訂單
        check_query = """
        SELECT id FROM bookings WHERE attractions_id = %s AND date = %s AND time = %s AND members_id = %s
        """
        cursor.execute(check_query, (attraction_id, date, time, user_id))
        existing_booking = cursor.fetchone()

        # 如果查詢結果存在相同訂單，則返回錯誤訊息
        if existing_booking:
            return jsonify({"error": True, "message": "已存在相同的訂單"}), 400

        # 新增預定行程
        insert_query = """
        INSERT INTO bookings (attractions_id, members_id, date, time, price) 
        VALUES (%s, %s, %s, %s, %s)
        """
        values = (attraction_id, user_id, date, time, price)
        cursor.execute(insert_query, values)
        connection.commit()

        # 取得新增的預定行程ID，並回傳給前端
        select_query = """
        SELECT id FROM bookings WHERE attractions_id = %s AND members_id = %s AND date = %s AND time = %s
        """
        values = (attraction_id, user_id, date, time)
        cursor.execute(select_query, values)
        booking_id = cursor.fetchone()[0]

        return jsonify({"ok": True, "id": booking_id}), 200

    except Exception as e:
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# DELETE /api/booking/<booking_id> 刪除目前的預定行程（接受多筆訂單）
@booking_app.route("/api/booking/<int:booking_id>", methods=["DELETE"])
def delete_booking(booking_id):
    # 取得 token
    token = request.headers.get("Authorization")

    if not token or "Bearer " not in token:
        return jsonify({"error": True, "message": "尚未登入，無法刪除預定行程"}), 403

    token = token.split(" ")[1]

    # 解碼 token 以取得使用者ID
    try:
        user_state = jwt_module.decoded_jwt(token)
        user_id = user_state["id"]
    except Exception as e:
        return jsonify({"error": True, "message": "無法取得使用者資訊，請再試一次"}), 403

    # 建立資料庫連線並刪除特定的預定行程
    try:
        connection = connection_pool.get_connection()
        cursor = connection.cursor()

        delete_query = """
        DELETE FROM bookings WHERE id = %s AND members_id = %s
        """
        values = (booking_id, user_id)
        cursor.execute(delete_query, values)
        connection.commit()

        if cursor.rowcount == 0:  # 表示沒有任何行程被刪除
            return jsonify({"error": True, "message": "找不到指定的預定行程或您沒有權限刪除此行程"}), 403

        return jsonify({"ok": True}), 200

    except Exception as e:
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
