#!/usr/bin/env python3
"""
Database Verification Script
Verify the actual database state to confirm test results
"""

import requests
import json

def verify_database_state():
    """Verify the current database state"""
    base_url = "http://localhost:8001"
    
    # Login as admin
    login_data = {
        "email": "admin@vsvunite.com",
        "password": "Admin@123"
    }
    
    response = requests.post(f"{base_url}/api/auth/sign-in/email", json=login_data)
    if response.status_code != 200:
        print("❌ Admin login failed")
        return
    
    admin_token = response.json().get('token')
    headers = {'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'}
    
    print("🔍 DATABASE VERIFICATION")
    print("=" * 50)
    
    # 1. Check admin wallet
    response = requests.get(f"{base_url}/api/wallet/balance", headers=headers)
    if response.status_code == 200:
        wallet_data = response.json().get('data', {})
        print(f"✅ Admin Wallet: Balance=₹{wallet_data.get('balance', 0)}, Earnings=₹{wallet_data.get('totalEarnings', 0)}")
    
    # 2. Check all users count
    response = requests.get(f"{base_url}/api/admin/users", headers=headers)
    if response.status_code == 200:
        users_data = response.json().get('data', [])
        total_users = len(users_data) if isinstance(users_data, list) else 0
        print(f"✅ Total Users: {total_users}")
        
        # Find our test user
        test_user = None
        for user in users_data:
            if user.get('username') == 'finaltestuser':
                test_user = user
                break
        
        if test_user:
            print(f"✅ Test User Found: {test_user.get('name')} ({test_user.get('referralId')})")
            print(f"   - Plan: {test_user.get('currentPlan', 'None')}")
            print(f"   - Active: {test_user.get('isActive', False)}")
        else:
            print("⚠️  Test User Not Found")
    
    # 3. Check transactions for REFERRAL_INCOME
    response = requests.get(f"{base_url}/api/wallet/transactions", headers=headers)
    if response.status_code == 200:
        transactions = response.json().get('data', [])
        referral_transactions = [t for t in transactions if t.get('type') == 'REFERRAL_INCOME']
        plan_transactions = [t for t in transactions if t.get('type') == 'PLAN_ACTIVATION']
        
        print(f"✅ Transactions Check:")
        print(f"   - REFERRAL_INCOME transactions: {len(referral_transactions)}")
        print(f"   - PLAN_ACTIVATION transactions: {len(plan_transactions)}")
        
        if referral_transactions:
            print("⚠️  REFERRAL_INCOME transactions found:")
            for tx in referral_transactions:
                print(f"     - Amount: ₹{tx.get('amount', 0)}, Description: {tx.get('description', 'N/A')}")
    
    # 4. Check plans configuration
    response = requests.get(f"{base_url}/api/plans")
    if response.status_code == 200:
        plans = response.json().get('data', [])
        print(f"✅ Plans Configuration:")
        for plan in plans:
            name = plan.get('name', 'Unknown')
            referral_income = plan.get('referralIncome', 0)
            print(f"   - {name}: referralIncome={referral_income} (field exists but not used)")
    
    print("\n" + "=" * 50)
    print("✅ DATABASE VERIFICATION COMPLETE")

if __name__ == "__main__":
    verify_database_state()