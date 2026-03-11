"""
Административные API эндпоинты для MiniApp.
Все эндпоинты защищены проверкой is_admin.
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_session
from db.repository import AdminRepo, GroupRepo, SlotRepo, BookingRepo
from config import ADMIN_IDS, SECRET_KEY, BOT_TOKEN, AUTH_DISABLED
from auth_token import validate_auth_header
from logger import get_api_logger
from utils import format_date

logger = get_api_logger()

admin_router_api = APIRouter(prefix="/api/admin", tags=["admin"])
security = HTTPBearer(auto_error=False)


# ===== Pydantic модели =====

class InitDataRequest(BaseModel):
    initData: str


class SlotCreateRequest(InitDataRequest):
    date: str
    time: str
    city: str
    restaurant: str
    max_people: int
    price: int = 10


class SlotUpdateRequest(InitDataRequest):
    date: Optional[str] = None
    time: Optional[str] = None
    city: Optional[str] = None
    restaurant: Optional[str] = None
    max_people: Optional[int] = None
    price: Optional[int] = None
    is_active: Optional[bool] = None


class GroupCreateRequest(InitDataRequest):
    name: str
    slot_id: Optional[int] = None


class GroupListRequest(InitDataRequest):
    slot_id: Optional[int] = None


class GroupMembersRequest(InitDataRequest):
    user_ids: List[int]


class BroadcastRequest(InitDataRequest):
    text: str
    group_ids: Optional[List[int]] = None
    slot_id: Optional[int] = None
    all_users: bool = False


async def require_admin(
    init_data: str,
    session: AsyncSession = Depends(get_session),
) -> int:
    """Проверяет initData и что user_id в ADMIN_IDS или is_admin=True в БД. Возвращает user_id."""
    if not init_data:
        logger.error("❌ No initData provided")
        raise HTTPException(status_code=401, detail="Missing initData")

    result = validate_auth_header(init_data)
    if not result:
        logger.error("❌ Authentication failed - invalid initData and invalid JWT token")
        raise HTTPException(status_code=401, detail="Invalid or expired authentication")

    user_id = result["user_id"]
    logger.info(f"🔍 Checking admin access for user_id={user_id}")
    logger.info(f"📋 ADMIN_IDS from config: {ADMIN_IDS}")

    # If auth is disabled (development), allow access
    if AUTH_DISABLED:
        logger.warning(f"⚠️ AUTH_DISABLED=True, allowing access for user_id={user_id}")
        return user_id or 0

    # 1. Проверка по конфигу (супер-админы)
    if user_id in ADMIN_IDS:
        logger.info(f"✅ User {user_id} is in ADMIN_IDS")
        return user_id

    # 2. Проверка по БД
    # Импортируем внутри функции чтобы избежать циклических импортов если они есть
    from db.repository import UserRepo
    user_repo = UserRepo(session)
    user = await user_repo.get_user(user_id)

    if user:
        logger.info(f"👤 User {user_id} found in DB. is_admin={user.is_admin}")
        if user.is_admin:
            logger.info(f"✅ User {user_id} has is_admin=True in DB")
            return user_id
    else:
        logger.warning(f"⚠️ User {user_id} not found in DB")

    logger.error(f"❌ User {user_id} is not an admin (not in ADMIN_IDS and not in DB)")
    raise HTTPException(status_code=403, detail="Not an admin")


# ===== Эндпоинты =====

@admin_router_api.post("/me")
async def admin_me(request: InitDataRequest, session: AsyncSession = Depends(get_session)):
    """Проверка: текущий пользователь – админ."""
    admin_id = await require_admin(request.initData, session)
    return {"user_id": admin_id, "is_admin": True}


@admin_router_api.post("/stats")
async def admin_stats(request: InitDataRequest, session: AsyncSession = Depends(get_session)):
    """Общая статистика."""
    admin_id = await require_admin(request.initData, session)
    repo = AdminRepo(session)
    stats = await repo.get_stats()
    return stats


@admin_router_api.post("/users")
async def admin_users(
    request: InitDataRequest,
    session: AsyncSession = Depends(get_session),
    limit: int = 50,
    offset: int = 0,
):
    """Список пользователей с пагинацией."""
    admin_id = await require_admin(request.initData, session)
    repo = AdminRepo(session)
    users, total = await repo.get_all_users(limit=limit, offset=offset)
    return {
        "total": total,
        "users": [
            {
                "user_id": u.user_id,
                "name": u.name,
                "age": u.age,
                "gender": u.gender,
                "city": u.city,
                "telegram": u.telegram,
                "instagram": u.instagram,
                "is_profile_completed": u.is_profile_completed,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]
    }


@admin_router_api.post("/users/{user_id}/profile")
async def admin_user_profile(
    user_id: int,
    request: InitDataRequest,
    session: AsyncSession = Depends(get_session),
):
    """Детальный профиль пользователя для администратора."""
    admin_id = await require_admin(request.initData, session)
    
    from db.repository import UserRepo
    user_repo = UserRepo(session)
    user = await user_repo.get_user_profile(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Преобразуем строку JSON (interests, strengths и т.д.) в списки для фронтенда, если необходимо.
    import json
    def parse_json_field(field_value):
        if not field_value:
            return None
        try:
            return json.loads(field_value)
        except:
            return field_value

    return {
        "user_id": user.user_id,
        "name": user.name,
        "age": user.age,
        "gender": user.gender,
        "city": user.city,
        "telegram": user.telegram,
        "instagram": user.instagram,
        "photo": user.photo,
        "about_me": user.about_me,
        "occupation": user.occupation,
        "interests": parse_json_field(user.interests),
        "goal": parse_json_field(user.goal),
        "comfort_level": user.comfort_level,
        "social_frequency": user.social_frequency,
        "communication_format": parse_json_field(user.communication_format),
        "evening_scenario": user.evening_scenario,
        "relationship_status": user.relationship_status,
        "children": user.children,
        "zodiac": user.zodiac,
        "strengths": parse_json_field(user.strengths),
        "weaknesses": user.weaknesses,
        "values": parse_json_field(user.values),
        "love_language": parse_json_field(user.love_language),
        "goals": user.goals,
        "dreams": user.dreams,
        "meeting_metro": parse_json_field(user.meeting_metro),
        "meeting_days": parse_json_field(user.meeting_days),
        "meeting_time_from": user.meeting_time_from,
        "meeting_time_to": user.meeting_time_to,
        "is_profile_completed": user.is_profile_completed,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }



# ===== Слоты (мероприятия) =====

@admin_router_api.post("/slots")
async def admin_slots(request: InitDataRequest, session: AsyncSession = Depends(get_session)):
    """Все слоты (включая неактивные)."""
    admin_id = await require_admin(request.initData, session)
    repo = AdminRepo(session)
    slots = await repo.get_all_slots_admin()
    return {
        "slots": [
            {
                "id": s.id,
                "date": format_date(s.date),
                "time": s.time,
                "city": s.city,
                "restaurant": s.restaurant,
                "max_people": s.max_people,
                "price": s.price,
                "current_bookings": s.current_bookings,
                "is_active": s.is_active,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in slots
        ]
    }


@admin_router_api.post("/slots/create")
async def admin_create_slot(
    request: SlotCreateRequest,
    session: AsyncSession = Depends(get_session),
):
    """Создание мероприятия."""
    admin_id = await require_admin(request.initData, session)
    repo = SlotRepo(session)
    slot = await repo.create_slot(
        date=request.date,
        time=request.time,
        city=request.city,
        restaurant=request.restaurant,
        max_people=request.max_people,
        price=request.price,
    )
    logger.info(f"Admin {admin_id} created slot {slot.id}")
    return {
        "id": slot.id,
        "date": format_date(slot.date),
        "time": slot.time,
        "city": slot.city,
        "restaurant": slot.restaurant,
        "max_people": slot.max_people,
        "price": slot.price,
    }


@admin_router_api.patch("/slots/{slot_id}")
async def admin_update_slot(
    slot_id: int,
    request: SlotUpdateRequest,
    session: AsyncSession = Depends(get_session),
):
    """Редактирование слота."""
    admin_id = await require_admin(request.initData, session)
    repo = AdminRepo(session)
    updates = request.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    slot = await repo.update_slot(slot_id, **updates)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    logger.info(f"Admin {admin_id} updated slot {slot_id}: {list(updates.keys())}")
    return {
        "id": slot.id,
        "date": format_date(slot.date),
        "time": slot.time,
        "city": slot.city,
        "restaurant": slot.restaurant,
        "max_people": slot.max_people,
        "current_bookings": slot.current_bookings,
        "is_active": slot.is_active,
    }


@admin_router_api.post("/slots/{slot_id}")
async def admin_slot_detail(
    slot_id: int,
    request: InitDataRequest,
    session: AsyncSession = Depends(get_session),
):
    """Детали слота."""
    admin_id = await require_admin(request.initData, session)
    repo = AdminRepo(session)
    slot = await repo.get_slot_by_id(slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    return {
        "id": slot.id,
        "date": slot.date.strftime("%d.%m.%Y"),
        "time": slot.time,
        "city": slot.city,
        "restaurant": slot.restaurant,
        "max_people": slot.max_people,
        "current_bookings": slot.current_bookings,
        "is_active": slot.is_active,
        "created_at": slot.created_at.isoformat() if slot.created_at else None,
    }


@admin_router_api.post("/slots/{slot_id}/participants")
async def admin_slot_participants(
    slot_id: int,
    request: InitDataRequest,
    session: AsyncSession = Depends(get_session),
):
    """Участники мероприятия с информацией об оплате."""
    admin_id = await require_admin(request.initData, session)
    repo = AdminRepo(session)
    slot = await repo.get_slot_by_id(slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    participants = await repo.get_slot_participants(slot_id)
    return {"slot_id": slot_id, "participants": participants}


# ===== Группы =====

@admin_router_api.post("/groups")
async def admin_groups(
    request: GroupListRequest,
    session: AsyncSession = Depends(get_session),
):
    """Список групп."""
    admin_id = await require_admin(request.initData, session)
    repo = GroupRepo(session)
    groups = await repo.get_all_groups(request.slot_id)
    return {"groups": groups}


@admin_router_api.post("/groups/create")
async def admin_create_group(
    request: GroupCreateRequest,
    session: AsyncSession = Depends(get_session),
):
    """Создание группы."""
    admin_id = await require_admin(request.initData, session)
    repo = GroupRepo(session)
    try:
        group = await repo.create_group(request.name, request.slot_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Group with this name already exists")
    logger.info(f"Admin {admin_id} created group '{group.name}' (id={group.id})")
    return {"id": group.id, "name": group.name}


@admin_router_api.post("/groups/{group_id}/delete")
async def admin_delete_group(
    group_id: int,
    request: InitDataRequest,
    session: AsyncSession = Depends(get_session),
):
    """Удаление группы."""
    admin_id = await require_admin(request.initData, session)
    repo = GroupRepo(session)
    ok = await repo.delete_group(group_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Group not found")
    logger.info(f"Admin {admin_id} deleted group {group_id}")
    return {"success": True}


@admin_router_api.post("/groups/{group_id}/members")
async def admin_group_members(
    group_id: int,
    request: InitDataRequest,
    session: AsyncSession = Depends(get_session),
):
    """Участники группы."""
    admin_id = await require_admin(request.initData, session)
    repo = GroupRepo(session)
    members = await repo.get_group_members(group_id)
    return {
        "group_id": group_id,
        "members": [
            {
                "user_id": u.user_id,
                "name": u.name,
                "telegram": u.telegram,
                "city": u.city,
            }
            for u in members
        ],
    }


@admin_router_api.post("/groups/{group_id}/members/add")
async def admin_add_group_members(
    group_id: int,
    request: GroupMembersRequest,
    session: AsyncSession = Depends(get_session),
):
    """Добавление пользователей в группу."""
    admin_id = await require_admin(request.initData, session)
    repo = GroupRepo(session)
    report = await repo.add_members(group_id, request.user_ids)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    logger.info(f"Admin {admin_id} added members to group {group_id}: {report}")
    return report


@admin_router_api.post("/groups/{group_id}/members/{user_id}/remove")
async def admin_remove_group_member(
    group_id: int,
    user_id: int,
    request: InitDataRequest,
    session: AsyncSession = Depends(get_session),
):
    """Удаление пользователя из группы."""
    admin_id = await require_admin(request.initData, session)
    repo = GroupRepo(session)
    ok = await repo.remove_member(group_id, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Member not found in group")
    return {"success": True}


# ===== Рассылка =====

async def send_broadcast_task(text: str, target_user_ids: set[int], admin_id: int):
    """Фоновая задача рассылки сообщений."""
    import asyncio
    from aiogram import Bot
    
    bot = Bot(token=BOT_TOKEN)
    sent = 0
    failed = 0
    errors = []

    try:
        for uid in target_user_ids:
            try:
                await bot.send_message(chat_id=uid, text=text)
                sent += 1
                await asyncio.sleep(0.05)
            except Exception as e:
                failed += 1
                errors.append(f"user {uid}: {str(e)[:80]}")
    finally:
        await bot.session.close()

    logger.info(f"Admin {admin_id} broadcast completed: sent={sent}, failed={failed}, total={len(target_user_ids)}")
    if errors:
        logger.warning(f"Broadcast errors (first 10): {errors[:10]}")


@admin_router_api.post("/broadcast")
async def admin_broadcast(
    request: BroadcastRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    """Рассылка текстового сообщения по группам, участникам слота или всем пользователям.
    
    Рассылка выполняется в фоновом режиме, API возвращает ответ сразу.
    """
    admin_id = await require_admin(request.initData, session)

    if not request.group_ids and not request.slot_id and not request.all_users:
        raise HTTPException(status_code=400, detail="Specify group_ids, slot_id or all_users=true")

    target_user_ids: set[int] = set()
    admin_repo = AdminRepo(session)

    if request.all_users:
        all_user_ids = await admin_repo.get_all_user_ids()
        target_user_ids.update(all_user_ids)

    if request.group_ids:
        group_repo = GroupRepo(session)
        ids = await group_repo.get_group_member_ids(request.group_ids)
        target_user_ids.update(ids)

    if request.slot_id:
        participants = await admin_repo.get_slot_participants(request.slot_id)
        for p in participants:
            target_user_ids.add(p["user_id"])

    if not target_user_ids:
        return {"status": "no_recipients", "target_count": 0}

    # Запускаем рассылку в фоне
    background_tasks.add_task(send_broadcast_task, request.text, target_user_ids, admin_id)
    
    logger.info(f"Admin {admin_id} started broadcast to {len(target_user_ids)} users (background task)")
    
    return {
        "status": "started",
        "target_count": len(target_user_ids),
        "message": f"Рассылка запущена для {len(target_user_ids)} пользователей"
    }
