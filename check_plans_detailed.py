#!/usr/bin/env python3
"""
Check Plans in Detail
"""

import requests
import json

def check_plans():
    base_url = "http://localhost:8001"
    
    # Get plans without authentication
    response = requests.get(f"{base_url}/api/plans")
    if response.status_code == 200:
        data = response.json()
        plans = data.get('data', [])
        
        print("📋 DETAILED PLANS ANALYSIS")
        print("=" * 50)
        
        for plan in plans:
            print(f"\n🔹 Plan: {plan.get('name', 'Unknown')}")
            print(f"   ID: {plan.get('id', 'N/A')}")
            print(f"   Amount: ₹{plan.get('amount', 0)}")
            print(f"   PV: {plan.get('pv', 0)}")
            print(f"   Referral Income: {plan.get('referralIncome', 0)}")
            print(f"   Daily Capping: ₹{plan.get('dailyCapping', 0)}")
            print(f"   Matching Income: {plan.get('matchingIncome', 0)}")
            print(f"   Active: {plan.get('isActive', False)}")
            
            # Show all fields
            print(f"   All fields: {list(plan.keys())}")
    else:
        print(f"❌ Failed to get plans: {response.status_code}")

if __name__ == "__main__":
    check_plans()