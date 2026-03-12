"""
Сервис уведомлений пользователей через Telegram.
Отправляет уведомления об успешной оплате, возврате средств и других событиях.
"""

from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from typing import Optional
from datetime import datetime

from config import BOT_TOKEN
from logger import get_api_logger

logger = get_api_logger()


class NotificationService:
    """Сервис для отправки уведомлений пользователям."""
    
    def __init__(self):
        """Инициализирует бота для отправки уведомлений."""
        self.bot = Bot(token=BOT_TOKEN)
        logger.info("NotificationService initialized")
    
    async def notify_payment_success(
        self,
        user_id: int,
        booking_id: int,
        slot_date: str,
        slot_time: str,
        slot_city: str,
        slot_restaurant: str,
        amount: str
    ):
        """
        Отправляет уведомление об успешной оплате.
        
        Args:
            user_id: ID пользователя в Telegram
            booking_id: ID бронирования
            slot_date: Дата мероприятия
            slot_time: Время мероприятия
            slot_city: Город
            slot_restaurant: Ресторан
            amount: Сумма платежа
        """
        try:
            message = (
                f"✅ <b>Оплата прошла успешно!</b>\n\n"
                f"📅 <b>Дата:</b> {slot_date}\n"
                f"🕐 <b>Время:</b> {slot_time}\n"
                f"🏙 <b>Город:</b> {slot_city}\n"
                f"🍽 <b>Ресторан:</b> {slot_restaurant}\n\n"
                f"💰 <b>Оплачено:</b> {amount} ₽\n"
                f"🎫 <b>Номер брони:</b> #{booking_id}\n\n"
                f"До встречи! 🎉"
            )
            
            # Кнопка для открытия MiniApp
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="📱 Открыть приложение",
                    url="https://t.me/antre_club_bot/app"
                )]
            ])
            
            await self.bot.send_message(
                chat_id=user_id,
                text=message,
                parse_mode="HTML",
                reply_markup=keyboard
            )
            
            logger.info(f"✅ Payment success notification sent to user {user_id}, booking {booking_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send payment success notification to user {user_id}: {e}")
            return False
    
    async def notify_payment_failed(
        self,
        user_id: int,
        slot_restaurant: str,
        amount: str,
        reason: str = "Платёж не прошёл"
    ):
        """
        Отправляет уведомление о неудачной оплате.
        
        Args:
            user_id: ID пользователя в Telegram
            slot_restaurant: Ресторан
            amount: Сумма платежа
            reason: Причина отказа
        """
        try:
            message = (
                f"❌ <b>Платёж не прошёл</b>\n\n"
                f"🍽 <b>Мероприятие:</b> {slot_restaurant}\n"
                f"💰 <b>Сумма:</b> {amount} ₽\n\n"
                f"<i>Причина: {reason}</i>\n\n"
                f"Пожалуйста, попробуйте снова или свяжитесь с поддержкой."
            )
            
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="🔄 Попробовать снова",
                    url="https://t.me/antre_club_bot/app"
                )],
                [InlineKeyboardButton(
                    text="💬 Поддержка",
                    url="https://t.me/allora_support"
                )]
            ])
            
            await self.bot.send_message(
                chat_id=user_id,
                text=message,
                parse_mode="HTML",
                reply_markup=keyboard
            )
            
            logger.info(f"⚠️ Payment failed notification sent to user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send payment failed notification to user {user_id}: {e}")
            return False
    
    async def notify_refund(
        self,
        user_id: int,
        amount: str,
        reason: str,
        slot_restaurant: Optional[str] = None
    ):
        """
        Отправляет уведомление о возврате средств.
        
        Args:
            user_id: ID пользователя в Telegram
            amount: Сумма возврата
            reason: Причина возврата
            slot_restaurant: Ресторан (опционально)
        """
        try:
            message = (
                f"💸 <b>Возврат средств</b>\n\n"
            )
            
            if slot_restaurant:
                message += f"🍽 <b>Мероприятие:</b> {slot_restaurant}\n"
            
            message += (
                f"💰 <b>Сумма возврата:</b> {amount} ₽\n\n"
                f"<i>Причина: {reason}</i>\n\n"
                f"Деньги вернутся на карту в течение 3-5 рабочих дней.\n"
                f"Приносим извинения за неудобства. 🙏"
            )
            
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="💬 Связаться с поддержкой",
                    url="https://t.me/allora_support"
                )]
            ])
            
            await self.bot.send_message(
                chat_id=user_id,
                text=message,
                parse_mode="HTML",
                reply_markup=keyboard
            )
            
            logger.info(f"💸 Refund notification sent to user {user_id}, amount {amount}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send refund notification to user {user_id}: {e}")
            return False
    
    async def notify_booking_reminder(
        self,
        user_id: int,
        slot_date: str,
        slot_time: str,
        slot_city: str,
        slot_restaurant: str,
        hours_before: int = 24
    ):
        """
        Отправляет напоминание о предстоящем мероприятии.
        
        Args:
            user_id: ID пользователя в Telegram
            slot_date: Дата мероприятия
            slot_time: Время мероприятия
            slot_city: Город
            slot_restaurant: Ресторан
            hours_before: За сколько часов напоминание
        """
        try:
            message = (
                f"⏰ <b>Напоминание о мероприятии</b>\n\n"
                f"Через {hours_before} часов состоится ваш ужин!\n\n"
                f"📅 <b>Дата:</b> {slot_date}\n"
                f"🕐 <b>Время:</b> {slot_time}\n"
                f"🏙 <b>Город:</b> {slot_city}\n"
                f"🍽 <b>Ресторан:</b> {slot_restaurant}\n\n"
                f"Ждём вас! 🎉"
            )
            
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="📱 Открыть приложение",
                    url="https://t.me/antre_club_bot/app"
                )]
            ])
            
            await self.bot.send_message(
                chat_id=user_id,
                text=message,
                parse_mode="HTML",
                reply_markup=keyboard
            )
            
            logger.info(f"⏰ Booking reminder sent to user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send booking reminder to user {user_id}: {e}")
            return False
    
    async def close(self):
        """Закрывает сессию бота."""
        await self.bot.session.close()


# Глобальный экземпляр сервиса
_notification_service: Optional[NotificationService] = None


def get_notification_service() -> NotificationService:
    """Возвращает глобальный экземпляр сервиса уведомлений."""
    global _notification_service
    if _notification_service is None:
        _notification_service = NotificationService()
    return _notification_service
