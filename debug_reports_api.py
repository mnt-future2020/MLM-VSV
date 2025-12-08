#!/usr/bin/env python3
"""
Debug Reports API to understand the data structure
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
    print("🔍 Debugging Reports API")
    print("=" * 50)
    
    # Login as admin
    login_data = {"email": "admin@vsvunite.com", "password": "Admin@123"}
    success, data = make_request('POST', 'api/auth/sign-in/email', login_data)
    
    if not success:
        print("❌ Admin login failed")
        return
        
    admin_token = data['token']
    print("✅ Admin login successful")
    
    # Check if reports endpoint exists
    print("\n📊 Testing Reports Endpoints:")
    
    # Try different report endpoints
    endpoints = [
        'api/admin/reports/dashboard',
        'api/admin/reports', 
        'api/admin/dashboard'
    ]
    
    for endpoint in endpoints:
        print(f"\nTesting: {endpoint}")
        success, data = make_request('GET', endpoint, token=admin_token)
        
        if success:
            print(f"✅ {endpoint} - Success")
            print(f"Response keys: {list(data.keys())}")
            if 'data' in data:
                print(f"Data keys: {list(data['data'].keys()) if isinstance(data['data'], dict) else 'Not a dict'}")
        else:
            print(f"❌ {endpoint} - Failed: {data}")
    
    # Check admin dashboard specifically
    print(f"\n🔧 Admin Dashboard Details:")
    success, data = make_request('GET', 'api/admin/dashboard', token=admin_token)
    
    if success:
        dashboard_data = data.get('data', {})
        print(f"Dashboard data structure:")
        print(json.dumps(dashboard_data, indent=2, default=str))
    else:
        print(f"Failed to get dashboard: {data}")

if __name__ == "__main__":
    main()