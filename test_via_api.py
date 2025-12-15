"""Test PV calculation via direct database access"""
import os
import sys
from datetime import datetime, timedelta
import pytz

# Change to backend directory to load correct .env
os.chdir('/app/backend')
sys.path.insert(0, '/app/backend')

from dotenv import load_dotenv
load_dotenv()

from pymongo import MongoClient
from bson import ObjectId

# Now import server module which will use correct env
import server

IST = pytz.timezone('Asia/Kolkata')

def get_ist_now():
    return datetime.now(IST)

print("="*70)
print("TESTING PV CALCULATION FIX (Via Backend Collections)")
print("="*70)

# Use collections from server module
users_collection = server.users_collection
plans_collection = server.plans_collection
wallets_collection = server.wallets_collection

# Step 1: Create or find test plan
print("\n1. Setting up test plan...")
test_plan = plans_collection.find_one({"name": "Test Plan 250"})
if not test_plan:
    plans_collection.insert_one({
        "name": "Test Plan 250",
        "amount": 1000,
        "pv": 500,
        "dailyCapping": 250,
        "referralIncome": 100,
        "matchingIncome": 25,
        "isActive": True,
        "createdAt": get_ist_now()
    })
    test_plan = plans_collection.find_one({"name": "Test Plan 250"})
print(f"   ✓ Plan: {test_plan['name']} (Daily Cap: ₹{test_plan['dailyCapping']})")

# Step 2: Create or reset test user
print("\n2. Setting up test user...")
test_user = users_collection.find_one({"referralId": "PVTEST002"})

if not test_user:
    user_id = users_collection.insert_one({
        "name": "PV Test User 2",
        "username": "pvtestuser2",
        "email": "pvtest2@example.com",
        "referralId": "PVTEST002",
        "password": "hashed",
        "mobile": "9999999998",
        "role": "user",
        "isActive": True,
        "currentPlan": str(test_plan["_id"]),
        "leftPV": 14,
        "rightPV": 37,
        "totalPV": 17,
        "dailyPVUsed": 0,
        "lastMatchingDate": get_ist_now() - timedelta(days=1),
        "createdAt": get_ist_now()
    }).inserted_id
    
    wallets_collection.insert_one({
        "userId": str(user_id),
        "balance": 0,
        "totalEarnings": 0,
        "totalWithdrawals": 0,
        "createdAt": get_ist_now()
    })
    test_user = users_collection.find_one({"_id": user_id})
else:
    users_collection.update_one(
        {"_id": test_user["_id"]},
        {
            "$set": {
                "leftPV": 14,
                "rightPV": 37,
                "totalPV": 17,
                "dailyPVUsed": 0,
                "currentPlan": str(test_plan["_id"]),
                "lastMatchingDate": get_ist_now() - timedelta(days=1)
            }
        }
    )
    wallets_collection.update_one(
        {"userId": str(test_user["_id"])},
        {"$set": {"balance": 0, "totalEarnings": 0}}
    )
    test_user = users_collection.find_one({"_id": test_user["_id"]})

print(f"   ✓ User: {test_user['referralId']}")
print(f"   User ID: {test_user['_id']}")

# Step 3: Show initial state
print("\n3. Initial State:")
print(f"   Left PV: {test_user['leftPV']}")
print(f"   Right PV: {test_user['rightPV']}")
print(f"   Total PV: {test_user['totalPV']}")
print(f"   Daily PV Used: {test_user['dailyPVUsed']}")

# Step 4: Calculate expected
matched_pv = 14
today_pv = 10
print("\n4. Expected After Calculation:")
print(f"   Left PV: 0  (14 - 14)")
print(f"   Right PV: 23  (37 - 14)")
print(f"   Total PV: 31  (17 + 14)")
print(f"   Daily PV Used: 10")
print(f"   Income: ₹250  (10 × 25)")

# Step 5: Run calculation
print("\n5. Running calculation...")
server.calculate_matching_income(str(test_user["_id"]))

# Step 6: Get results
final_user = users_collection.find_one({"_id": test_user["_id"]})
final_wallet = wallets_collection.find_one({"userId": str(test_user["_id"])})

print("\n6. Actual Results:")
print(f"   Left PV: {final_user['leftPV']}")
print(f"   Right PV: {final_user['rightPV']}")
print(f"   Total PV: {final_user['totalPV']}")
print(f"   Daily PV Used: {final_user.get('dailyPVUsed', 0)}")
print(f"   Wallet Balance: ₹{final_wallet['balance'] if final_wallet else 0}")

# Verification
print("\n" + "="*70)
print("VERIFICATION")
print("="*70)

tests = [
    ("Left PV", final_user['leftPV'], 0),
    ("Right PV", final_user['rightPV'], 23),
    ("Total PV", final_user['totalPV'], 31),
    ("Daily PV Used", final_user.get('dailyPVUsed', 0), 10),
    ("Income", final_wallet['balance'] if final_wallet else 0, 250)
]

all_passed = True
for name, actual, expected in tests:
    if actual == expected:
        print(f"✅ {name}: {actual}")
    else:
        print(f"❌ {name}: {actual} (Expected: {expected})")
        all_passed = False

print("\n" + "="*70)
if all_passed:
    print("✅ ALL TESTS PASSED!")
    print("The PV calculation fix is working correctly!")
    print("")
    print("Summary of changes:")
    print("- Flush matched_pv (not today_pv) from both sides")
    print("- Add matched_pv (not today_pv) to totalPV")
    print("- Pay income only for today_pv (capped amount)")
    print("- Track today_pv in dailyPVUsed")
else:
    print("❌ SOME TESTS FAILED!")
print("="*70)
