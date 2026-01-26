"""
Высокоуровневый сервис для работы с платежами.
Интегрирует платежный модуль с БД и API приложения.
"""

from typing import Optional, Dict, Any
from .yookassa_payment import YooKassaPayment
from .payment_config import DEFAULT_RETURN_URL


class PaymentService:
    """Сервис для управления платежами."""
    
    def __init__(self):
        """Инициализирует сервис платежей."""
        self.yookassa = YooKassaPayment()
        print("[PAYMENT SERVICE] PaymentService initialized")
    
    def create_payment(
        self,
        user_id: int,
        amount: float,
        booking_id: Optional[int] = None,
        return_url: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Создаёт платёж для пользователя.
        
        Args:
            user_id: ID пользователя
            amount: Сумма платежа в рублях
            booking_id: ID бронирования (опционально)
            return_url: URL возврата после платежа (опционально)
            description: Описание платежа (опционально)
            
        Returns:
            Dict с информацией о платеже
        """
        print(f"\n[PAYMENT SERVICE] Creating payment for user {user_id}:")
        print(f"  Amount: {amount} RUB")
        print(f"  Booking ID: {booking_id}")
        
        # Используем дефолтный URL если не указан
        if not return_url:
            return_url = DEFAULT_RETURN_URL
        
        # Подготавливаем описание
        if not description:
            description = f"Бронирование ужина для пользователя {user_id}"
        
        # Подготавливаем metadata
        metadata = {
            "user_id": user_id,
            "booking_id": booking_id if booking_id else None
        }
        
        # Создаём платёж через Ю-Кассу
        payment_result = self.yookassa.create_payment(
            amount=amount,
            return_url=return_url,
            description=description,
            metadata=metadata
        )
        
        if payment_result.get("success"):
            print(f"[PAYMENT SERVICE] Payment created successfully: {payment_result['payment_id']}")
        else:
            print(f"[PAYMENT SERVICE] Payment creation failed: {payment_result.get('error')}")
        
        return payment_result
    
    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Получает текущий статус платежа.
        
        Args:
            payment_id: ID платежа
            
        Returns:
            Dict с информацией о платеже
        """
        print(f"\n[PAYMENT SERVICE] Getting payment status: {payment_id}")
        result = self.yookassa.get_payment(payment_id)
        return result
    
    def cancel_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Отменяет платеж.
        
        Args:
            payment_id: ID платежа для отмены
            
        Returns:
            Dict с информацией об отменённом платеже
        """
        print(f"[PAYMENT SERVICE] Cancelling payment: {payment_id}")
        result = self.yookassa.cancel_payment(payment_id)
        return result
    
    def handle_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Обрабатывает webhook от Ю-Кассы.
        Вызывается при изменении статуса платежа.
        
        Args:
            webhook_data: Данные webhook'а от Ю-Кассы
            
        Returns:
            Dict с результатом обработки
        """
        try:
            event_type = webhook_data.get("event")
            # Поддерживаем оба формата: "object" и "data"
            payment_data = webhook_data.get("object") or webhook_data.get("data", {})
            payment_id = payment_data.get("id")
            payment_status = payment_data.get("status")
            
            print(f"\n[PAYMENT WEBHOOK] Received webhook:")
            print(f"  Event: {event_type}")
            print(f"  Payment ID: {payment_id}")
            print(f"  Status: {payment_status}")
            
            if event_type == "payment.succeeded":
                print(f"[PAYMENT WEBHOOK] Payment succeeded! Booking can be confirmed.")
                return {
                    "success": True,
                    "action": "confirm_booking",
                    "payment_id": payment_id,
                    "status": "succeeded"
                }
            
            elif event_type == "payment.canceled":
                print(f"[PAYMENT WEBHOOK] Payment canceled! Booking should be cancelled.")
                return {
                    "success": True,
                    "action": "cancel_booking",
                    "payment_id": payment_id,
                    "status": "canceled"
                }
            
            else:
                print(f"[PAYMENT WEBHOOK] Unknown event type: {event_type}")
                return {
                    "success": True,
                    "action": "log_event",
                    "payment_id": payment_id,
                    "status": payment_status
                }
        
        except Exception as e:
            print(f"[PAYMENT WEBHOOK ERROR] Failed to handle webhook: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
