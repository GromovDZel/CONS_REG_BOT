import logging
import imaplib
import email
from email.header import decode_header
import base64
import requests
import time
from bs4 import BeautifulSoup 
import re

# Настройка логирования для mail_captcha
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(funcName)s - %(message)s',
                    filename='mail_log.txt',
                    filemode='a',
                    encoding='utf-8' )
logger = logging.getLogger(__name__)

IMAP_SERVER = "imap.gmail.com"
EMAIL_ACCOUNT = "vsckzagency@gmail.com"
PASSWORD = "aadv yjme mtai mxvs"

# API ключ для 2captcha
API_KEY = 'e066b705818762de339227e440dca0cd'
# URL для создания задачи в 2captcha
CREATE_TASK_URL = "http://2captcha.com/in.php"
# URL для получения результата задачи
GET_RESULT_URL = "http://2captcha.com/res.php"

def connect_to_mail():
    """Подключение к серверу IMAP и авторизация."""
    try:
        logger.debug("Попытка подключения к IMAP серверу.")
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, port=993)
        logger.debug("Попытка логина.")
        mail.login(EMAIL_ACCOUNT, PASSWORD)
        logger.info("Успешное подключение и авторизация.")
        return mail
    except imaplib.IMAP4.error as e:
        logger.error(f"Ошибка авторизации: {e}")
    except Exception as e:
        logger.error(f"Неожиданная ошибка подключения к почте: {e}")
    return None

def fetch_captcha_from_mail(mail):
    """Поиск и извлечение изображения капчи из тела письма."""
    logger.debug("Выбор папки 'inbox'.")
    mail.select("inbox")
    logger.debug("Поиск непрочитанных писем.")
    status, messages = mail.search(None, 'UNSEEN')
    if status != "OK":
        logger.error("Ошибка поиска писем.")
        return None

    logger.info(f"Найдено {len(messages[0].split())} непрочитанных писем.")
    for msg_num in messages[0].split():
        logger.debug(f"Попытка загрузки письма {msg_num}.")
        status, msg_data = mail.fetch(msg_num, "(RFC822)")
        if status != "OK":
            logger.error(f"Ошибка загрузки письма {msg_num}.")
            continue

        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                subject, encoding = decode_header(msg["Subject"])[0]
                if isinstance(subject, bytes):
                    subject = subject.decode(encoding or "utf-8")
                logger.info(f"Тема письма: {subject}")

                # Поиск изображения в теле письма
                for part in msg.walk():
                    logger.debug(f"Анализ части сообщения с типом {part.get_content_type()}")
                    if part.get_content_type() == "text/html":
                        html_content = part.get_payload(decode=True).decode('utf-8')
                        soup = BeautifulSoup(html_content, 'html.parser')
                        
                        # Логирование всего содержимого письма
                        logger.info(f"Содержимое письма:\n{soup.prettify()}")
                        
                        img_tag = soup.find('img', {'alt': 'Captcha Code'})
                        if img_tag:
                            img_src = img_tag.get('src')
                            logger.info(f"Найден URL изображения капчи: {img_src}")
                            
                            # Загрузка изображения по URL
                            response = requests.get(img_src)
                            if response.status_code == 200:
                                image_data = response.content
                                logger.debug(f"Размер данных изображения: {len(image_data)} байт")
                                captcha_solution = solve_captcha(image_data)
                                if captcha_solution:
                                    logger.info(f"Маркировка письма для удаления: {msg_num}")
                                    mail.store(msg_num, '+FLAGS', '\\Deleted')  # Mark for deletion
                                    mail.expunge()  # Permanently remove marked messages
                                return captcha_solution
                            else:
                                logger.error(f"Ошибка при загрузке изображения капчи: {response.status_code}")
                    elif part.get_content_maintype() == 'multipart':
                        logger.debug("Пропуск многочастного сообщения, но продолжаем поиск вложений.")
                        continue
                    elif part.get('Content-Disposition') is None:
                        logger.debug("Пропуск части без Content-Disposition.")
                        continue

    logger.info("Капча не найдена в новых письмах.")
    return None

def solve_captcha(image_data):
    """Отправка изображения капчи на сервер 2captcha и получение решения."""
    logger.debug("Кодирование изображения капчи в base64.")
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    data = {
        "key": API_KEY,
        "method": "base64",
        "body": image_base64,
        "json": 1
    }

    # Создание задачи для распознавания капчи
    logger.debug("Отправка запроса на создание задачи 2captcha.")
    response = requests.post(CREATE_TASK_URL, data=data)
    logger.debug(f"Ответ от 2captcha: {response.text}")
    result = response.json()
    if result.get('status') == 1:
        task_id = result['request']
        logger.info(f"Задача создана с ID: {task_id}")
        
        # Получение результата
        while True:
            logger.debug(f"Запрос статуса задачи с ID: {task_id}")
            result_response = requests.post(GET_RESULT_URL, data={"key": API_KEY, "action": "get", "id": task_id, "json": 1})
            logger.debug(f"Ответ на запрос статуса: {result_response.text}")
            result_data = result_response.json()
            if result_data.get('status') == 1:
                captcha_solution = result_data['request']
                # Handle different formats of captcha solution
                if '+' in captcha_solution or '=' in captcha_solution:
                    numbers = re.findall(r'\d+', captcha_solution)
                    sum_result = sum(int(num) for num in numbers)
                    logger.info(f"Капча решена после обработки: {sum_result}")
                    return str(sum_result)
                else:
                    logger.info(f"Капча решена: {captcha_solution}")
                    return captcha_solution
            elif result_data.get('status') == 0 and result_data.get('request') == "CAPCHA_NOT_READY":
                logger.info("Капча еще не готова, ожидаем...")
                time.sleep(5)
            else:
                logger.error(f"Ошибка при получении результата: {result_data.get('request')}")
                return None
    else:
        logger.error(f"Ошибка создания задачи: {result.get('request')}")
        return None

def main():
    """Основная функция для получения и решения капчи."""
    logger.debug("Начало основной функции.")
    mail = connect_to_mail()
    if mail:
        logger.debug("Попытка получения капчи из почты.")
        start_time = time.time()
        timeout = 40 

        while True:
            captcha_text = fetch_captcha_from_mail(mail)
            if captcha_text:
                logger.info(f"Капча решена: {captcha_text}")
                mail.logout()
                return captcha_text
            
            if time.time() - start_time > timeout:
                logger.info("Превышено время ожидания для получения письма с капчей.")
                break

            logger.info("Письмо с капчей не найдено, ждем еще...")
            time.sleep(10)
        mail.logout()
    else:
        logger.info("Не удалось подключиться к почте.")
    return None

if __name__ == "__main__":
    logger.debug("Запуск скрипта.")
    result = main()
    if result:
        logger.info(f"Результат: {result}")
    else:
        logger.info("Результат не получен.")