"""
Админские API эндпоинты для MiniApp.
Все эндпоинты защищены проверкой is_admin.
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_session
from db.repository import AdminRepo, GroupRepo, SlotRepo, BookingRepo
from config import ADMIN_IDS, SECRET_KEY, BOT_TOKEN
from auth_token import validate_user_token
from logger import get_api_logger

logger = get_api_logger()

admin_router_api = APIRouter(prefix="/api/admin", tags=["admin"])
security = HTTPBearer(auto_error=False)


async def require_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> int:
    """Проверяет JWT и что user_id в ADMIN_IDS. Возвращает user_id."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing authorization token")

    result = validate_user_token(credentials.credentials)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = result["user_id"]
    if user_id not in ADMIN_IDS:
        raise HTTPException(status_code=403, detail="Not an admin")

    return user_id


# ===== Pydantic модели =====

class SlotCreateRequest(BaseModel):
    date: str
    time: str
    city: str
    restaurant: str
    max_people: int


class SlotUpdateRequest(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    city: Optional[str] = None
    restaurant: Optional[str] = None
    max_people: Optional[int] = None
    is_active: Optional[bool] = None


class GroupCreateRequest(BaseModel):
    name: str


class GroupMembersRequest(BaseModel):
    user_ids: List[int]


class BroadcastRequest(BaseModel):
    text: str
    group_ids: Optional[List[int]] = None
    slot_id: Optional[int] = None


# ===== Эндпоинты =====

@admin_router_api.get("/me")
async def admin_me(admin_id: int = Depends(require_admin)):
    """Проверка: текущий пользователь — админ."""
    return {"user_id": admin_id, "is_admin": True}


@admin_router_api.get("/stats")
async def admin_stats(
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Общая статистика."""
    repo = AdminRepo(session)
    stats = await repo.get_stats()
    return stats


@admin_router_api.get("/users")
async def admin_users(
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Список пользователей с пагинацией."""
    repo = AdminRepo(session)
    users, total = await repo.get_all_users(limit=limit, offset=offset)
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
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
        ],
    }


# ===== Слоты (мероприятия) =====

@admin_router_api.get("/slots")
async def admin_slots(
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Все слоты (включая неактивные)."""
    repo = AdminRepo(session)
    slots = await repo.get_all_slots_admin()
    return {
        "slots": [
            {
                "id": s.id,
                "date": s.date.strftime("%d.%m.%Y"),
                "time": s.time,
                "city": s.city,
                "restaurant": s.restaurant,
                "max_people": s.max_people,
                "current_bookings": s.current_bookings,
                "is_active": s.is_active,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in slots
        ]
    }


@admin_router_api.post("/slots")
async def admin_create_slot(
    request: SlotCreateRequest,
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Создание мероприятия."""
    repo = SlotRepo(session)
    slot = await repo.create_slot(
        date=request.date,
        time=request.time,
        city=request.city,
        restaurant=request.restaurant,
        max_people=request.max_people,
    )
    logger.info(f"Admin {admin_id} created slot {slot.id}")
    return {
        "id": slot.id,
        "date": slot.date.strftime("%d.%m.%Y"),
        "time": slot.time,
        "city": slot.city,
        "restaurant": slot.restaurant,
        "max_people": slot.max_people,
    }


@admin_router_api.patch("/slots/{slot_id}")
async def admin_update_slot(
    slot_id: int,
    request: SlotUpdateRequest,
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Редактирование слота."""
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
        "date": slot.date.strftime("%d.%m.%Y"),
        "time": slot.time,
        "city": slot.city,
        "restaurant": slot.restaurant,
        "max_people": slot.max_people,
        "current_bookings": slot.current_bookings,
        "is_active": slot.is_active,
    }


@admin_router_api.get("/slots/{slot_id}")
async def admin_slot_detail(
    slot_id: int,
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Детали слота."""
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


@admin_router_api.get("/slots/{slot_id}/participants")
async def admin_slot_participants(
    slot_id: int,
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Участники мероприятия с информацией об оплате."""
    repo = AdminRepo(session)
    slot = await repo.get_slot_by_id(slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    participants = await repo.get_slot_participants(slot_id)
    return {"slot_id": slot_id, "participants": participants}


# ===== Группы =====

@admin_router_api.get("/groups")
async def admin_groups(
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Список групп."""
    repo = GroupRepo(session)
    groups = await repo.get_all_groups()
    return {"groups": groups}


@admin_router_api.post("/groups")
async def admin_create_group(
    request: GroupCreateRequest,
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Создание группы."""
    repo = GroupRepo(session)
    try:
        group = await repo.create_group(request.name)
    except Exception:
        raise HTTPException(status_code=400, detail="Group with this name already exists")
    logger.info(f"Admin {admin_id} created group '{group.name}' (id={group.id})")
    return {"id": group.id, "name": group.name}


@admin_router_api.delete("/groups/{group_id}")
async def admin_delete_group(
    group_id: int,
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Удаление группы."""
    repo = GroupRepo(session)
    ok = await repo.delete_group(group_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Group not found")
    logger.info(f"Admin {admin_id} deleted group {group_id}")
    return {"success": True}


@admin_router_api.get("/groups/{group_id}/members")
async def admin_group_members(
    group_id: int,
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Участники группы."""
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


@admin_router_api.post("/groups/{group_id}/members")
async def admin_add_group_members(
    group_id: int,
    request: GroupMembersRequest,
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Добавление пользователей в группу."""
    repo = GroupRepo(session)
    report = await repo.add_members(group_id, request.user_ids)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    logger.info(f"Admin {admin_id} added members to group {group_id}: {report}")
    return report


@admin_router_api.delete("/groups/{group_id}/members/{user_id}")
async def admin_remove_group_member(
    group_id: int,
    user_id: int,
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Удаление пользователя из группы."""
    repo = GroupRepo(session)
    ok = await repo.remove_member(group_id, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Member not found in group")
    return {"success": True}


# ===== Рассылка =====

@admin_router_api.post("/broadcast")
async def admin_broadcast(
    request: BroadcastRequest,
    session: AsyncSession = Depends(get_session),
    admin_id: int = Depends(require_admin),
):
    """Рассылка текстового сообщения по группам и/или участникам слота."""
    import asyncio
    from aiogram import Bot

    if not request.group_ids and not request.slot_id:
        raise HTTPException(status_code=400, detail="Specify group_ids or slot_id")

    target_user_ids: set[int] = set()

    if request.group_ids:
        group_repo = GroupRepo(session)
        ids = await group_repo.get_group_member_ids(request.group_ids)
        target_user_ids.update(ids)

    if request.slot_id:
        admin_repo = AdminRepo(session)
        participants = await admin_repo.get_slot_participants(request.slot_id)
        for p in participants:
            target_user_ids.add(p["user_id"])

    if not target_user_ids:
        return {"sent": 0, "failed": 0, "errors": ["No target users found"]}

    bot = Bot(token=BOT_TOKEN)
    sent = 0
    failed = 0
    errors = []

    try:
        for uid in target_user_ids:
            try:
                await bot.send_message(chat_id=uid, text=request.text)
                sent += 1
                await asyncio.sleep(0.05)
            except Exception as e:
                failed += 1
                errors.append(f"user {uid}: {str(e)[:80]}")
    finally:
        await bot.session.close()

    logger.info(f"Admin {admin_id} broadcast: sent={sent}, failed={failed}")
    return {"sent": sent, "failed": failed, "errors": errors[:20]}
