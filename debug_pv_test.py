"""Debug PV calculation"""
import os
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

IST = pytz.timezone('Asia/Kolkata')

# Find test user
test_user = users_collection.find_one({"referralId": "TEST001"})
if not test_user:
    print("❌ Test user not found!")
else:
    print(f"✓ Found test user: {test_user['referralId']}")
    print(f"  ID: {test_user['_id']}")
    print(f"  Current Plan: {test_user.get('currentPlan')}")
    print(f"  Left PV: {test_user.get('leftPV', 0)}")
    print(f"  Right PV: {test_user.get('rightPV', 0)}")
    print(f"  Total PV: {test_user.get('totalPV', 0)}")
    
    # Check plan
    plan_id = test_user.get('currentPlan')
    if plan_id:
        try:
            plan = plans_collection.find_one({"_id": ObjectId(plan_id)})
            if plan:
                print(f"\n✓ Found plan:")
                print(f"  Name: {plan.get('name')}")
                print(f"  Daily Capping: {plan.get('dailyCapping')}")
            else:
                print(f"\n❌ Plan not found with ID: {plan_id}")
        except Exception as e:
            print(f"\n❌ Error finding plan: {e}")
    else:
        print("\n❌ No plan assigned to user")

# Test the calculate_matching_income function directly
print("\n" + "="*60)
print("Testing calculate_matching_income function")
print("="*60)

import sys
sys.path.insert(0, '/app/backend')

try:
    from server import calculate_matching_income
    
    user_id = str(test_user['_id'])
    print(f"\nCalling calculate_matching_income('{user_id}')...")
    
    # Get before state
    before = users_collection.find_one({"_id": ObjectId(user_id)})
    print(f"\nBefore: Left={before['leftPV']}, Right={before['rightPV']}, Total={before['totalPV']}")
    
    calculate_matching_income(user_id)
    
    # Get after state
    after = users_collection.find_one({"_id": ObjectId(user_id)})
    print(f"After:  Left={after['leftPV']}, Right={after['rightPV']}, Total={after['totalPV']}")
    
    if before['leftPV'] != after['leftPV'] or before['rightPV'] != after['rightPV']:
        print("\n✓ PV values changed - calculation ran!")
    else:
        print("\n❌ PV values unchanged - calculation didn't run")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
