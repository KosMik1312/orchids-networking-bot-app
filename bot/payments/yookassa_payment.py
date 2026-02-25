"""
Класс для работы с API Ю-Кассы.
Использует официальный Python SDK Ю-Кассы (yookassa).
"""

import uuid
from typing import Optional, Dict, Any
from yookassa import Payment, Configuration

from .payment_config import YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY, YOOKASSA_TEST_MODE


class YooKassaPayment:
    """Класс для взаимодействия с API Ю-Кассы."""
    
    def __init__(self):
        """Инициализирует клиент Ю-Кассы с Shop ID и Secret Key."""
        # Инициализируем SDK через Configuration
        Configuration.configure(YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY)
        self.shop_id = YOOKASSA_SHOP_ID
        self.secret_key = YOOKASSA_SECRET_KEY
        self.test_mode = YOOKASSA_TEST_MODE
        print(f"[PAYMENT] YooKassaPayment initialized (Shop ID: {self.shop_id[:4]}***, Key: {self.secret_key[:4]}***)")
    
    def create_payment(
        self, 
        amount: float, 
        return_url: str,
        description: str = "Бронирование ужина на Orchids",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Создаёт платёж через Ю-Кассу.
        
        Args:
            amount: Сумма платежа в рублях (float)
            return_url: URL для возврата после оплаты
            description: Описание платежа (макс 128 символов)
            metadata: Дополнительные данные платежа
            
        Returns:
            Dict с информацией о платеже (id, status, confirmation_url)
        """
        try:
            # Принудительно приводим к float, если пришла строка
            amount = float(amount)
            
            # Генерируем уникальный ключ идемпотентности
            idempotency_key = str(uuid.uuid4())
            
            # Подготавливаем параметры платежа
            price_str = f"{amount:.2f}"
            payment_params = {
                "amount": {
                    "value": price_str,
                    "currency": "RUB"
                },
                "confirmation": {
                    "type": "redirect",
                    "return_url": return_url
                },
                "capture": True,  # Сразу захватываем деньги
                "description": description[:128],  # Обрезаем до 128 символов
                "test": self.test_mode,  # Режим тестирования
                "receipt": {
                    "customer": {
                        "email": "no-reply@leracinema.ru"  # Фиктивный email, так как мы его не собираем
                    },
                    "items": [
                        {
                            "description": description[:128],
                            "quantity": "1.00",
                            "amount": {
                                "value": price_str,
                                "currency": "RUB"
                            },
                            "vat_code": 1, # 1 = Без НДС
                            "payment_mode": "full_payment",
                            "payment_subject": "service"
                        }
                    ]
                }
            }
            
            # Добавляем metadata если есть
            if metadata:
                payment_params["metadata"] = metadata
            
            # Создаём платёж
            payment = Payment.create(
                payment_params,
                idempotency_key=idempotency_key
            )
            
            # Логируем успешное создание
            print(f"[PAYMENT] Payment created successfully:")
            print(f"  ID: {payment.id}")
            print(f"  Amount: {amount} RUB")
            print(f"  Status: {payment.status}")
            print(f"  Confirmation URL: {payment.confirmation.confirmation_url if hasattr(payment, 'confirmation') else 'N/A'}")
            
            return {
                "success": True,
                "payment_id": payment.id,
                "status": payment.status,
                "amount": amount,
                "confirmation_url": payment.confirmation.confirmation_url if hasattr(payment, 'confirmation') else None,
                "test": self.test_mode
            }
            
        except Exception as e:
            # Пытаемся достать оригинальное тело ответа от Ю-Кассы для диагностики
            error_details = str(e)
            if hasattr(e, 'response') and hasattr(e.response, 'text'):
                error_details = f"{str(e)} - Ответ API Ю-Кассы: {e.response.text}"
            
            print(f"[PAYMENT ERROR] Failed to create payment: {error_details}")
            return {
                "success": False,
                "error": error_details
            }
    
    def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Получает информацию о платеже по ID.
        
        Args:
            payment_id: ID платежа в системе Ю-Кассы
            
        Returns:
            Dict с информацией о платеже
        """
        try:
            payment = Payment.find_one(payment_id)
            
            print(f"[PAYMENT] Retrieved payment info:")
            print(f"  ID: {payment.id}")
            print(f"  Status: {payment.status}")
            print(f"  Paid: {payment.paid}")
            print(f"  Amount: {payment.amount.value} {payment.amount.currency}")
            
            return {
                "success": True,
                "payment_id": payment.id,
                "status": payment.status,
                "paid": payment.paid,
                "amount": float(payment.amount.value),
                "created_at": payment.created_at.isoformat() if hasattr(payment.created_at, 'isoformat') else str(payment.created_at)
            }
            
        except Exception as e:
            # Пытаемся достать оригинальное тело ответа от Ю-Кассы для диагностики
            error_details = str(e)
            if hasattr(e, 'response') and hasattr(e.response, 'text'):
                error_details = f"{str(e)} - Ответ API Ю-Кассы: {e.response.text}"

            print(f"[PAYMENT ERROR] Failed to get payment {payment_id}: {error_details}")
            return {
                "success": False,
                "error": error_details
            }
    
    def cancel_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Отменяет платёж.
        
        Args:
            payment_id: ID платежа в системе Ю-Кассы
            
        Returns:
            Dict с результатом отмены
        """
        try:
            payment = Payment.find_one(payment_id)
            payment.cancel()
            
            print(f"[PAYMENT] Payment cancelled: {payment_id}")
            
            return {
                "success": True,
                "payment_id": payment.id,
                "status": payment.status
            }
            
        except Exception as e:
            print(f"[PAYMENT ERROR] Failed to cancel payment: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
