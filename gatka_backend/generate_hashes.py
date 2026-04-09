"""
Run this script ONCE to generate bcrypt hashes for your default passwords.
Then copy the printed hashes into your pgAdmin SQL INSERT statements.

Usage:
    python generate_hashes.py
"""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

passwords = {
    "Admin password  (admin@gatka.com)": "Admin@Gatka2024",
    "User password   (all 65 accounts)": "Gatka@2024",
}

print("=" * 60)
print("  Gatka Federation — bcrypt password hashes")
print("  Copy these into your SQL INSERT statements")
print("=" * 60)

for label, pw in passwords.items():
    hashed = pwd_context.hash(pw)
    print(f"\n{label}")
    print(f"  Plain    : {pw}")
    print(f"  Hash     : {hashed}")

print("\n" + "=" * 60)
print("IMPORTANT: Paste each hash into the corresponding SQL INSERT.")
print("Admin hash  → users INSERT for admin@gatka.com")
print("User hash   → the DO $$ ... $$ block (pw_hash variable)")
print("=" * 60)
