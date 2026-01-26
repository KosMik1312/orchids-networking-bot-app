#!/usr/bin/env python3
"""
Database migration script to create payments table.
Run this after updating db/models.py with Payment model.
"""
import asyncio
import sys
import os
from sqlalchemy import text

# Add bot directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db.session import init_db, get_async_engine, AsyncSessionLocal
from db.models import Base
from config import DATABASE_NAME


async def migrate_payments_table():
    """Create payments table in database."""
    print("[MIGRATE] Starting payments table migration...")
    print(f"[MIGRATE] Database: {DATABASE_NAME}")
    
    try:
        # Initialize database
        await init_db()
        print("[MIGRATE] ✅ Database initialized")
        
        # Create all tables (including new Payment table)
        engine = get_async_engine()
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[MIGRATE] ✅ All tables created/updated")
        
        # Verify payments table exists
        async with AsyncSessionLocal() as session:
            result = await session.execute(text(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='payments'"
            ))
            table_exists = result.scalar()
            
            if table_exists:
                print("[MIGRATE] ✅ payments table exists")
                
                # Get table info
                result = await session.execute(text("PRAGMA table_info(payments)"))
                columns = result.fetchall()
                print("[MIGRATE] Columns in payments table:")
                for col in columns:
                    print(f"  - {col[1]}: {col[2]}")
            else:
                print("[MIGRATE] ❌ payments table not found!")
                return False
        
        print("[MIGRATE] ✅ Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"[MIGRATE] ❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(migrate_payments_table())
    sys.exit(0 if success else 1)
