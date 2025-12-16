import requests
import json
import os

BASE_URL = "http://localhost:8001/api"

def print_result(name, response):
    status = "✅" if response.status_code == 200 else "❌"
    print(f"{status} {name}: {response.status_code}")
    if response.status_code != 200:
        print(f"   Response: {response.text}")

def test_system():
    print("=== STARTING SYSTEM TEST ===")
    
    # 1. Login Admin
    print("\n[1] Testing Admin Login...")
    admin_creds = {
        "email": "admin@vsvunite.com",
        "password": "Admin@123"
    }
    
    # Try email login
    try:
        res = requests.post(f"{BASE_URL}/auth/sign-in/email", json=admin_creds)
        print_result("Admin Login", res)
        if res.status_code == 200:
            token = res.json()["token"]
            headers = {"Authorization": f"Bearer {token}"}
        else:
            print("CRITICAL: Admin login failed. Cannot proceed with admin tests.")
            return
    except Exception as e:
        print(f"CRITICAL: Server might be down. Error: {e}")
        return

    # 2. Test Get Plans (Caused 500 error)
    print("\n[2] Testing Get Plans...")
    res = requests.get(f"{BASE_URL}/plans")
    print_result("Get Plans", res)

    # 3. Test Get Admin Users (Caused 500 error)
    print("\n[3] Testing Get Admin Users...")
    res = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    print_result("Get Admin Users", res)

    # 4. Test Admin Earnings (Logic change)
    print("\n[4] Testing Admin Earnings...")
    res = requests.get(f"{BASE_URL}/admin/earnings", headers=headers)
    print_result("Get Admin Earnings", res)
    if res.status_code == 200:
        data = res.json()["data"]
        print(f"   Matching Income: {data.get('adminEarnings', {}).get('MATCHING_INCOME')}")
        print(f"   Referral Income: {data.get('adminEarnings', {}).get('REFERRAL_INCOME')}")

    # 5. Test Registration Limit (Logic change)
    print("\n[5] Testing Account Limit (Max 3)...")
    # Need a random mobile number 
    import random
    mobile = f"99{random.randint(10000000, 99999999)}"
    
    user_template = {
        "name": "Test User",
        "username": f"testuser_{mobile}",
        "password": "Password@123",
        "mobile": mobile,
        "email": f"test_{mobile}@example.com",
        "referralId": "VSV00001", # Admin
        "placement": "LEFT"
    }

    # Register 1
    user1 = user_template.copy()
    res = requests.post(f"{BASE_URL}/auth/register", json=user1)
    print_result("Register User 1", res)

    # Register 2
    user2 = user_template.copy()
    user2["username"] += "_2"
    user2["email"] = f"test2_{mobile}@example.com"
    res = requests.post(f"{BASE_URL}/auth/register", json=user2)
    print_result("Register User 2", res)

    # Register 3
    user3 = user_template.copy()
    user3["username"] += "_3"
    user3["email"] = f"test3_{mobile}@example.com"
    res = requests.post(f"{BASE_URL}/auth/register", json=user3)
    print_result("Register User 3", res)

    # Register 4 (Should Fail)
    user4 = user_template.copy()
    user4["username"] += "_4"
    user4["email"] = f"test4_{mobile}@example.com"
    res = requests.post(f"{BASE_URL}/auth/register", json=user4)
    print(f"   Expected 400 for User 4: {res.status_code}")
    if res.status_code == 400 and "Maximum 3 accounts" in res.text:
        print("✅ Account Limit Logic Works")
    else:
        print("❌ Account Limit Logic Failed")
        print(res.text)

    # 6. Test User Dashboard (New Stats)
    print("\n[6] Testing User Dashboard...")
    # Login as User 1
    user_creds = {
        "email": user1["email"],
        "password": user1["password"]
    }
    res = requests.post(f"{BASE_URL}/auth/sign-in/email", json=user_creds)
    if res.status_code == 200:
        user_token = res.json()["token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        
        res = requests.get(f"{BASE_URL}/user/dashboard", headers=user_headers)
        print_result("Get User Dashboard", res)
        if res.status_code == 200:
            data = res.json()["data"]["wallet"]
            print(f"   Referral Income: {data.get('referralIncome')}")
            if 'referralIncome' in data:
                 print("✅ Referral Income field exists (value should be 0 or small if new)")
    else:
        print("❌ Could not login as new user")

if __name__ == "__main__":
    test_system()
