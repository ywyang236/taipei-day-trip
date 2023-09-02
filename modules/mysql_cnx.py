import mysql.connector
import mysql.connector.pooling
import os
from flask import * 
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

def open_connection_pool():
    db_config = {
        "user": "root",
        "password": "@root123",
        "host": "localhost",
        "database": "taipei_day_trip",
        "charset": "utf8mb4",
    #    "host" : "localhost",
    #    "user" : os.getenv('db_user'),
    #    "password" : os.getenv('db_pw'),
    #    "database" : "taipei_trip",
    }

    connection_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name = "mysql_pool",
        pool_size = 5,
        autocommit = True,
        **db_config
    )

    return connection_pool



connection_pool = open_connection_pool()