#!/usr/bin/env python3
"""
Reset all PV, matching, and wallet values for ALL users (including admin)
This will completely reset the financial and PV state of the system
"""
import pymongo
from datetime import datetime

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["mlm_vsv_unite"]

print("🔄 Starting complete system reset...")
print("=" * 70)

# 1. Reset ALL users' PV values
print("📊 Step 1: Resetting PV values for ALL users...")
result = db.users.update_many(
    {},  # Update all users
    {
        "$set": {
            "leftPV": 0,
            "rightPV": 0,
            "totalPV": 0,
            "dailyPVUsed": 0,
            "lastMatchingDate": None,
            "updatedAt": datetime.utcnow()
        }
    }
)
print(f"   ✅ Reset PV values for {result.modified_count} users")

# 2. Reset ALL wallets (including admin)
print("\n💰 Step 2: Resetting ALL wallet values...")
result = db.wallets.update_many(
    {},  # Update all wallets
    {
        "$set": {
            "balance": 0,
            "totalEarnings": 0,
            "totalWithdrawals": 0,
            "updatedAt": datetime.utcnow()
        }
    }
)
print(f"   ✅ Reset wallet values for {result.modified_count} wallets")

# 3. Delete ALL transactions (including admin's)
print("\n📝 Step 3: Deleting ALL transactions...")
result = db.transactions.delete_many({})
print(f"   ✅ Deleted {result.deleted_count} transactions")

# 4. Delete ALL withdrawals
print("\n🏦 Step 4: Deleting ALL withdrawals...")
result = db.withdrawals.delete_many({})
print(f"   ✅ Deleted {result.deleted_count} withdrawals")

# 5. Delete ALL topups
print("\n⬆️  Step 5: Deleting ALL topups...")
result = db.topups.delete_many({})
print(f"   ✅ Deleted {result.deleted_count} topups")

# 6. Verify admin wallet is at 0
print("\n🔍 Step 6: Verifying admin wallet...")
admin = db.users.find_one({"role": "admin"})
if admin:
    admin_wallet = db.wallets.find_one({"userId": str(admin["_id"])})
    if admin_wallet:
        print(f"   Admin: {admin['name']} ({admin.get('referralId', 'N/A')})")
        print(f"   Wallet Balance: ₹{admin_wallet.get('balance', 0)}")
        print(f"   Total Earnings: ₹{admin_wallet.get('totalEarnings', 0)}")
        print(f"   Left PV: {admin.get('leftPV', 0)}")
        print(f"   Right PV: {admin.get('rightPV', 0)}")
        print(f"   Total PV: {admin.get('totalPV', 0)}")

# 7. Count remaining data
print("\n📊 Step 7: Current system state...")
users_count = db.users.count_documents({})
wallets_count = db.wallets.count_documents({})
transactions_count = db.transactions.count_documents({})
teams_count = db.teams.count_documents({})

print(f"   Total Users: {users_count}")
print(f"   Total Wallets: {wallets_count}")
print(f"   Total Transactions: {transactions_count}")
print(f"   Total Team Records: {teams_count}")

print("\n" + "=" * 70)
print("✅ COMPLETE SYSTEM RESET SUCCESSFUL!")
print("\n🎯 All PV values set to 0")
print("🎯 All wallet balances set to 0")
print("🎯 All transactions deleted")
print("🎯 All withdrawals deleted")
print("🎯 All topups deleted")
print("\n💡 System is now in a completely fresh state!")
