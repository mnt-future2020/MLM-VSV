#!/usr/bin/env python3
"""
Clear all database collections except admin user
This will reset the system for fresh testing
"""
import pymongo
from datetime import datetime

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["mlm_vsv_unite"]

print("🔄 Starting database cleanup...")
print("=" * 50)

# Get admin user details before deletion
admin = db.users.find_one({"role": "admin"})
if not admin:
    print("❌ Error: Admin user not found!")
    exit(1)

admin_id = str(admin["_id"])
admin_referral_id = admin.get("referralId", "VSV00001")
print(f"✅ Found admin: {admin['name']} ({admin_referral_id})")
print()

# Collections to clear
collections_to_clear = [
    "users",
    "teams", 
    "wallets",
    "transactions",
    "withdrawals",
    "topups"
]

# Track what we're keeping and deleting
stats = {
    "kept": {},
    "deleted": {}
}

for collection_name in collections_to_clear:
    collection = db[collection_name]
    
    if collection_name == "users":
        # Keep only admin user
        result = collection.delete_many({"role": {"$ne": "admin"}})
        stats["deleted"]["users"] = result.deleted_count
        stats["kept"]["users"] = 1
        print(f"📦 Users: Kept 1 admin, deleted {result.deleted_count} users")
        
    elif collection_name == "wallets":
        # Keep admin wallet, delete others
        result = collection.delete_many({"userId": {"$ne": admin_id}})
        stats["deleted"]["wallets"] = result.deleted_count
        
        # Reset admin wallet to 0
        collection.update_one(
            {"userId": admin_id},
            {
                "$set": {
                    "balance": 0,
                    "totalEarnings": 0,
                    "totalWithdrawals": 0,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        stats["kept"]["wallets"] = 1
        print(f"💰 Wallets: Kept 1 admin wallet (reset to ₹0), deleted {result.deleted_count} wallets")
        
    elif collection_name == "transactions":
        # Delete all transactions
        result = collection.delete_many({})
        stats["deleted"]["transactions"] = result.deleted_count
        print(f"📝 Transactions: Deleted {result.deleted_count} transactions")
        
    elif collection_name == "teams":
        # Delete all team records (admin has no sponsor)
        result = collection.delete_many({})
        stats["deleted"]["teams"] = result.deleted_count
        print(f"👥 Teams: Deleted {result.deleted_count} team records")
        
    elif collection_name == "withdrawals":
        # Delete all withdrawal requests
        result = collection.delete_many({})
        stats["deleted"]["withdrawals"] = result.deleted_count
        print(f"🏦 Withdrawals: Deleted {result.deleted_count} withdrawal requests")
        
    elif collection_name == "topups":
        # Delete all topup requests
        result = collection.delete_many({})
        stats["deleted"]["topups"] = result.deleted_count
        print(f"⬆️  Topups: Deleted {result.deleted_count} topup requests")

# Reset admin user PV values
print()
print("🔧 Resetting admin PV values...")
db.users.update_one(
    {"_id": admin["_id"]},
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
print("✅ Admin PV values reset to 0")

print()
print("=" * 50)
print("✅ Database cleanup completed successfully!")
print()
print("📊 Summary:")
print(f"   - Users: {stats['kept'].get('users', 0)} kept, {stats['deleted'].get('users', 0)} deleted")
print(f"   - Wallets: {stats['kept'].get('wallets', 0)} kept (reset), {stats['deleted'].get('wallets', 0)} deleted")
print(f"   - Transactions: {stats['deleted'].get('transactions', 0)} deleted")
print(f"   - Teams: {stats['deleted'].get('teams', 0)} deleted")
print(f"   - Withdrawals: {stats['deleted'].get('withdrawals', 0)} deleted")
print(f"   - Topups: {stats['deleted'].get('topups', 0)} deleted")
print()
print("🎯 System is now ready for fresh testing with only admin user!")
print(f"   Admin: {admin['name']} ({admin_referral_id})")
print(f"   Wallet Balance: ₹0")
