#!/usr/bin/env python3
"""
Test Binary MLM Formula - Exact User Specification
Tests the Day 1, Day 2 scenario provided by the user
"""

from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone, timedelta
import os

client = MongoClient(os.getenv('MONGO_URL', 'mongodb://localhost:27017'))
db = client['mlm_vsv_unite']

def reset_admin_for_test():
    """Reset admin to initial state for testing"""
    admin = db.users.find_one({'referralId': 'VSV00001'})
    
    # Set initial PV values as per user's example
    # Day 1: A=30 PV (left), B=40 PV (right)
    db.users.update_one(
        {'_id': admin['_id']},
        {
            '$set': {
                'leftPV': 30,
                'rightPV': 40,
                'totalPV': 0,
                'dailyPVUsed': 0,
                'lastMatchingDate': None,
                'currentPlan': db.plans.find_one({'name': 'Basic'})['_id']  # Basic has 10 PV daily limit (250/25)
            }
        }
    )
    
    # Reset wallet
    db.wallets.update_one(
        {'userId': str(admin['_id'])},
        {
            '$set': {
                'balance': 0,
                'totalEarnings': 0
            }
        }
    )
    
    print("✅ Reset admin to initial state:")
    print(f"  Left PV: 30")
    print(f"  Right PV: 40")
    print(f"  Plan: Basic (Daily Capping: ₹250 = 10 PV/day)")

def calculate_matching_income(user_id_str, day_num=1):
    """
    Calculate matching income following user's exact formula
    """
    print(f"\n{'=' * 80}")
    print(f"DAY {day_num} CALCULATION")
    print(f"{'=' * 80}")
    
    user = db.users.find_one({"_id": ObjectId(user_id_str)})
    if not user or not user.get("currentPlan"):
        print("❌ User has no plan")
        return None
    
    # Get current PV
    left_pv = user.get("leftPV", 0)
    right_pv = user.get("rightPV", 0)
    
    print(f"\n📊 Current PV:")
    print(f"  Left: {left_pv}")
    print(f"  Right: {right_pv}")
    
    if left_pv == 0 or right_pv == 0:
        print(f"\n❌ Cannot match - one side is 0")
        print(f"  Earnings = ₹0")
        print(f"  Today PV = 0")
        print(f"  Carry Forward: Left {left_pv}, Right {right_pv}")
        return {
            'income': 0,
            'today_pv': 0,
            'carry_left': left_pv,
            'carry_right': right_pv
        }
    
    # Get plan
    plan = db.plans.find_one({"_id": ObjectId(user["currentPlan"])})
    daily_capping = plan.get("dailyCapping", 500)
    matching_rate = 25
    
    # Calculate matching PV = min(leftPV, rightPV)
    matched_pv = min(left_pv, right_pv)
    print(f"\n📐 Matching PV = min({left_pv}, {right_pv}) = {matched_pv}")
    
    # Check daily limit
    today_date = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    last_matching_date = user.get("lastMatchingDate")
    
    if not last_matching_date or last_matching_date.replace(hour=0, minute=0, second=0, microsecond=0) != today_date:
        daily_pv_used = 0
    else:
        daily_pv_used = user.get("dailyPVUsed", 0)
    
    max_pv_per_day = daily_capping // matching_rate
    remaining_pv = max_pv_per_day - daily_pv_used
    
    print(f"\n⏰ Daily Limit:")
    print(f"  Plan Limit: {max_pv_per_day} PV/day (₹{daily_capping} / ₹{matching_rate})")
    print(f"  Already Used: {daily_pv_used} PV")
    print(f"  Remaining: {remaining_pv} PV")
    
    if remaining_pv <= 0:
        print(f"\n❌ Daily limit reached!")
        return None
    
    # Today's PV = min(matched_pv, remaining_pv_today)
    today_pv = min(matched_pv, remaining_pv)
    income = today_pv * matching_rate
    
    print(f"\n💰 Today's Calculation:")
    print(f"  Today PV = min({matched_pv}, {remaining_pv}) = {today_pv}")
    print(f"  Earnings = {today_pv} × ₹{matching_rate} = ₹{income}")
    
    # Update wallet
    db.wallets.update_one(
        {"userId": user_id_str},
        {
            "$inc": {
                "balance": income,
                "totalEarnings": income
            },
            "$set": {"updatedAt": datetime.now(timezone.utc)}
        }
    )
    
    # Carry forward calculation
    new_left = left_pv - today_pv
    new_right = right_pv - today_pv
    new_total_pv = user.get("totalPV", 0) + today_pv
    
    print(f"\n📦 Carry Forward:")
    print(f"  Left: {left_pv} - {today_pv} = {new_left}")
    print(f"  Right: {right_pv} - {today_pv} = {new_right}")
    print(f"  Total PV (lifetime): {user.get('totalPV', 0)} + {today_pv} = {new_total_pv}")
    
    # Update user PV
    db.users.update_one(
        {"_id": ObjectId(user_id_str)},
        {
            "$set": {
                "leftPV": new_left,
                "rightPV": new_right,
                "totalPV": new_total_pv,
                "lastMatchingDate": today_date,
                "dailyPVUsed": daily_pv_used + today_pv,
                "updatedAt": datetime.now(timezone.utc)
            }
        }
    )
    
    # Create transaction
    db.transactions.insert_one({
        "userId": user_id_str,
        "type": "MATCHING_INCOME",
        "amount": income,
        "description": f"Day {day_num} matching - {today_pv} PV @ ₹{matching_rate}/PV",
        "pv": today_pv,
        "status": "COMPLETED",
        "createdAt": datetime.now(timezone.utc)
    })
    
    return {
        'income': income,
        'today_pv': today_pv,
        'carry_left': new_left,
        'carry_right': new_right,
        'total_pv': new_total_pv
    }

def test_user_scenario():
    """
    Test user's exact scenario:
    Day 1: A=30 PV (left), B=40 PV (right), Plan limit = 10 PV
    Day 2: C joins with 10 PV on right
    """
    print("\n" + "="*80)
    print("TESTING USER'S EXACT SCENARIO")
    print("="*80)
    
    # Reset admin
    reset_admin_for_test()
    
    admin = db.users.find_one({'referralId': 'VSV00001'})
    admin_id = str(admin['_id'])
    
    # DAY 1
    result1 = calculate_matching_income(admin_id, day_num=1)
    
    if result1:
        print(f"\n✅ DAY 1 RESULTS:")
        print(f"  Income: ₹{result1['income']}")
        print(f"  Today PV: {result1['today_pv']}")
        print(f"  Carry Forward: Left {result1['carry_left']}, Right {result1['carry_right']}")
        print(f"  Total PV (lifetime): {result1['total_pv']}")
        
        # Verify against user's expected values
        expected_matching = 30  # min(30, 40)
        expected_today_pv = 10  # limited by plan
        expected_income = 250  # 10 × 25
        expected_carry_left = 20  # 30 - 10
        expected_carry_right = 30  # 40 - 10
        
        print(f"\n📊 VERIFICATION:")
        print(f"  Expected: Today PV={expected_today_pv}, Income=₹{expected_income}")
        print(f"  Actual: Today PV={result1['today_pv']}, Income=₹{result1['income']}")
        print(f"  Expected Carry: Left={expected_carry_left}, Right={expected_carry_right}")
        print(f"  Actual Carry: Left={result1['carry_left']}, Right={result1['carry_right']}")
        
        if (result1['today_pv'] == expected_today_pv and 
            result1['income'] == expected_income and
            result1['carry_left'] == expected_carry_left and
            result1['carry_right'] == expected_carry_right):
            print(f"  ✅ DAY 1 CALCULATION CORRECT!")
        else:
            print(f"  ❌ DAY 1 CALCULATION MISMATCH!")
    
    # DAY 2 - Add new PV on right
    print(f"\n\n{'='*80}")
    print(f"DAY 2 - C joins with 10 PV on RIGHT")
    print(f"{'='*80}")
    
    # Add 10 PV to right side (simulating C joining under B)
    db.users.update_one(
        {'_id': admin['_id']},
        {
            '$inc': {'rightPV': 10}
        }
    )
    
    print(f"✅ Added 10 PV to admin's RIGHT")
    
    # Simulate next day
    db.users.update_one(
        {'_id': admin['_id']},
        {
            '$set': {
                'lastMatchingDate': datetime.now(timezone.utc) - timedelta(days=1),
                'dailyPVUsed': 0
            }
        }
    )
    
    result2 = calculate_matching_income(admin_id, day_num=2)
    
    if result2:
        print(f"\n✅ DAY 2 RESULTS:")
        print(f"  Income: ₹{result2['income']}")
        print(f"  Today PV: {result2['today_pv']}")
        print(f"  Carry Forward: Left {result2['carry_left']}, Right {result2['carry_right']}")
        print(f"  Total PV (lifetime): {result2['total_pv']}")
        
        # Verify
        # Previous carry: Left=20, Right=30
        # New PV: Right +10 = 40
        # Current: Left=20, Right=40
        # Matching = 20
        # Plan limit = 10
        # Today PV = 10
        # Income = 250
        # Carry: Left=10, Right=30
        
        expected_income = 250
        expected_today_pv = 10
        expected_carry_left = 10
        expected_carry_right = 30
        
        print(f"\n📊 VERIFICATION:")
        print(f"  Expected: Today PV={expected_today_pv}, Income=₹{expected_income}")
        print(f"  Actual: Today PV={result2['today_pv']}, Income=₹{result2['income']}")
        print(f"  Expected Carry: Left={expected_carry_left}, Right={expected_carry_right}")
        print(f"  Actual Carry: Left={result2['carry_left']}, Right={result2['carry_right']}")
        
        if (result2['today_pv'] == expected_today_pv and 
            result2['income'] == expected_income and
            result2['carry_left'] == expected_carry_left and
            result2['carry_right'] == expected_carry_right):
            print(f"  ✅ DAY 2 CALCULATION CORRECT!")
        else:
            print(f"  ❌ DAY 2 CALCULATION MISMATCH!")
    
    # Final summary
    print(f"\n\n{'='*80}")
    print(f"FINAL SUMMARY")
    print(f"{'='*80}")
    
    if result1 and result2:
        total_income = result1['income'] + result2['income']
        total_pv_earned = result2['total_pv']
        
        print(f"\n💰 Total Earnings: ₹{total_income}")
        print(f"📊 Total PV (lifetime): {total_pv_earned}")
        print(f"📦 Final Carry Forward: Left {result2['carry_left']}, Right {result2['carry_right']}")
        
        # Verify wallet
        wallet = db.wallets.find_one({'userId': admin_id})
        print(f"\n💳 Wallet Balance: ₹{wallet.get('balance', 0)}")
        print(f"📈 Total Wallet Earnings: ₹{wallet.get('totalEarnings', 0)}")
        
        print(f"\n✅ BINARY MLM CALCULATION TEST COMPLETE!")

if __name__ == "__main__":
    test_user_scenario()
