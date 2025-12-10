#!/usr/bin/env python3
"""
Update all plans to set referralIncome to 0
"""
import pymongo

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["mlm_vsv_unite"]

print("🔄 Updating plans to remove referralIncome...")
print("=" * 50)

# Get all plans
plans = list(db.plans.find({}))
print(f"📋 Found {len(plans)} plans")
print()

for plan in plans:
    print(f"Plan: {plan['name']}")
    print(f"  Current referralIncome: ₹{plan.get('referralIncome', 0)}")
    
    # Update to 0
    db.plans.update_one(
        {"_id": plan["_id"]},
        {"$set": {"referralIncome": 0}}
    )
    print(f"  ✅ Updated referralIncome to ₹0")
    print()

print("=" * 50)
print("✅ All plans updated successfully!")
print("💡 All plans now have referralIncome = 0")
