import os

import pymysql

def setup_db():
    print("Attempting to connect to local MySQL Server...")
    
    credentials = [
        {
            "host": os.getenv("MYSQL_HOST", "127.0.0.1"),
            "user": os.getenv("MYSQL_USER", "root"),
            "password": os.getenv("MYSQL_ROOT_PASSWORD", ""),
        },
    ]
    
    connection = None
    for creds in credentials:
        try:
            connection = pymysql.connect(
                host=creds["host"],
                user=creds["user"],
                password=creds["password"],
            )
            print(f"SUCCESS: Successfully connected to MySQL as user '{creds['user']}'!")
            break
        except Exception as e:
            pass
            
    if not connection:
        print("ERROR: Could not connect to MySQL using default credentials.")
        print("Please ensure MySQL server is running (e.g. via XAMPP or MySQL Service).")
        print("If you have a specific password, please create the database manually:")
        print("CREATE DATABASE servicelink;")
        return
        
    try:
        with connection.cursor() as cursor:
            cursor.execute("CREATE DATABASE IF NOT EXISTS servicelink;")
            print("SUCCESS: Database 'servicelink' created successfully!")
    except Exception as e:
        print(f"ERROR: Failed to create database: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    setup_db()
