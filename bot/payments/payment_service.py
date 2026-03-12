"""
Высокоуровневый сервис для работы с платежами.
Обновлённая версия с:
- Асинхронными методами
- Обёрткой синхронного SDK через asyncio.to_thread
"""

import asyncio
from typing import Optional, Dict, Any

from .yookassa_payment import YooKassaPayment
from .payment_config import YOOKASSA_RETURN_URL

# Импорт логгера
import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from logger import get_payment_logger

logger = get_payment_logger()


class PaymentService:
    """Сервис для управления платежами."""
    
    def __init__(self):
        """Инициализирует сервис платежей."""
        self.yookassa = YooKassaPayment()
        logger.info("PaymentService initialized")
    
    async def create_payment(
        self,
        user_id: int,
        amount: float,
        slot_id: int,
        return_url: Optional[str] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Создаёт платёж для пользователя (асинхронно).
        
        Args:
            user_id: ID пользователя
            amount: Сумма платежа в рублях
            slot_id: ID слота для бронирования
            return_url: URL возврата после платежа (опционально, может содержать {payment_id})
            description: Описание платежа (опционально)
        """
        logger.info(f"Creating payment: user={user_id}, amount={amount}, slot_id={slot_id}")
        
        # Используем конфиг returnUrl если не указан
        if not return_url:
            return_url = YOOKASSA_RETURN_URL
        
        # Подготавливаем описание
        if not description:
            description = f"Бронирование ужина (слот {slot_id}) для пользователя {user_id}"
        
        # Подготавливаем metadata
        metadata = {
            "user_id": user_id,
            "slot_id": slot_id
        }
        
        # Создаём платёж через Ю-Кассу (в отдельном потоке, так как SDK синхронный)
        payment_result = await asyncio.to_thread(
            self.yookassa.create_payment,
            amount=amount,
            return_url=return_url,
            description=description,
            metadata=metadata
        )
        
        if payment_result.get("success"):
            payment_id = payment_result['payment_id']
            logger.info(f"Payment created: {payment_id}")
        else:
            logger.error(f"Payment creation failed: {payment_result.get('error')}")
        
        return payment_result
    
    async def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """
        Получает текущий статус платежа (асинхронно).
        
        Args:
            payment_id: ID платежа
            
        Returns:
            Dict с информацией о платеже
        """
        logger.debug(f"Getting payment status: {payment_id}")
        
        # Синхронный вызов SDK в отдельном потоке
        result = await asyncio.to_thread(self.yookassa.get_payment, payment_id)
        return result
    
    async def cancel_payment(self, payment_id: str) -> Dict[str, Any]:
        """
        Отменяет платеж (асинхронно).
        
        Args:
            payment_id: ID платежа для отмены
            
        Returns:
            Dict с информацией об отменённом платеже
        """
        logger.info(f"Cancelling payment: {payment_id}")
        
        # Синхронный вызов SDK в отдельном потоке
        result = await asyncio.to_thread(self.yookassa.cancel_payment, payment_id)
        return result
    
    async def handle_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Обрабатывает webhook от Ю-Кассы (асинхронно).
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
            
            logger.info(f"Webhook received: event={event_type}, payment_id={payment_id}, status={payment_status}")
            
            if event_type == "payment.succeeded":
                logger.info(f"Payment succeeded: {payment_id}")
                return {
                    "success": True,
                    "action": "confirm_booking",
                    "payment_id": payment_id,
                    "status": "succeeded"
                }
            
            elif event_type == "payment.canceled":
                logger.info(f"Payment canceled: {payment_id}")
                return {
                    "success": True,
                    "action": "cancel_booking",
                    "payment_id": payment_id,
                    "status": "canceled"
                }
            
            elif event_type == "payment.waiting_for_capture":
                logger.info(f"Payment waiting for capture: {payment_id}")
                return {
                    "success": True,
                    "action": "wait",
                    "payment_id": payment_id,
                    "status": "waiting_for_capture"
                }
            
            else:
                logger.warning(f"Unknown webhook event: {event_type}")
                return {
                    "success": True,
                    "action": "log_event",
                    "payment_id": payment_id,
                    "status": payment_status
                }
        
        except Exception as e:
            logger.error(f"Failed to handle webhook: {e}")
            return {
                "success": False,
                "error": str(e)
            }
