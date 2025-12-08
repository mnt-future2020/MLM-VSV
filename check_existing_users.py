#!/usr/bin/env python3
"""
Check existing users and binary tree structure
"""

import requests
import json
from datetime import datetime

def make_request(method: str, endpoint: str, data=None, token=None):
    """Make HTTP request"""
    url = f"http://localhost:8001/{endpoint}"
    headers = {'Content-Type': 'application/json'}
    
    if token:
        headers['Authorization'] = f'Bearer {token}'

    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers)
            
        return response.status_code < 400, response.json()
    except Exception as e:
        return False, {"error": str(e)}

def main():
    print("🔍 Checking Existing Users and Binary Tree Structure")
    print("=" * 60)
    
    # Login as admin
    login_data = {"email": "admin@vsvunite.com", "password": "Admin@123"}
    success, data = make_request('POST', 'api/auth/sign-in/email', login_data)
    
    if not success:
        print("❌ Admin login failed")
        return
        
    admin_token = data['token']
    print("✅ Admin login successful")
    
    # Get all users
    print("\n👥 All Users in System:")
    success, data = make_request('GET', 'api/admin/users', token=admin_token)
    
    if success:
        users = data.get('data', [])
        print(f"Total Users: {len(users)}")
        
        for user in users:
            print(f"  - {user.get('name')} ({user.get('referralId')}) - Plan: {user.get('currentPlan', 'None')} - Role: {user.get('role', 'user')}")
    
    # Get binary tree structure
    print("\n🌳 Binary Tree Structure:")
    success, data = make_request('GET', 'api/user/team/tree', token=admin_token)
    
    if success:
        tree_data = data.get('data')
        print_tree(tree_data, 0)
        
        # Print PV values
        print(f"\n💰 Admin PV Values:")
        print(f"  Left PV: {tree_data.get('leftPV', 0)}")
        print(f"  Right PV: {tree_data.get('rightPV', 0)}")
        print(f"  Total PV: {tree_data.get('totalPV', 0)}")
    
    # Get admin wallet
    print("\n💵 Admin Wallet:")
    success, data = make_request('GET', 'api/wallet/balance', token=admin_token)
    
    if success:
        wallet = data.get('data', {})
        print(f"  Balance: ₹{wallet.get('balance', 0)}")
        print(f"  Total Earnings: ₹{wallet.get('totalEarnings', 0)}")
        print(f"  Total Withdrawals: ₹{wallet.get('totalWithdrawals', 0)}")

def print_tree(node, level):
    """Print tree structure recursively"""
    if not node:
        return
        
    indent = "  " * level
    name = node.get('name', 'Unknown')
    referral_id = node.get('referralId', 'N/A')
    plan = node.get('currentPlan', 'None')
    left_pv = node.get('leftPV', 0)
    right_pv = node.get('rightPV', 0)
    
    print(f"{indent}├─ {name} ({referral_id}) - Plan: {plan} - PV: L={left_pv}, R={right_pv}")
    
    if node.get('left'):
        print(f"{indent}│  LEFT:")
        print_tree(node['left'], level + 2)
    
    if node.get('right'):
        print(f"{indent}│  RIGHT:")
        print_tree(node['right'], level + 2)

if __name__ == "__main__":
    main()