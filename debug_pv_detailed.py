"""Detailed debug of PV calculation with print statements"""
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
wallets_collection = db['wallets']

IST = pytz.timezone('Asia/Kolkata')

def get_ist_now():
    return datetime.now(IST)

def calculate_matching_income_debug(user_id: str):
    """Debug version with prints"""
    try:
        print(f"\n1. Looking for user {user_id}...")
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            print("   ❌ User not found!")
            return
        print(f"   ✓ User found: {user.get('name')}")
        
        if not user.get("currentPlan"):
            print("   ❌ No current plan!")
            return
        print(f"   ✓ Current plan: {user.get('currentPlan')}")
        
        # Get user's current PV
        left_pv = user.get("leftPV", 0)
        right_pv = user.get("rightPV", 0)
        print(f"\n2. PV values: Left={left_pv}, Right={right_pv}")
        
        # No matching possible if any side is 0
        if left_pv == 0 or right_pv == 0:
            print("   ❌ One side is 0, no matching possible")
            return
        print("   ✓ Both sides have PV")
        
        # Get plan details
        print(f"\n3. Looking for plan {user['currentPlan']}...")
        plan = plans_collection.find_one({"_id": ObjectId(user["currentPlan"])})
        if not plan:
            print("   ❌ Plan not found!")
            return
        print(f"   ✓ Plan found: {plan.get('name')}")
        print(f"      Daily Capping: ₹{plan.get('dailyCapping', 500)}")
        
        daily_capping = plan.get("dailyCapping", 500)
        matching_income_rate = 25
        
        # Calculate matching PV
        matched_pv = min(left_pv, right_pv)
        print(f"\n4. Matched PV: min({left_pv}, {right_pv}) = {matched_pv}")
        
        # Check daily capping
        today_date = get_ist_now().replace(hour=0, minute=0, second=0, microsecond=0)
        last_matching_date = user.get("lastMatchingDate")
        
        print(f"\n5. Date check:")
        print(f"   Today: {today_date}")
        print(f"   Last matching: {last_matching_date}")
        
        # Reset daily PV if new day
        if not last_matching_date:
            daily_pv_used = 0
            print("   ✓ No previous matching date, starting fresh (daily_pv_used=0)")
        else:
            last_date_normalized = last_matching_date.replace(hour=0, minute=0, second=0, microsecond=0)
            print(f"   Last date normalized: {last_date_normalized}")
            if last_date_normalized != today_date:
                daily_pv_used = 0
                print("   ✓ New day, resetting (daily_pv_used=0)")
            else:
                daily_pv_used = user.get("dailyPVUsed", 0)
                print(f"   Same day, using existing dailyPVUsed={daily_pv_used}")
        
        # Calculate maximum PV allowed today
        max_pv_per_day = daily_capping // matching_income_rate
        remaining_pv_today = max_pv_per_day - daily_pv_used
        
        print(f"\n6. Daily capping check:")
        print(f"   Max PV per day: {daily_capping} / {matching_income_rate} = {max_pv_per_day}")
        print(f"   Daily PV used: {daily_pv_used}")
        print(f"   Remaining today: {max_pv_per_day} - {daily_pv_used} = {remaining_pv_today}")
        
        if remaining_pv_today <= 0:
            print("   ❌ Daily limit reached! Exiting...")
            return
        print("   ✓ Still have capacity")
        
        # Today's PV
        today_pv = min(matched_pv, remaining_pv_today)
        print(f"\n7. Today's PV: min({matched_pv}, {remaining_pv_today}) = {today_pv}")
        
        if today_pv <= 0:
            print("   ❌ Today PV is 0! Exiting...")
            return
        print("   ✓ Today PV is positive")
        
        # Calculate income
        income = today_pv * matching_income_rate
        print(f"\n8. Income: {today_pv} × {matching_income_rate} = ₹{income}")
        
        # Update wallet
        print(f"\n9. Updating wallet...")
        result = wallets_collection.update_one(
            {"userId": user_id},
            {
                "$inc": {
                    "balance": income,
                    "totalEarnings": income
                },
                "$set": {"updatedAt": get_ist_now()}
            }
        )
        print(f"   Modified: {result.modified_count}")
        
        # Update user PV
        print(f"\n10. Updating user PV:")
        print(f"    Left PV: {left_pv} - {matched_pv} = {left_pv - matched_pv}")
        print(f"    Right PV: {right_pv} - {matched_pv} = {right_pv - matched_pv}")
        print(f"    Total PV: {user.get('totalPV', 0)} + {matched_pv} = {user.get('totalPV', 0) + matched_pv}")
        print(f"    Daily PV Used: {daily_pv_used} + {today_pv} = {daily_pv_used + today_pv}")
        
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$inc": {
                    "leftPV": -matched_pv,
                    "rightPV": -matched_pv,
                    "totalPV": matched_pv
                },
                "$set": {
                    "lastMatchingDate": today_date,
                    "dailyPVUsed": daily_pv_used + today_pv,
                    "updatedAt": get_ist_now()
                }
            }
        )
        print(f"   Modified: {result.modified_count}")
        
        print(f"\n✅ Calculation complete!")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

# Find test user
test_user = users_collection.find_one({"referralId": "TEST001"})
if test_user:
    print("="*60)
    print("DEBUGGING PV CALCULATION")
    print("="*60)
    calculate_matching_income_debug(str(test_user['_id']))
    
    # Show final state
    print("\n" + "="*60)
    print("FINAL STATE")
    print("="*60)
    final_user = users_collection.find_one({"_id": test_user['_id']})
    print(f"Left PV: {final_user['leftPV']}")
    print(f"Right PV: {final_user['rightPV']}")
    print(f"Total PV: {final_user['totalPV']}")
    print(f"Daily PV Used: {final_user.get('dailyPVUsed', 0)}")
else:
    print("Test user not found!")
