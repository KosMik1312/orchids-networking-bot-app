"""
Централизованный модуль логирования для Orchids Networking Bot.
Настраивает форматирование, уровни и вывод в консоль + файл.
"""

import logging
import sys
from typing import Optional

# Цвета для терминала (ANSI escape codes)
class Colors:
    RESET = '\033[0m'
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'


class ColoredFormatter(logging.Formatter):
    """Форматтер с цветами для консоли."""
    
    LEVEL_COLORS = {
        logging.DEBUG: Colors.CYAN,
        logging.INFO: Colors.GREEN,
        logging.WARNING: Colors.YELLOW,
        logging.ERROR: Colors.RED,
        logging.CRITICAL: Colors.RED + Colors.BOLD,
    }
    
    def format(self, record: logging.LogRecord) -> str:
        # Добавляем цвет к уровню лога
        color = self.LEVEL_COLORS.get(record.levelno, Colors.RESET)
        
        # Форматируем сообщение
        formatted = super().format(record)
        
        # Добавляем цвет
        return f"{color}{formatted}{Colors.RESET}"


def setup_logger(
    name: str = "orchids",
    level: int = logging.INFO,
    log_file: Optional[str] = None
) -> logging.Logger:
    """
    Настраивает и возвращает логгер.
    
    Args:
        name: Имя логгера
        level: Уровень логирования (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Путь к файлу лога (опционально)
        
    Returns:
        Настроенный логгер
    """
    logger = logging.getLogger(name)
    
    # Избегаем дублирования handlers при повторном вызове
    if logger.handlers:
        return logger
    
    logger.setLevel(level)
    
    # Формат для логов
    log_format = "%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    
    # Консольный handler с цветами
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(ColoredFormatter(log_format, date_format))
    logger.addHandler(console_handler)
    
    # Файловый handler (опционально)
    if log_file:
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(level)
        file_handler.setFormatter(logging.Formatter(log_format, date_format))
        logger.addHandler(file_handler)
    
    return logger


# Создаём глобальные логгеры для разных модулей
def get_api_logger() -> logging.Logger:
    """Логгер для API сервера."""
    return setup_logger("orchids.api")


def get_db_logger() -> logging.Logger:
    """Логгер для базы данных."""
    return setup_logger("orchids.db")


def get_payment_logger() -> logging.Logger:
    """Логгер для модуля платежей."""
    return setup_logger("orchids.payment")


def get_bot_logger() -> logging.Logger:
    """Логгер для Telegram бота."""
    return setup_logger("orchids.bot")


# Для обратной совместимости: функция-обёртка над print
def log_info(message: str, module: str = "orchids"):
    """Совместимая функция для логирования INFO."""
    logger = setup_logger(module)
    logger.info(message)


def log_error(message: str, module: str = "orchids"):
    """Совместимая функция для логирования ERROR."""
    logger = setup_logger(module)
    logger.error(message)


def log_warning(message: str, module: str = "orchids"):
    """Совместимая функция для логирования WARNING."""
    logger = setup_logger(module)
    logger.warning(message)


def log_debug(message: str, module: str = "orchids"):
    """Совместимая функция для логирования DEBUG."""
    logger = setup_logger(module)
    logger.debug(message)
