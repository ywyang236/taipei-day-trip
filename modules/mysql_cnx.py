import mysql.connector
import mysql.connector.pooling
import os
from flask import * 
from dotenv import load_dotenv

load_dotenv()

mysql_user = os.getenv("MYSQL_USER")
mysql_password = os.getenv("MYSQL_PASSWORD")
mysql_host = os.getenv("MYSQL_HOST")
mysql_database = os.getenv("MYSQL_DATABASE")

app = Flask(__name__)

def open_connection_pool():
    db_config = {
        "user": mysql_user,
        "password": mysql_password,
        "host": mysql_host,
        "database": mysql_database,
        "charset": "utf8mb4",
    }

    connection_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name = "mysql_pool",
        pool_size = 10,
        autocommit = True,
        **db_config
    )

    return connection_pool

connection_pool = open_connection_pool()