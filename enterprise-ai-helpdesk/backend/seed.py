"""
seed.py — Creates all demo users in the SQLite database.

Run once from the backend directory:
    python3 seed.py

Demo accounts created:
  Customer:   customer@demo.com       / password123
  Agent:      agent@helpdesk.com      / password123
  Admin:      admin@redbus.in         / password123
              admin@irctc.co.in       / password123
  SuperAdmin: superadmin@company.com  / password123
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database.database import SessionLocal, engine
from app.database import models
from app.database.migrations import run_essential_migrations
from app.auth.password import PasswordHasher

DEMO_USERS = [
    {
        "id":        "usr_superadmin",
        "email":     "superadmin@company.com",
        "password":  "password123",
        "full_name": "Super Administrator",
        "role":      "SuperAdmin",
    },
    {
        "id":        "usr_admin_redbus",
        "email":     "admin@redbus.in",
        "password":  "password123",
        "full_name": "RedBus Admin",
        "role":      "Admin",
    },
    {
        "id":        "usr_admin_irctc",
        "email":     "admin@irctc.co.in",
        "password":  "password123",
        "full_name": "IRCTC Admin",
        "role":      "Admin",
    },
    {
        "id":        "usr_agent",
        "email":     "agent@helpdesk.com",
        "password":  "password123",
        "full_name": "Support Agent",
        "role":      "Agent",
    },
    {
        "id":        "usr_customer",
        "email":     "customer@demo.com",
        "password":  "password123",
        "full_name": "Demo Customer",
        "role":      "Customer",
    },
]

def seed():
    print("🌱 Running database migrations...")
    run_essential_migrations()

    db = SessionLocal()
    created = 0
    skipped = 0

    import uuid
    try:
        for u in DEMO_USERS:
            existing = db.query(models.User).filter(models.User.email == u["email"]).first()
            if existing:
                print(f"  ⏭  Skipping {u['email']} (already exists, role={existing.role})")
                skipped += 1
                continue

            db_user = models.User(
                id=f"usr_{uuid.uuid4().hex[:10]}",   # guaranteed unique
                email=u["email"],
                hashed_password=PasswordHasher.hash_password(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
            )
            db.add(db_user)
            try:
                db.commit()
                created += 1
                print(f"  ✅ Created [{u['role']:12s}] {u['email']}")
            except Exception as ex:
                db.rollback()
                print(f"  ❌ Failed  [{u['role']:12s}] {u['email']} — {ex}")
                skipped += 1

        print(f"\n✨ Done! {created} user(s) created, {skipped} skipped.")
        print("\n📋 Demo Login Credentials (all passwords: password123)")
        print("  ─────────────────────────────────────────────────────")
        for u in DEMO_USERS:
            print(f"  [{u['role']:12s}] {u['email']}")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
