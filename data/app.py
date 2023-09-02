import mysql.connector
import json
import re
import os

# 取得目前工作目錄
current_directory = os.getcwd()

# 取得檔案路徑
file_path = os.path.join(current_directory, 'data/taipei-attractions.json')

# 把 json 轉成字典
with open(file_path, 'r', encoding='utf-8') as json_file:
    data = json.load(json_file)

    attractions = data['result']['results']

    try:
        # 連接資料庫
        db_config={
            "user": "root",
            "password": "@root123",
            "host": "localhost",
            "database": "taipei_day_trip"
        }
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        print("資料庫連線成功")

        insert_attraction = (
            "INSERT INTO attractions "
            "(id, name, category, description, address, transport, mrt, lat, lng) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        )

        insert_img = (
            "INSERT INTO images "
            "(attractions_id, url) "
            "VALUES (%s, %s)"
        )

        # store in mysql database using loop
        for attraction in attractions:
            # insert into attractions table
            attraction_data = (
                attraction['_id'], 
                attraction['name'], 
                attraction['CAT'], 
                attraction['description'], 
                attraction['address'], 
                attraction['direction'],
                attraction['MRT'], 
                attraction['latitude'], 
                attraction['longitude']
                )

            cursor.execute(insert_attraction, attraction_data)
            conn.commit()
            print("新增景點資料成功")

            # insert into images table
            # extract jpg/png
            pattern = 'https?://[\w/.-]+\.(?:jpe?g|png)'
            pics = re.findall(pattern, attraction['file'], re.IGNORECASE)

            for pic in pics:
                cursor.execute(insert_img, (attraction['_id'], pic))
                conn.commit()

    finally:
        # 關閉資料庫連線
        cursor.close()
        conn.close()
        print("資料庫連線已關閉")