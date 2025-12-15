"""Simple direct test"""
import os
import sys
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import pytz

sys.path.insert(0, '/app/backend')

# Connect to MongoDB
mongo_url = os.getenv('MONGO_URL')
db_name = os.getenv('MONGO_DB_NAME', 'mlm_vsv_unite')
client = MongoClient(mongo_url)
db = client[db_name]
users_collection = db['users']
plans_collection = db['plans']
wallets_collection = db['wallets']

IST = pytz.timezone('Asia/Kolkata')

def get_ist_now():
    return datetime.now(IST)

# Reset test user
test_user = users_collection.find_one({"referralId": "TEST001"})
if test_user:
    users_collection.update_one(
        {"_id": test_user["_id"]},
        {
            "$set": {
                "leftPV": 14,
                "rightPV": 37,
                "totalPV": 17,
                "dailyPVUsed": 0,
                "lastMatchingDate": datetime.now(IST) - timedelta(days=1)
            }
        }
    )
    wallets_collection.update_one(
        {"userId": str(test_user["_id"])},
        {"$set": {"balance": 0, "totalEarnings": 0}}
    )
    
    print("Initial state:")
    user = users_collection.find_one({"_id": test_user["_id"]})
    print(f"  Left: {user['leftPV']}, Right: {user['rightPV']}, Total: {user['totalPV']}")
    
    # Import and run
    try:
        from server import calculate_matching_income
        calculate_matching_income(str(test_user["_id"]))
        
        # Check result
        user = users_collection.find_one({"_id": test_user["_id"]})
        wallet = wallets_collection.find_one({"userId": str(test_user["_id"])})
        
        print("\nAfter calculation:")
        print(f"  Left: {user['leftPV']}, Right: {user['rightPV']}, Total: {user['totalPV']}")
        print(f"  Daily PV Used: {user.get('dailyPVUsed', 0)}")
        print(f"  Wallet: ₹{wallet['balance'] if wallet else 0}")
        
        # Verify
        if user['leftPV'] == 0 and user['rightPV'] == 23 and user['totalPV'] == 31:
            print("\n✅ TEST PASSED!")
        else:
            print("\n❌ TEST FAILED!")
            print(f"Expected: Left=0, Right=23, Total=31")
            print(f"Got: Left={user['leftPV']}, Right={user['rightPV']}, Total={user['totalPV']}")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("Test user not found!")
