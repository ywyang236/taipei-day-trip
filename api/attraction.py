from flask import *
from modules.mysql_cnx import connection_pool

attraction_app = Blueprint("attraction_app", __name__)


# 取得景點資料表系統
# api/attractions?page=0
@attraction_app.route("/api/attractions")
def search_attractions():
	try:
		connection = connection_pool.get_connection()
		cursor = connection.cursor(dictionary=True)

		# 查尋引數
		keyword = request.args.get('keyword')
		current_page = int(request.args.get('page'))

		# 沒有 keyword
		if not keyword:
			select_data = (
				"SELECT attractions.*, GROUP_CONCAT(images.url) AS images FROM attractions "
				"INNER JOIN images ON attractions.id = images.attractions_id "
				"GROUP BY attractions.id "
				"LIMIT 13 OFFSET %s"
			)
			cursor.execute(select_data, (current_page * 12,))
			datas = cursor.fetchall()
		else:
			query_keyword = (
				"SELECT attractions.*, GROUP_CONCAT(images.url) AS images FROM attractions "
				"INNER JOIN images ON attractions.id = images.attractions_id "
				"WHERE mrt = %s OR name LIKE CONCAT('%', %s, '%') "
				"GROUP BY attractions.id "
				"LIMIT 13 OFFSET %s"
			)
			cursor.execute(query_keyword, (keyword, keyword, current_page * 12))
			datas = cursor.fetchall()

		# 查無資料
		if not datas:
			result_dict = {
				"nextPage": None,
				"data": []
			}
			return jsonify(result_dict), 200	

		# 處理資料
		for data in datas:
			data['images'] = data['images'].split(',')
			data['address'] = data['address'].replace(' ', '')

		result_dict = {}
		if len(datas) == 13:
			result_dict['nextPage'] = current_page + 1
			datas.pop()
		elif len(datas) < 13:
			result_dict['nextPage'] = None

		result_dict['data'] = datas

		return jsonify(result_dict), 200

	# 伺服器內部錯誤
	except:
		error_message = {
			"error": True,
			"message": "伺服器內部錯誤"
		}
		return jsonify(error_message), 500

	finally:
		if connection.is_connected():
			cursor.close()
			connection.close()

# 根據景點編號取得景點資料系統
# api/attraction/<id>
@attraction_app.route("/api/attraction/<id>")
def attraction_detail(id):
	try:
		connection = connection_pool.get_connection()
		cursor = connection.cursor(dictionary=True)
		cursor.execute("SET SESSION group_concat_max_len = 1000000")

		# 取得景點資料
		select_data = (
			"SELECT attractions.*, GROUP_CONCAT(images.url) AS images FROM attractions "
			"INNER JOIN images ON attractions.id = images.attractions_id "
			"WHERE attractions.id = %s "
		)
		cursor.execute(select_data, (id,))
		data = cursor.fetchone()
		
		# 景點編號不正確
		if data['id'] == None:
			error_message = {
				"error": True,
				"message": "景點編號不正確"
			}
			return jsonify(error_message), 400

		data['images'] = data['images'].split(',')
		data['address'] = data['address'].replace(' ', '')

		result_dict = {}
		result_dict['data'] = data
		
		return jsonify(result_dict), 200

	# 伺服器內部錯誤
	except:
		error_message = {
			"error": True,
			"message": "伺服器內部錯誤"
		}
		return jsonify(error_message), 500


	finally:
		if connection.is_connected():
			cursor.close()
			connection.close()

# 取得捷運站名稱列表系統
# api/mrts
@attraction_app.route("/api/mrts")
def search_mrt():
	try:
		connection = connection_pool.get_connection()
		cursor = connection.cursor(dictionary=True)

		# 取得 mrt 捷運站資料
		mrt_list = (
			"SELECT mrt, COUNT(*) AS attraction_count "
            "FROM attractions "
            "GROUP BY mrt "
            "ORDER BY attraction_count DESC"
		) 
		cursor.execute(mrt_list)
		mrt_data = cursor.fetchall()

		mrt_names = [data["mrt"] for data in mrt_data]

		result_dict = {"data": mrt_names}

		return jsonify(result_dict), 200

	# 伺服器內部錯誤
	except:
		error_message = {
			"error": True,
			"message": "伺服器內部錯誤"
		}
		return jsonify(error_message), 500


	finally:
		if connection.is_connected():
			cursor.close()
			connection.close()
