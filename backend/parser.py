import json
import time
import os
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MADIScheduleParser:
    def __init__(self):
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")

        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)

    def parse_all_groups(self):
        """Парсит расписание для всех групп"""
        try:
            self.driver.get("https://raspisanie.madi.ru/tplan/r/?task=7")
            logger.info("Открыта страница расписания")

            # Ждем загрузки выпадающего списка
            select_element = self.wait.until(
                EC.presence_of_element_located((By.TAG_NAME, "select"))
            )
            select = Select(select_element)

            all_options = select.options
            groups = []

            # Собираем все группы
            for option in all_options:
                group_name = option.text.strip()
                if group_name and group_name != "Выберите группу":
                    groups.append(group_name)

            logger.info(f"Найдено групп: {len(groups)}")

            # Создаем структуры для числителя и знаменателя
            numerator_data = {}
            denominator_data = {}

            # Парсим каждую группу
            for i, group in enumerate(groups[:10]):  # Ограничим для теста
                try:
                    logger.info(f"Парсим группу {i + 1}/{len(groups)}: {group}")

                    select_element = self.driver.find_element(By.TAG_NAME, "select")
                    select = Select(select_element)
                    select.select_by_visible_text(group)

                    # Ждем загрузки таблицы
                    time.sleep(2)

                    # Парсим таблицу
                    schedule = self.parse_schedule_table()

                    # Разделяем на числитель и знаменатель
                    num_schedule, den_schedule = self.split_schedule(schedule)

                    numerator_data[group] = num_schedule
                    denominator_data[group] = den_schedule

                    logger.info(f"Успешно: {group} - {len(schedule)} пар")

                except Exception as e:
                    logger.error(f"Ошибка при парсинге группы {group}: {e}")
                    continue

            # Сохраняем в JSON файлы
            self.save_to_json(numerator_data, "numerator")
            self.save_to_json(denominator_data, "denominator")

            return True

        except Exception as e:
            logger.error(f"Критическая ошибка: {e}")
            return False
        finally:
            self.driver.quit()

    def parse_schedule_table(self):
        """Парсит HTML таблицу с расписанием"""
        schedule = []

        try:
            table = self.driver.find_element(By.TAG_NAME, "table")
            rows = table.find_elements(By.TAG_NAME, "tr")

            current_day = ""

            for row in rows:
                cells = row.find_elements(By.TAG_NAME, "td")

                if len(cells) >= 7:  # Учитываем все столбцы
                    # Получаем день недели (обычно в первой строке дня)
                    day_cell = cells[0].text.strip()
                    if day_cell and day_cell in ["понедельник", "вторник", "среда",
                                                 "четверг", "пятница", "суббота"]:
                        current_day = day_cell.capitalize()

                    # Пропускаем строки без времени
                    time_cell = cells[1].text.strip()
                    if not time_cell or "пара" in time_cell.lower():
                        continue

                    # Преобразуем время в 24-часовой формат
                    try:
                        time_str = self.convert_time_to_24h(time_cell)
                    except:
                        time_str = time_cell

                    # Извлекаем данные
                    subject = cells[2].text.strip() if len(cells) > 2 else ""
                    lesson_type = cells[3].text.strip() if len(cells) > 3 else ""
                    teacher = cells[4].text.strip() if len(cells) > 4 else ""
                    classroom = cells[5].text.strip() if len(cells) > 5 else ""

                    # Добавляем в расписание
                    if current_day and time_str:
                        schedule.append({
                            "day": current_day,
                            "time": time_str,
                            "subject": subject,
                            "type": lesson_type,
                            "teacher": teacher,
                            "room": classroom
                        })

        except Exception as e:
            logger.error(f"Ошибка парсинга таблицы: {e}")

        return schedule

    def convert_time_to_24h(self, time_str):
        """Конвертирует время в 24-часовой формат"""
        time_str = time_str.lower().replace(" ", "")

        # Если уже в 24-часовом формате
        if ":" in time_str and ("am" not in time_str and "pm" not in time_str):
            return time_str

        # Конвертация AM/PM (если есть)
        if "am" in time_str:
            time_str = time_str.replace("am", "")
            hours, minutes = time_str.split(":")
            return f"{int(hours):02d}:{minutes}"
        elif "pm" in time_str:
            time_str = time_str.replace("pm", "")
            hours, minutes = time_str.split(":")
            return f"{int(hours) + 12 if int(hours) < 12 else int(hours):02d}:{minutes}"

        return time_str

    def split_schedule(self, schedule):
        """Разделяет расписание на числитель и знаменатель"""
        numerator = []
        denominator = []

        for lesson in schedule:
            # Простая логика: четные занятия в числитель, нечетные в знаменатель
            # В реальном проекте нужно анализировать пометки в таблице
            if len(numerator) <= len(denominator):
                numerator.append(lesson)
            else:
                denominator.append(lesson)

        return numerator, denominator

    def save_to_json(self, data, week_type):
        """Сохраняет данные в JSON файл"""
        os.makedirs("static", exist_ok=True)

        filename = f"static/schedule_{week_type}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info(f"Сохранено в {filename}")


def main():
    parser = MADIScheduleParser()
    success = parser.parse_all_groups()

    if success:
        print("✅ Парсинг завершен успешно!")
    else:
        print("❌ Ошибка при парсинге")


if __name__ == "__main__":
    main()