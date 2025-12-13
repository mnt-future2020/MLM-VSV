"""
Test script to verify PV calculation fix
Tests the exact scenario provided by user
"""
import os
import sys
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import pytz

# Connect to MongoDB
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017/')
client = MongoClient(mongo_url)
db = client['binary_mlm']
users_collection = db['users']
plans_collection = db['plans']
wallets_collection = db['wallets']
transactions_collection = db['transactions']

IST = pytz.timezone('Asia/Kolkata')

def setup_test_scenario():
    """Setup test scenario with user's exact example"""
    print("\n" + "="*60)
    print("SETTING UP TEST SCENARIO")
    print("="*60)
    
    # Create a test plan with daily capping of 250 (10 PV per day)
    test_plan = plans_collection.find_one({"name": "Test Plan"})
    if not test_plan:
        plans_collection.insert_one({
            "name": "Test Plan",
            "amount": 1000,
            "pv": 500,
            "dailyCapping": 250,  # 250/25 = 10 PV per day max
            "referralIncome": 100,
            "matchingIncome": 25,
            "isActive": True,
            "createdAt": datetime.now(IST)
        })
        test_plan = plans_collection.find_one({"name": "Test Plan"})
    
    # Create or find test user
    test_user = users_collection.find_one({"referralId": "TEST001"})
    if not test_user:
        users_collection.insert_one({
            "name": "Test User",
            "username": "testuser",
            "email": "test@example.com",
            "referralId": "TEST001",
            "password": "hashed",
            "mobile": "9999999999",
            "role": "user",
            "isActive": True,
            "currentPlan": str(test_plan["_id"]),
            "leftPV": 14,
            "rightPV": 37,
            "totalPV": 17,  # Previous total
            "dailyPVUsed": 10,  # Used 10 PV today already
            "lastMatchingDate": datetime.now(IST).replace(hour=0, minute=0, second=0, microsecond=0),
            "createdAt": datetime.now(IST)
        })
        test_user = users_collection.find_one({"referralId": "TEST001"})
        
        # Create wallet
        wallets_collection.insert_one({
            "userId": str(test_user["_id"]),
            "balance": 0,
            "totalEarnings": 0,
            "totalWithdrawals": 0,
            "createdAt": datetime.now(IST)
        })
    else:
        # Reset test user to initial state
        users_collection.update_one(
            {"_id": test_user["_id"]},
            {
                "$set": {
                    "leftPV": 14,
                    "rightPV": 37,
                    "totalPV": 17,
                    "dailyPVUsed": 10,
                    "currentPlan": str(test_plan["_id"]),
                    "lastMatchingDate": datetime.now(IST).replace(hour=0, minute=0, second=0, microsecond=0)
                }
            }
        )
        wallets_collection.update_one(
            {"userId": str(test_user["_id"])},
            {"$set": {"balance": 0, "totalEarnings": 0}}
        )
    
    test_user = users_collection.find_one({"referralId": "TEST001"})
    print(f"\n✓ Test user created: {test_user['referralId']}")
    print(f"  Initial state:")
    print(f"    Left PV: {test_user['leftPV']}")
    print(f"    Right PV: {test_user['rightPV']}")
    print(f"    Total PV: {test_user['totalPV']}")
    print(f"    Daily PV Used: {test_user['dailyPVUsed']}")
    print(f"    Plan Daily Capping: ₹{test_plan['dailyCapping']} (Max {test_plan['dailyCapping']//25} PV/day)")
    
    return str(test_user["_id"])


def test_matching_calculation():
    """Test the matching income calculation with fixed logic"""
    print("\n" + "="*60)
    print("TESTING MATCHING INCOME CALCULATION")
    print("="*60)
    
    # Import the calculate_matching_income function
    sys.path.insert(0, '/app/backend')
    from server import calculate_matching_income
    
    user_id = setup_test_scenario()
    
    # Get initial state
    user_before = users_collection.find_one({"_id": ObjectId(user_id)})
    wallet_before = wallets_collection.find_one({"userId": user_id})
    
    print(f"\n📊 BEFORE CALCULATION:")
    print(f"  Left PV: {user_before['leftPV']}")
    print(f"  Right PV: {user_before['rightPV']}")
    print(f"  Total PV: {user_before['totalPV']}")
    print(f"  Daily PV Used: {user_before['dailyPVUsed']}")
    print(f"  Wallet Balance: ₹{wallet_before['balance'] if wallet_before else 0}")
    
    # Expected calculations
    left_pv = user_before['leftPV']
    right_pv = user_before['rightPV']
    matched_pv = min(left_pv, right_pv)
    daily_cap = 250
    max_pv_per_day = daily_cap // 25
    daily_pv_used = user_before['dailyPVUsed']
    remaining_pv_today = max_pv_per_day - daily_pv_used
    today_pv = min(matched_pv, remaining_pv_today)
    expected_income = today_pv * 25
    
    print(f"\n🧮 EXPECTED CALCULATIONS:")
    print(f"  Matched PV: min({left_pv}, {right_pv}) = {matched_pv}")
    print(f"  Max PV per day: {daily_cap}/25 = {max_pv_per_day}")
    print(f"  Already used today: {daily_pv_used} PV")
    print(f"  Remaining today: {max_pv_per_day} - {daily_pv_used} = {remaining_pv_today} PV")
    print(f"  Today PV: min({matched_pv}, {remaining_pv_today}) = {today_pv}")
    print(f"  Income: {today_pv} × ₹25 = ₹{expected_income}")
    print(f"\n  Expected after EOD:")
    print(f"    Left PV: {left_pv} - {matched_pv} = {left_pv - matched_pv}")
    print(f"    Right PV: {right_pv} - {matched_pv} = {right_pv - matched_pv}")
    print(f"    Total PV: {user_before['totalPV']} + {matched_pv} = {user_before['totalPV'] + matched_pv}")
    print(f"    Daily PV Used: {daily_pv_used} + {today_pv} = {daily_pv_used + today_pv}")
    
    # Run the calculation
    print(f"\n⚙️  Running matching income calculation...")
    calculate_matching_income(user_id)
    
    # Get final state
    user_after = users_collection.find_one({"_id": ObjectId(user_id)})
    wallet_after = wallets_collection.find_one({"userId": user_id})
    
    print(f"\n📊 AFTER CALCULATION:")
    print(f"  Left PV: {user_after['leftPV']}")
    print(f"  Right PV: {user_after['rightPV']}")
    print(f"  Total PV: {user_after['totalPV']}")
    print(f"  Daily PV Used: {user_after['dailyPVUsed']}")
    print(f"  Wallet Balance: ₹{wallet_after['balance'] if wallet_after else 0}")
    
    # Verify results
    print(f"\n" + "="*60)
    print("VERIFICATION")
    print("="*60)
    
    all_passed = True
    
    # Check Left PV
    expected_left = left_pv - matched_pv
    if user_after['leftPV'] == expected_left:
        print(f"✅ Left PV: {user_after['leftPV']} (Expected: {expected_left})")
    else:
        print(f"❌ Left PV: {user_after['leftPV']} (Expected: {expected_left})")
        all_passed = False
    
    # Check Right PV
    expected_right = right_pv - matched_pv
    if user_after['rightPV'] == expected_right:
        print(f"✅ Right PV: {user_after['rightPV']} (Expected: {expected_right})")
    else:
        print(f"❌ Right PV: {user_after['rightPV']} (Expected: {expected_right})")
        all_passed = False
    
    # Check Total PV
    expected_total = user_before['totalPV'] + matched_pv
    if user_after['totalPV'] == expected_total:
        print(f"✅ Total PV: {user_after['totalPV']} (Expected: {expected_total})")
    else:
        print(f"❌ Total PV: {user_after['totalPV']} (Expected: {expected_total})")
        all_passed = False
    
    # Check Daily PV Used
    expected_daily = daily_pv_used + today_pv
    if user_after['dailyPVUsed'] == expected_daily:
        print(f"✅ Daily PV Used: {user_after['dailyPVUsed']} (Expected: {expected_daily})")
    else:
        print(f"❌ Daily PV Used: {user_after['dailyPVUsed']} (Expected: {expected_daily})")
        all_passed = False
    
    # Check Income
    actual_income = wallet_after['balance'] if wallet_after else 0
    if actual_income == expected_income:
        print(f"✅ Income Earned: ₹{actual_income} (Expected: ₹{expected_income})")
    else:
        print(f"❌ Income Earned: ₹{actual_income} (Expected: ₹{expected_income})")
        all_passed = False
    
    print(f"\n" + "="*60)
    if all_passed:
        print("✅ ALL TESTS PASSED!")
        print("PV calculation fix is working correctly!")
    else:
        print("❌ SOME TESTS FAILED!")
        print("Please check the implementation.")
    print("="*60)
    
    return all_passed


if __name__ == "__main__":
    try:
        test_matching_calculation()
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()
