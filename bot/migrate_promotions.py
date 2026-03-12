#!/usr/bin/env python3
"""
Database migration script to create promotions and promotion_purchases tables.
SAFE: Uses CREATE TABLE IF NOT EXISTS — won't affect existing data or tables.
Run inside the backend container: python migrate_promotions.py
"""
import asyncio
import sys
import os
from sqlalchemy import text

# Add bot directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db.session import init_db, get_async_engine, AsyncSessionLocal


MIGRATION_SQL = """
-- Таблица акций/предложений
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    target_audience VARCHAR,
    price INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    validity_days INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_promotions_is_active ON promotions (is_active);

-- Таблица покупок акций
CREATE TABLE IF NOT EXISTS promotion_purchases (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
    status VARCHAR DEFAULT 'pending',
    purchased_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    visits_remaining INTEGER
);

CREATE INDEX IF NOT EXISTS ix_promotion_purchases_user_id ON promotion_purchases (user_id);
CREATE INDEX IF NOT EXISTS ix_promotion_purchases_promotion_id ON promotion_purchases (promotion_id);
CREATE INDEX IF NOT EXISTS ix_promotion_purchases_status ON promotion_purchases (status);
CREATE INDEX IF NOT EXISTS ix_promotion_purchases_user_status ON promotion_purchases (user_id, status);
"""


async def migrate_promotions():
    """Create promotions and promotion_purchases tables in database."""
    print("[MIGRATE] Starting promotions tables migration...")

    try:
        # Initialize database connection
        await init_db()
        print("[MIGRATE] ✅ Database initialized")

        engine = get_async_engine()
        async with engine.begin() as conn:
            # Execute migration SQL (safe — uses IF NOT EXISTS)
            for statement in MIGRATION_SQL.strip().split(";"):
                stmt = statement.strip()
                if stmt and not stmt.startswith("--"):
                    await conn.execute(text(stmt))
            print("[MIGRATE] ✅ Migration SQL executed")

        # Verify tables exist
        async with AsyncSessionLocal() as session:
            # Check promotions table
            result = await session.execute(text(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promotions')"
            ))
            promo_exists = result.scalar()

            # Check promotion_purchases table
            result = await session.execute(text(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promotion_purchases')"
            ))
            purchases_exists = result.scalar()

            if promo_exists and purchases_exists:
                print("[MIGRATE] ✅ Both tables verified:")

                # Show columns for promotions
                result = await session.execute(text(
                    "SELECT column_name, data_type FROM information_schema.columns "
                    "WHERE table_name = 'promotions' ORDER BY ordinal_position"
                ))
                print("[MIGRATE]   promotions columns:")
                for row in result:
                    print(f"    - {row[0]}: {row[1]}")

                # Show columns for promotion_purchases
                result = await session.execute(text(
                    "SELECT column_name, data_type FROM information_schema.columns "
                    "WHERE table_name = 'promotion_purchases' ORDER BY ordinal_position"
                ))
                print("[MIGRATE]   promotion_purchases columns:")
                for row in result:
                    print(f"    - {row[0]}: {row[1]}")
            else:
                print(f"[MIGRATE] ❌ Tables missing: promotions={promo_exists}, promotion_purchases={purchases_exists}")
                return False

        print("[MIGRATE] ✅ Migration completed successfully!")
        return True

    except Exception as e:
        print(f"[MIGRATE] ❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(migrate_promotions())
    sys.exit(0 if success else 1)
