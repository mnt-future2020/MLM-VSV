#!/usr/bin/env python3
"""
Check detailed reports API response
"""

import requests
import json

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
    print("🔍 Detailed Reports API Analysis")
    print("=" * 50)
    
    # Login as admin
    login_data = {"email": "admin@vsvunite.com", "password": "Admin@123"}
    success, data = make_request('POST', 'api/auth/sign-in/email', login_data)
    
    if not success:
        print("❌ Admin login failed")
        return
        
    admin_token = data['token']
    print("✅ Admin login successful")
    
    # Get reports/dashboard
    print(f"\n📊 Reports Dashboard API:")
    success, data = make_request('GET', 'api/admin/reports/dashboard', token=admin_token)
    
    if success:
        print("✅ Reports API Success")
        reports_data = data.get('data', {})
        print(f"Full reports response:")
        print(json.dumps(reports_data, indent=2, default=str))
    else:
        print(f"❌ Reports API Failed: {data}")
    
    # Compare with admin dashboard
    print(f"\n🔧 Admin Dashboard API:")
    success, data = make_request('GET', 'api/admin/dashboard', token=admin_token)
    
    if success:
        print("✅ Admin Dashboard Success")
        dashboard_data = data.get('data', {})
        
        print(f"\nUser counts:")
        print(f"  Total: {dashboard_data.get('users', {}).get('total', 0)}")
        print(f"  Active: {dashboard_data.get('users', {}).get('active', 0)}")
        
        print(f"\nPlan distribution:")
        plan_dist = dashboard_data.get('planDistribution', {})
        for plan, count in plan_dist.items():
            print(f"  {plan}: {count}")
            
        print(f"\nEarnings:")
        earnings = dashboard_data.get('earnings', {})
        print(f"  Total Earnings: ₹{earnings.get('totalEarnings', 0)}")
        print(f"  Total Balance: ₹{earnings.get('totalBalance', 0)}")
    else:
        print(f"❌ Admin Dashboard Failed: {data}")

if __name__ == "__main__":
    main()