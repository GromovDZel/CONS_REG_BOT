import sqlite3
import time
import subprocess
import os
import logging
from queue import PriorityQueue
import threading
import json

# Logger setup
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    filename='monitoring_log.txt', 
                    filemode='w')
logger = logging.getLogger()

DB_PATH = "user_requests.db"
COUNTRY_SCRIPTS = {
    "US": "US_main.py",
    "HU": "HU_booking.ts",
}

# Keep track of users currently being processed
processing_users = set()

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

def fetch_unregistered_users(conn):
    try:
        query = """
        SELECT u.user_id, u.first_name || ' ' || u.last_name AS full_name, r.country, u.priority
        FROM users u
        JOIN requests r ON u.user_id = r.user_id
        WHERE u.is_registered = FALSE
        ORDER BY u.priority ASC;
        """
        cursor = conn.cursor()
        cursor.execute(query)
        return cursor.fetchall()
    except sqlite3.Error as e:
        logger.error(f"SQLite error fetching unregistered users: {e}")
        return []

def update_registration_status(conn, user_id):
    try:
        query = "UPDATE users SET is_registered = TRUE WHERE user_id = ?;"
        cursor = conn.cursor()
        cursor.execute(query, (user_id,))
        conn.commit()
    except sqlite3.Error as e:
        logger.error(f"SQLite error updating registration status for user {user_id}: {e}")

def process_user(user, stop_event):
    def internal_process():
        user_id, name, country, priority = user
        if user_id in processing_users:
            logger.info(f"User {user_id} is already being processed. Skipping.")
            return False

        processing_users.add(user_id)
        try:
            with sqlite3.connect(DB_PATH) as conn:
                script_to_run = COUNTRY_SCRIPTS.get(country)

                if not script_to_run:
                    logger.warning(f"No script available for processing country: {country}")
                    return False

                user_data = fetch_user_data(conn, user_id)
                if user_data is None:
                    logger.error(f"User data for user {user_id} not found.")
                    return False

                _, name, country, birth_date, phone, email, passport_number, desired_date = user_data

                # Для TypeScript скрипта используем node и ts-node
                node_path = r"C:\Programs\NodeJS\node.exe"  # Укажите путь к вашему node.exe
                ts_node_path = r"C:\Projects\Cons_Reg_TS\node_modules\.bin\ts-script"  # Путь должен быть относительным к вашему проекту
                script_path = os.path.abspath(script_to_run)

                if not os.path.exists(node_path):
                    logger.error(f"Node.js not found at {node_path}")
                    return False
                if not os.path.exists(ts_node_path):
                    logger.error(f"ts-node not found at {ts_node_path}")
                    return False
                if not os.path.exists(script_path):
                    logger.error(f"Script {script_to_run} not found.")
                    return False

                try:
                    # Подготавливаем данные для передачи в TypeScript скрипт
                    data = {
                        "name": name,
                        "birth_date": str(birth_date),
                        "phone": str(phone),
                        "email": email,
                        "passport_number": str(passport_number),
                        "desired_date": str(desired_date)
                    }
                    
                    # Запускаем TypeScript скрипт через node и ts-node
                    result = subprocess.run(
                        [node_path, ts_node_path, script_path],
                        input=json.dumps(data),  # Передаем данные через stdin
                        check=False, 
                        capture_output=True, 
                        text=True, 
                        timeout=120  # Timeout после 2 минут
                    )

                    # Проверка на успешное выполнение
                    if result.returncode == 0:
                        logger.info(f"Script executed successfully: {result.stdout}")
                        if not stop_event.is_set():
                            update_registration_status(conn, user_id)
                            return True
                        else:
                            logger.info(f"Processing for user {name} interrupted due to a higher priority user appearing.")
                            return False
                    else:
                        logger.error(f"Script execution failed with return code {result.returncode}\nSTDOUT: {result.stdout}\nSTDERR: {result.stderr}")
                        return False
                except subprocess.TimeoutExpired:
                    logger.error(f"Timeout expired while running script for user {user_id}")
                    return False
                except Exception as e:
                    logger.error(f"Unexpected error running script: {e}")
                    return False
        finally:
            processing_users.remove(user_id)  # Remove user from processing set when done

    return internal_process


def monitor_database():
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        logger.info("Database monitoring started...")

        queues = {
            "US": PriorityQueue(),
            "HU": PriorityQueue()
        }
        stop_events = {
            "US": threading.Event(),
            "HU": threading.Event()
        }

        while True:
            users = fetch_unregistered_users(conn)
            for user in users:
                user_id, name, country, priority = user
                if country in queues and user_id not in processing_users:
                    queues[country].put((priority, user))
                    stop_events[country].set()  # Signal to stop current processing

            for country, queue in queues.items():
                if not queue.empty():
                    stop_events[country].clear()
                    priority, user = queue.get()
                    threading.Thread(target=process_user(user, stop_events[country])).start()

            time.sleep(10)

    except KeyboardInterrupt:
        logger.info("Monitoring stopped by user.")
    except Exception as e:
        logger.error(f"Unexpected error in monitor_database function: {e}")
    finally:
        if conn:
            conn.close()
            logger.info("Database connection closed.")

if __name__ == "__main__":
    monitor_database()