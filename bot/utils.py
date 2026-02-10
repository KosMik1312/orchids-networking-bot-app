from datetime import date, datetime
from typing import Optional

DATE_FORMAT = "%d.%m.%Y"

def parse_date(date_str: str) -> date:
    """
    Парсит строку даты в формате DD.MM.YYYY.
    Поддерживает fallback на ISO формат.
    """
    try:
        return datetime.strptime(date_str, DATE_FORMAT).date()
    except ValueError:
        try:
            return datetime.fromisoformat(date_str).date()
        except ValueError:
            raise ValueError(f"Invalid date format: {date_str}. Expected {DATE_FORMAT}")

def format_date(date_obj: Optional[date]) -> Optional[str]:
    """
    Форматирует объект даты в строку DD.MM.YYYY.
    Возвращает None, если date_obj is None.
    """
    if date_obj is None:
        return None
    return date_obj.strftime(DATE_FORMAT)
