from flask import *
import modules.jwt as jwt_module
from modules.mysql_cnx import connection_pool
import requests
import uuid
import os
from dotenv import load_dotenv

# 取得環境變數
load_dotenv()

partner_key = os.getenv("PARTNER_KEY")
merchant_id = os.getenv("MERCHANT_ID")

order_app = Blueprint("order_app", __name__)

# POST /api/orders 建立新的訂單，並完成付款程序
@order_app.route("/api/orders", methods=["POST"])
def create_order():

    connection = None
    cursor = None

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

    # 從 request body 中取得訂單資訊
    data = request.json

    # 建立資料庫連線並新增訂單
    try:
        connection = connection_pool.get_connection()
        cursor = connection.cursor()
    
        # 新增到 orders 資料表的資料
        order_number = str(uuid.uuid4())
        
        values = (
            user_id, 
            order_number, 
            data['order']['total_price'], 
            data['order']['contact']['name'], 
            data['order']['contact']['email'], 
            data['order']['contact']['phone'], 
            0
        )
        
        cursor.execute("""
        INSERT INTO orders (members_id, order_number, total_price, contact_name, contact_email, contact_phone, payment_status)
        VALUES (%s, %s, %s, %s, %s, %s, %s)        
        """, values)

        # 新增到 order_details 資料表的資料
        order_id = cursor.lastrowid # 取得新增的訂單編號
        
        # 取得每個景點的詳細資料
        for trip_detail in data['order']['trip']:
            details_values = (
                order_id, 
                trip_detail['attraction']['id'], 
                trip_detail['date'], 
                trip_detail['time'], 
                trip_detail['price']
            )

            cursor.execute("""
                INSERT INTO order_details (order_id, attractions_id, date, time, price)
                VALUES (%s, %s, %s, %s, %s)
            """, details_values)
            

        # 儲存資料庫變更
        connection.commit()

        # 傳送 prime 到 TapPay 
        data = {
            "prime": data['prime'],
            "partner_key": partner_key,
            "merchant_id": merchant_id,
            "details": "TapPay Test",
            "amount": data['order']['total_price'],
            "cardholder": {
                "phone_number": "+886" + data['order']['contact']['phone'][1:],
                "name": data['order']['contact']['name'],
                "email": data['order']['contact']['email']
            },
            "order_number": order_number,
            
        }

        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "x-api-key": partner_key,
        }

        response = requests.post("https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime", headers=headers, data=json.dumps(data).encode('utf-8'))
        response = response.json()

        # 如果付款成功，order_status 設為 1
        if response['status'] == 0:
            cursor.execute("""
                UPDATE orders SET payment_status = 1 WHERE id = %s
            """, (order_id,))
            connection.commit()

            # 刪除使用者購物車內的商品
            cursor.execute("""
                DELETE FROM bookings WHERE members_id = %s
            """, (user_id,))
            connection.commit()

            response = {
                "data": {
                    "number": order_number,
                    "payment": {
                        "status": 0,
                        "message": "付款成功"
                    }
                }
            }
            return jsonify(response), 200
        
        elif response['status']:
            cursor.execute("""
                UPDATE orders SET payment_status = %s WHERE id = %s
            """, (response['status'], order_id))

            response = {
                "data": {
                    "number": order_number,
                    "payment": {
                        "status": response['status'],
                        "message": "付款失敗"
                    }
                }
            }
            return jsonify(response), 200

    except Exception as e:
        print(f"處理訂單時出錯: {e}")
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()

    return jsonify({"message": "成功"}), 200

# GET/api/order/{orderNumber}根據訂單編號取得訂單資訊
@order_app.route("/api/order/<order_number>" , methods=["GET"])
def get_order(order_number):

    connection = None
    cursor = None

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
        print(f"解碼成功，取得的 user_id: {user_id}")

    except Exception as e:
        print(f"解碼 token 時出錯: {e}")
        return jsonify({"error": True, "message": "無法取得使用者資訊，請再試一次"}), 403

    # 建立資料庫連線並取得訂單資訊
    try:
        connection = connection_pool.get_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT 
                orders.id, orders.order_number, orders.total_price, 
                orders.contact_name, orders.contact_email, orders.contact_phone, 
                orders.payment_status, orders.order_time, 
                order_details.date, order_details.time, order_details.price, 
                attractions.name, attractions.address, 
                (SELECT url FROM images WHERE attractions.id = images.attractions_id LIMIT 1) AS image_url
            FROM 
                orders
            INNER JOIN 
                order_details ON orders.id = order_details.order_id
            INNER JOIN 
                attractions ON order_details.attractions_id = attractions.id
            WHERE 
                orders.order_number = %s;
        """, (order_number,))

        orders = cursor.fetchall()

        # 如果訂單不存在，回傳錯誤訊息
        if not orders:
            print(f"根據訂單編號 {order_number}，在資料庫中找不到相對應的訂單")
            return jsonify({"error": True, "message": "找不到訂單"}), 404
        else:
            print(f"根據訂單編號 {order_number}，在資料庫中找到的訂單資訊: {orders}")
            
        # 如果訂單存在，但不屬於該使用者，回傳錯誤訊息
        if orders[0][1] != order_number:
            return jsonify({"error": True, "message": "找不到訂單"}), 404


        trip = []  # 用於儲存所有的行程資訊
        for order in orders:
            trip_detail = {
                "attraction": {
                    "id": order[0],
                    "name": order[11],
                    "address": order[12].replace("  ", ""),
                    "image": order[13]
                },
                "date": order[8],
                "time": order[9],
                "price": order[10]
            }
            trip.append(trip_detail)

        response = {
            "data": {
                "order_number": orders[0][1],
                "total_price": orders[0][2],
                "trip": trip,
                "contact": {
                    "name": orders[0][3],
                    "email": orders[0][4],
                    "phone": orders[0][5]
                },
                "status": orders[0][6],
                "created_at": orders[0][7]
            }
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"取得訂單時出錯: {e}")
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()




