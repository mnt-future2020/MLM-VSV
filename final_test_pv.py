"""Final comprehensive test of PV calculation fix"""
import os
import sys
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import pytz

sys.path.insert(0, '/app/backend')

# Connect to MongoDB (same as server.py)
mongo_url = os.getenv('MONGO_URL')
db_name = os.getenv('MONGO_DB_NAME', 'mlm_vsv_unite')
client = MongoClient(mongo_url)
db = client[db_name]

users_collection = db["users"]
plans_collection = db["plans"]
wallets_collection = db["wallets"]
transactions_collection = db["transactions"]
teams_collection = db["teams"]

IST = pytz.timezone('Asia/Kolkata')

def get_ist_now():
    return datetime.now(IST)

print("="*70)
print("TESTING PV CALCULATION FIX")
print("="*70)

# Step 1: Create or find a test plan
print("\n1. Setting up test plan...")
test_plan = plans_collection.find_one({"name": "Test Plan 250"})
if not test_plan:
    plans_collection.insert_one({
        "name": "Test Plan 250",
        "amount": 1000,
        "pv": 500,
        "dailyCapping": 250,  # 250/25 = 10 PV per day max
        "referralIncome": 100,
        "matchingIncome": 25,
        "isActive": True,
        "createdAt": get_ist_now()
    })
    test_plan = plans_collection.find_one({"name": "Test Plan 250"})
print(f"   ✓ Plan: {test_plan['name']} (Daily Cap: ₹{test_plan['dailyCapping']})")

# Step 2: Create or reset test user
print("\n2. Setting up test user...")
test_user = users_collection.find_one({"referralId": "PVTEST001"})

if not test_user:
    # Create new test user
    user_id = users_collection.insert_one({
        "name": "PV Test User",
        "username": "pvtestuser",
        "email": "pvtest@example.com",
        "referralId": "PVTEST001",
        "password": "hashed",
        "mobile": "9999999999",
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
    
    # Create wallet
    wallets_collection.insert_one({
        "userId": str(user_id),
        "balance": 0,
        "totalEarnings": 0,
        "totalWithdrawals": 0,
        "createdAt": get_ist_now()
    })
    test_user = users_collection.find_one({"_id": user_id})
else:
    # Reset existing test user
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

# Step 3: Show initial state
print("\n3. Initial State:")
print(f"   Left PV: {test_user['leftPV']}")
print(f"   Right PV: {test_user['rightPV']}")
print(f"   Total PV: {test_user['totalPV']}")
print(f"   Daily PV Used: {test_user['dailyPVUsed']}")

# Step 4: Calculate expected values
matched_pv = min(test_user['leftPV'], test_user['rightPV'])
max_pv_per_day = test_plan['dailyCapping'] // 25
today_pv = min(matched_pv, max_pv_per_day)
expected_income = today_pv * 25

print("\n4. Expected Calculation:")
print(f"   Matched PV: min(14, 37) = {matched_pv}")
print(f"   Max PV/day: {test_plan['dailyCapping']}/25 = {max_pv_per_day}")
print(f"   Today PV: min({matched_pv}, {max_pv_per_day}) = {today_pv}")
print(f"   Income: {today_pv} × ₹25 = ₹{expected_income}")
print(f"\n   Expected Results:")
print(f"     Left PV: 14 - {matched_pv} = {14 - matched_pv}")
print(f"     Right PV: 37 - {matched_pv} = {37 - matched_pv}")
print(f"     Total PV: 17 + {matched_pv} = {17 + matched_pv}")
print(f"     Daily PV Used: 0 + {today_pv} = {today_pv}")

# Step 5: Run calculation
print("\n5. Running PV calculation...")
try:
    from server import calculate_matching_income
    calculate_matching_income(str(test_user["_id"]))
    print("   ✓ Calculation complete")
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 6: Verify results
print("\n6. Actual Results:")
final_user = users_collection.find_one({"_id": test_user["_id"]})
final_wallet = wallets_collection.find_one({"userId": str(test_user["_id"])})

print(f"   Left PV: {final_user['leftPV']}")
print(f"   Right PV: {final_user['rightPV']}")
print(f"   Total PV: {final_user['totalPV']}")
print(f"   Daily PV Used: {final_user.get('dailyPVUsed', 0)}")
print(f"   Wallet Balance: ₹{final_wallet['balance'] if final_wallet else 0}")

# Step 7: Verification
print("\n" + "="*70)
print("VERIFICATION")
print("="*70)

all_passed = True
tests = [
    ("Left PV", final_user['leftPV'], 0),
    ("Right PV", final_user['rightPV'], 23),
    ("Total PV", final_user['totalPV'], 31),
    ("Daily PV Used", final_user.get('dailyPVUsed', 0), 10),
    ("Income", final_wallet['balance'] if final_wallet else 0, 250)
]

for name, actual, expected in tests:
    if actual == expected:
        print(f"✅ {name}: {actual} (Expected: {expected})")
    else:
        print(f"❌ {name}: {actual} (Expected: {expected})")
        all_passed = False

print("\n" + "="*70)
if all_passed:
    print("✅ ALL TESTS PASSED! PV CALCULATION FIX IS WORKING CORRECTLY!")
else:
    print("❌ SOME TESTS FAILED! PLEASE REVIEW THE IMPLEMENTATION!")
print("="*70)

sys.exit(0 if all_passed else 1)
