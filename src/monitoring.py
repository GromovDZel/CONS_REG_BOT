# -*- coding: utf-8 -*-

import sqlite3
import time
import subprocess
import os
os.environ['PYTHONIOENCODING'] = 'utf-8'
import logging
import json

# Logger setup
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    filename="monitoring_log.txt",
    filemode="w",
)
logger = logging.getLogger()



DB_PATH = "user_requests.db"
COUNTRY_SCRIPTS = {
    "US": "US_main.py",
    "HU": "HU_booking.ts",  # Если вы компилируете TypeScript в JavaScript
}

# Keep track of the current user being processed
current_user = None

def set_powershell_encoding():
    try:
        command = '$OutputEncoding = [System.Text.Encoding]::UTF8; Write-Output "PowerShell Core encoding set to UTF-8"'
        result = subprocess.run(["pwsh", "-Command", command], check=True, capture_output=True, text=True)
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Failed to set PowerShell encoding to UTF-8: {e}")
    except Exception as e:
        print(f"An error occurred while setting PowerShell encoding: {e}")
        
def fetch_user_data(conn, user_id):
    try:
        query = """
        SELECT u.user_id, u.first_name || ' ' || u.last_name AS full_name, r.country, r.birth_date, r.phone, r.email, 
               r.passport_number, r.desired_date
        FROM users u
        JOIN requests r ON u.user_id = r.user_id
        WHERE u.user_id = ?;
        """
        cursor = conn.cursor()
        cursor.execute(query, (user_id,))
        return cursor.fetchone()
    except sqlite3.Error as e:
        logger.error(f"SQLite error fetching user data for user {user_id}: {e}")
        return None


def fetch_unregistered_user(conn):
    try:
        query = """
        SELECT u.user_id, u.first_name || ' ' || u.last_name AS full_name, r.country, u.priority
        FROM users u
        JOIN requests r ON u.user_id = r.user_id
        WHERE u.is_registered = FALSE
        ORDER BY u.priority ASC
        LIMIT 1;
        """
        cursor = conn.cursor()
        cursor.execute(query)
        return cursor.fetchone()
    except sqlite3.Error as e:
        logger.error(f"SQLite error fetching unregistered users: {e}")
        return None

def update_registration_status(conn, user_id, status=None):
    try:
        # Обновляем статус регистрации в зависимости от значения status
        if status is not None:
            query = "UPDATE users SET is_registered = ? WHERE user_id = ?;"
            cursor = conn.cursor()
            cursor.execute(query, (status == "success", user_id))
        else:
            query = "UPDATE users SET is_registered = TRUE WHERE user_id = ?;"
            cursor = conn.cursor()
            cursor.execute(query, (user_id,))
        conn.commit()
        
        logger.info(f"Updated registration status for user {user_id} to {'registered' if status == 'success' else 'not registered'}")
    except sqlite3.Error as e:
        logger.error(f"SQLite error updating registration status for user {user_id}: {e}")
    finally:
        if 'cursor' in locals():  # Убедимся, что курсор был создан, прежде чем пытаться его закрыть
            cursor.close()

def process_user(user):
    global current_user

    user_id, name, country, priority = user
    current_user = user_id

    with sqlite3.connect(DB_PATH) as conn:
        script_to_run = COUNTRY_SCRIPTS.get(country)

        if not script_to_run:
            logger.warning(f"No script available for processing country: {country}")
            current_user = None
            return False

        user_data = fetch_user_data(conn, user_id)
        if user_data is None:
            logger.error(f"User data for user {user_id} not found.")
            current_user = None
            return False

        _, name, country, birth_date, phone, email, passport_number, desired_date = user_data

        node_path = r"C:\Programs\NodeJS\node.exe"
        compiled_js_path = r"C:\Projects\Cons_Reg_TS\dist\HU_booking.js"
        script_path = r"C:\Projects\Cons_Reg_TS\src\HU_booking.ts"  

        tsc_path = r"C:\Users\Admin\AppData\Roaming\npm\tsc" 
        if not os.path.exists(node_path):
            logger.error(f"Node.js not found at {node_path}")
            current_user = None
            return False
        if not os.path.exists(script_path):
            logger.error(f"Script {script_to_run} not found.")
            current_user = None
            return False

        try:
            data = {
                "name": name,
                "birth_date": str(birth_date),
                "phone": str(phone),
                "email": email,
                "passport_number": str(passport_number),
                "desired_date": str(desired_date),
            }

            while True:
                # Check write permissions before changing permissions
                if not os.access(script_path, os.W_OK):
                    logger.error(f"No write permissions for {script_path}")
                    current_user = None
                    return False

                os.chmod(script_path, 0o777)  # Change permissions only if we can write

                try:
                    logger.info(f"node_path: {node_path}, exists: {os.path.exists(node_path)}")
                    logger.info(f"script_path: {script_path}, exists: {os.path.exists(script_path)}")
                    encoded_data = json.dumps(data).encode('utf-8').decode('unicode_escape')

                    # Compile TypeScript to JavaScript first
                    compiled_js_path = os.path.splitext(script_path)[0] + '.js'
                    compile_command = f"{tsc_path} {script_path} --outDir {os.path.dirname(compiled_js_path)}"
                    compile_result = subprocess.run(compile_command, shell=True, check=True, capture_output=True, text=True)
                    if compile_result.returncode != 0:
                        logger.error(f"TypeScript compilation failed with the following errors:\n{compile_result.stderr}")
                        update_registration_status(conn, user_id, status="failed")
                        return False

                    command = f'pwsh -Command "Start-Process {node_path} -ArgumentList \'{compiled_js_path}\', \'{encoded_data}\', \'--experimental-specifier-resolution=node\' -Verb RunAs -Wait"'                    
                    set_powershell_encoding()
                    logger.info(f"Executing command: {command}")
                    result = subprocess.run(
                        command,
                        check=False,
                        capture_output=True,
                        text=True,
                        encoding='utf-8',
                        timeout=120
                    )
                    logger.info(f"Command execution result: {result.returncode}")
                    logger.info(f"Command stdout: {result.stdout}")
                    logger.info(f"Command stderr: {result.stderr}")
                    
                    if result.returncode == 1:  # Assuming 0 indicates success, adjust if not
                        logger.info(f"Script executed successfully with return code {result.returncode}")
                        logger.info(f"STDOUT: {result.stdout}")
                        update_registration_status(conn, user_id, status="success")
                        current_user = None
                        return True
                    else:
                        logger.error(f"Script execution failed with return code {result.returncode}")
                        logger.error(f"STDOUT: {result.stdout}")
                        logger.error(f"STDERR: {result.stderr}")
                        update_registration_status(conn, user_id, status="failed")
                except subprocess.TimeoutExpired:
                    logger.error(f"Timeout expired while running script for user {user_id}")
                except KeyboardInterrupt:
                    logger.info("Script execution interrupted by user.")
                    current_user = None
                    return False
        except Exception as e:
            error_str = str(e)
            if not error_str:
                error_str = repr(e)
            logger.error(f"Unexpected error running script:")
            logger.error(f"Type: {type(e).__name__}")
            logger.error(f"Error: {error_str.encode('utf-8', 'ignore').decode('utf-8', 'ignore')}")
            current_user = None
            return False

def monitor_database():
    global current_user

    try:
        logger.info("Database monitoring started...")
        while True:
            with sqlite3.connect(DB_PATH) as conn:
                if current_user is None:
                    user = fetch_unregistered_user(conn)
                    if user:
                        logger.info(f"Processing user: {user}")
                        process_user(user)
                    else:
                        logger.info("No unregistered users found. Waiting...")
                time.sleep(10)  # Может быть увеличен для меньшей нагрузки на систему
    except KeyboardInterrupt:
        logger.info("Monitoring stopped by user.")
    except Exception as e:
        logger.error(f"Unexpected error in monitor_database function: {e}")

if __name__ == "__main__":
    monitor_database()