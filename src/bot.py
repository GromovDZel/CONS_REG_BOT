from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.client.bot import DefaultBotProperties
from aiogram.enums import ParseMode
import asyncio
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
import sqlite3
import datetime
import logging

API_TOKEN = '7900145035:AAFdbBhE3mxQqbQfHniE1KOTiXLy4H29dnc'
DB_PATH = 'user_requests.db'
ADMIN_ID = 'YOUR_ADMIN_TELEGRAM_ID_HERE'  # Замените на ID администратора

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = Bot(
    token=API_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)
dp = Dispatcher()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                            user_id INTEGER PRIMARY KEY,
                            country TEXT,
                            username TEXT,
                            first_name TEXT,
                            last_name TEXT,
                            birth_date TEXT,
                            priority INTEGER DEFAULT 3,
                            is_registered BOOLEAN DEFAULT FALSE)''')
        
        # Изменяем запрос на создание таблицы requests
        cursor.execute('''CREATE TABLE IF NOT EXISTS requests (
                            id INTEGER PRIMARY KEY,
                            user_id INTEGER,
                            first_name TEXT,
                            last_name TEXT,
                            country TEXT,
                            birth_date TEXT,
                            phone TEXT,
                            email TEXT,
                            passport_number TEXT,
                            desired_date TEXT,
                            priority INTEGER DEFAULT 3,
                            visa_type TEXT,
                            FOREIGN KEY (user_id) REFERENCES users (user_id))''')
        
        # Если таблица уже существует, добавляем столбец
        cursor.execute('PRAGMA table_info(requests)')
        columns = cursor.fetchall()
        if 'visa_type' not in [col[1] for col in columns]:
            cursor.execute('ALTER TABLE requests ADD COLUMN visa_type TEXT')
        
        conn.commit()
        print("Таблицы успешно созданы/обновлены.")
    except sqlite3.Error as e:
        print(f"Ошибка при создании таблиц: {e}")
    finally:
        conn.close()

def add_request(user_id, username, first_name, last_name, request_data):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        INSERT OR IGNORE INTO users (user_id, username, first_name, last_name, priority, is_registered)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        user_id,
        username,
        first_name,
        last_name,
        request_data.get('priority', 3),
        False  
    ))

    # Вставка данных запроса
    cursor.execute('''
    INSERT OR REPLACE INTO requests (id, user_id, first_name, last_name, country, birth_date, phone, email, passport_number, desired_date, priority, visa_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
''', (
    request_data['id'],
    user_id,
    request_data['first_name'],
    request_data['last_name'],
    request_data['country'],
    request_data['birth_date'],
    request_data['phone'],
    request_data['email'],
    request_data['passport_number'],
    request_data['desired_date'],
    request_data.get('priority', 3),
    request_data['visa_type']
))

    conn.commit() 
    conn.close()

async def notify_admin(user_id, username, first_name, last_name):
    await bot.send_message(ADMIN_ID, f"Новый пользователь зарегистрирован:\nID: {user_id}\n@nickname: @{username}\nИмя: {first_name} {last_name}")

def delete_user_by_username(username):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            DELETE FROM requests
            WHERE user_id = (
                SELECT user_id
                FROM users
                WHERE username = ?
            )
        ''', (username,))
        cursor.execute('''
            DELETE FROM users
            WHERE username = ?
        ''', (username,))
        conn.commit()
    except sqlite3.Error as e:
        print(f"Ошибка при удалении пользователя: {e}")
    finally:
        conn.close()

def update_registration_status_by_nickname(nickname, is_registered):
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # First, fetch the user_id based on the nickname
        cursor.execute('''
            SELECT user_id FROM users 
            WHERE username = ?
        ''', (nickname,))
        
        user = cursor.fetchone()
        if user is None:
            logger.warning(f"User with nickname {nickname} not found.")
            return False  # User not found
        
        user_id = user[0]
        
        # Update the registration status
        cursor.execute('''
            UPDATE users 
            SET is_registered = ?
            WHERE user_id = ?
        ''', (is_registered, user_id))
        
        logger.info(f"Updated registration status for user @{nickname} to {is_registered}")
        
        conn.commit()
        return True  # Update successful
    except sqlite3.Error as e:
        logger.error(f"Error updating registration status for user @{nickname}: {str(e)}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()

def fetch_all_data():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute(''' 
            SELECT 
                r.id, u.username, u.first_name, u.last_name, 
                r.country, r.birth_date, r.phone, r.email, 
                r.passport_number, r.desired_date, r.priority, r.visa_type, u.is_registered
            FROM users u
            JOIN requests r ON u.user_id = r.user_id
            ORDER BY r.priority ASC, r.desired_date ASC
        ''')
        data = cursor.fetchall()
    except sqlite3.Error as e:
        print(f"Ошибка запроса: {e}")
        data = []
    finally:
        conn.close()

    return data

class AddUserState(StatesGroup):
    ID = State()
    USERNAME = State()
    FIRST_NAME = State()
    LAST_NAME = State()
    COUNTRY = State()
    BIRTH_DATE = State()
    PHONE = State()
    EMAIL = State()
    PASSPORT_NUMBER = State()
    DESIRED_DATE = State()
    PRIORITY = State()
    VISA_TYPE = State()

country_keyboard = ReplyKeyboardMarkup(
    keyboard=[
        [KeyboardButton(text='US')],
        [KeyboardButton(text='HU')]
    ],
    resize_keyboard=True,
    one_time_keyboard=True
)

visa_type_keyboard = InlineKeyboardMarkup(
    inline_keyboard=[
        [InlineKeyboardButton(text="Бизнес", callback_data="Business")],
        [InlineKeyboardButton(text="Туристическая", callback_data="Tourist")],
        [InlineKeyboardButton(text="Гостевая", callback_data="Visitor")]
    ]
)

@dp.message(Command(commands=["update_reg_status"]))
async def update_reg_status_command(message: types.Message):
    args = message.text.split()
    if len(args) != 3:
        await message.answer("Используйте: /update_reg_status @nickname <true/false>")
        return
    
    try:
        nickname = args[1].lstrip('@')  # Remove '@' if present
        status = args[2].lower() == 'true'
        if update_registration_status_by_nickname(nickname, status):
            await message.answer(f"Статус регистрации для пользователя @{nickname} обновлен на {'зарегистрирован' if status else 'не зарегистрирован'}.")
        else:
            await message.answer(f"Не удалось обновить статус регистрации для пользователя @{nickname}. Пользователь не найден или произошла ошибка.")
    except ValueError:
        await message.answer("Неверный формат статуса. Используйте 'true' или 'false'.")
@dp.message(Command(commands=["cancel"]))
async def cancel_command(message: types.Message, state: FSMContext):
    current_state = await state.get_state()
    if current_state is None:
        await message.answer("Нет активного процесса для отмены.")
        return
    await state.clear()
    await message.answer("Процесс отменен.")

@dp.message(Command(commands=["add_user"]))
async def add_user_command(message: types.Message, state: FSMContext):
    await state.set_state(AddUserState.ID)
    await message.answer("ID клиента для базы данных:")

@dp.message(AddUserState.ID)
async def process_id(message: types.Message, state: FSMContext):
    try:
        await state.update_data(id=int(message.text))
    except ValueError:
        await message.answer("ID должен быть числом. Пожалуйста, введите снова.")
        return
    await state.set_state(AddUserState.USERNAME)
    await message.answer("Введите @nickname клиента:")

@dp.message(AddUserState.USERNAME)
async def process_username(message: types.Message, state: FSMContext):
    if not message.text.startswith('@'):
        await message.answer("Никнейм должен начинаться с '@'. Попробуйте снова.")
        return
    await state.update_data(username=message.text.lstrip('@'))
    await state.set_state(AddUserState.FIRST_NAME)
    await message.answer("Введите имя клиента по паспорту:")

@dp.message(AddUserState.FIRST_NAME)
async def process_first_name(message: types.Message, state: FSMContext):
    await state.update_data(first_name=message.text)
    await state.set_state(state=AddUserState.LAST_NAME)
    await message.answer("Введите фамилию клиента по паспорту:")

@dp.message(AddUserState.LAST_NAME)
async def process_last_name(message: types.Message, state: FSMContext):
    await state.update_data(last_name=message.text)
    await state.set_state(state=AddUserState.COUNTRY)
    await message.answer("Выберите посольство:", reply_markup=country_keyboard)

@dp.message(AddUserState.COUNTRY)
async def process_country(message: types.Message, state: FSMContext):
    if message.text not in ['US', 'HU']:
        await message.answer("Пожалуйста, выберите US или HU.")
        return
    await state.update_data(country=message.text)
    await state.set_state(state=AddUserState.BIRTH_DATE)
    await message.answer("Введите дату рождения клиента (формат: ДД.ММ.ГГГГ):", reply_markup=types.ReplyKeyboardRemove())

@dp.message(AddUserState.BIRTH_DATE)
async def process_birth_date(message: types.Message, state: FSMContext):
    await state.update_data(birth_date=message.text)
    await state.set_state(state=AddUserState.PHONE)
    await message.answer("Введите номер телефона клиента:")

@dp.message(AddUserState.PHONE)
async def process_phone(message: types.Message, state: FSMContext):
    await state.update_data(phone=message.text)
    await state.set_state(state=AddUserState.EMAIL)
    await message.answer("Введите email (для HU - vsckzagency@gmail.com):")

@dp.message(AddUserState.EMAIL)
async def process_email(message: types.Message, state: FSMContext):
    await state.update_data(email=message.text)
    await state.set_state(state=AddUserState.PASSPORT_NUMBER)
    await message.answer("Введите номер паспорта клиента (для HU - без пробелов):")

@dp.message(AddUserState.PASSPORT_NUMBER)
async def process_passport_number(message: types.Message, state: FSMContext):
    await state.update_data(passport_number=message.text)
    await state.set_state(state=AddUserState.DESIRED_DATE)
    await message.answer("Введите желаемую дату для записи клиента (Запись будет осуществляться до обозначенной даты включительно. Формат: ДД.ММ.ГГГГ):")

@dp.message(AddUserState.DESIRED_DATE)
async def process_desired_date(message: types.Message, state: FSMContext):
    try:
        desired_date = datetime.datetime.strptime(message.text, "%d.%m.%Y").date()
        await state.update_data(desired_date=desired_date.strftime("%Y-%m-%d"))
        await state.set_state(state=AddUserState.PRIORITY)
        await message.answer("Введите приоритет (число от 1 до 3):")
    except ValueError:
        await message.answer("Некорректный формат даты. Введите в формате DD.MM.YYYY.")

@dp.message(AddUserState.PRIORITY)
async def process_priority(message: types.Message, state: FSMContext):
    try:
        priority = int(message.text)
        if priority not in [1, 2, 3]:
            await message.answer("Приоритет должен быть числом от 1 до 3.")
            return
    except ValueError:
        await message.answer("Приоритет должен быть числом.")
        return

    await state.update_data(priority=priority)
    await state.set_state(state=AddUserState.VISA_TYPE)
    await message.answer("Выберите тип визы:", reply_markup=visa_type_keyboard)

@dp.callback_query(lambda c: c.data in ["Business", "Tourist", "Visitor"])
async def process_visa_type(callback_query: types.CallbackQuery, state: FSMContext):
    await state.update_data(visa_type=callback_query.data)
    data = await state.get_data()
    
    if 'id' not in data:
        await bot.answer_callback_query(callback_query.id, text="Произошла ошибка, пожалуйста, попробуйте снова.")
        await bot.send_message(callback_query.from_user.id, "Кажется, произошла ошибка с ID. Пожалуйста, начните процесс сначала.")
        return

    request_data = {
        'id': data['id'],
        'first_name': data['first_name'],
        'last_name': data['last_name'],
        'country': data['country'],
        'birth_date': data['birth_date'],
        'phone': data['phone'],
        'email': data['email'],
        'passport_number': data['passport_number'],
        'desired_date': data['desired_date'],
        'priority': data['priority'],
        'visa_type': data['visa_type']
    }

    add_request(
        user_id=callback_query.from_user.id,
        username=data['username'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        request_data=request_data
    )

    await state.clear()
    await bot.answer_callback_query(callback_query.id)
    await bot.send_message(callback_query.from_user.id, "Пользователь успешно добавлен!")

@dp.message(Command(commands=["get_db"]))
async def send_database(message: types.Message):
    try:
        data = fetch_all_data()  # Получение всех данных из базы
        if not data:
            await message.answer("База данных пуста.")
            return

        # Ограничиваем количество выводимых записей, чтобы не отправлять слишком большое сообщение
        max_records_to_show = 10
        visible_data = data[:max_records_to_show]

        formatted_data = "\n\n".join([ 
            (
                f"<b>ID:</b> {row[0]}\n"
                f"<b>Имя пользователя:</b> @{row[1]}\n"
                f"<b>Имя:</b> {row[2]} {row[3]}\n"
                f"<b>Страна:</b> {row[4]}\n"
                f"<b>Дата рождения:</b> {row[5]}\n"
                f"<b>Телефон:</b> {row[6]}\n"
                f"<b>Email:</b> {row[7]}\n"
                f"<b>Паспорт:</b> {row[8]}\n"
                f"<b>Желаемая дата:</b> {row[9]}\n"
                f"<b>Приоритет:</b> {row[10]}\n"
                f"<b>Тип визы:</b> {row[11]}\n"  # Добавляем информацию о типе визы
                f"<b>Зарегистрирован:</b> {'Да' if row[12] else 'Нет'}"  # Обратите внимание, что это 12-й элемент, так как нумерация начинается с 0
            )
            for row in visible_data
        ])

        response = f"<b>Данные пользователей:</b>\n\n{formatted_data}"
        if len(data) > max_records_to_show:
            response += f"\n\n... и ещё {len(data) - max_records_to_show} записей."

        await message.answer(response, parse_mode=ParseMode.HTML)
    except Exception as e:
        await message.answer(f"Ошибка при извлечении данных: {str(e)}")
        
@dp.message(Command(commands=["delete_user"]))
async def delete_user_command(message: types.Message):
    try:
        args = message.text.split()
        if len(args) < 2:
            await message.answer("Используйте: /delete_user @username")
            return

        username = args[1].strip().lstrip('@')
        delete_user_by_username(username)
        await message.answer(f"Пользователь @{username} удалён.")
    except Exception as e:
        await message.answer(f"Ошибка: {e}")

@dp.message(Command(commands=["start"]))
async def start_command(message: types.Message):
    help_message = (
        "<b>Доброго времени суток</b>\n\n"
        "Вот список доступных команд и их описание:\n\n"
        "<b>/start</b> - Показать это сообщение помощи.\n"
        "<b>/add_user</b> - Добавить запрос в базу данных.\n"
        "  Формат: Имя, Фамилия, Код страны, Дата рождения, Телефон, Email, Паспорт, Желаемая дата, Приоритет (опционально).\n"
        "  Пример: Иван, Иванов, US, 01.01.1990, +79991234567, name@example.com, 1234567890, 01.02.2025, 1\n\n"
        "<b>/get_db</b> - Получить данные из базы.\n"
        "<b>/delete_user</b> - Удалить пользователя по @username.\n"
        "  Формат: /delete_user @username\n"
    )
    await message.answer(help_message, parse_mode=ParseMode.HTML)

async def main():
    init_db()
    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())