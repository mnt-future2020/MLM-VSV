#!/usr/bin/env python3
"""
Comprehensive MLM Platform Backend API Testing
Tests all endpoints for VSV Unite MLM Platform as per review request
"""

import requests
import sys
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

class MLMAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.test_plan_id = None
        self.test_withdrawal_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.response_times = []

    def log_test(self, name: str, success: bool, details: str = "", response_time: float = 0.0):
        """Log test results with response time"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            time_str = f" ({response_time:.3f}s)" if response_time > 0 else ""
            print(f"✅ {name}{time_str}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append(f"{name}: {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    token: Optional[str] = None, expected_status: int = 200) -> tuple[bool, Dict, float]:
        """Make HTTP request and return success status, response data, and response time"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            start_time = time.time()
            
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            response_time = time.time() - start_time
            self.response_times.append(response_time)
            
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text, "status_code": response.status_code}

            return success, response_data, response_time

        except Exception as e:
            return False, {"error": str(e)}, 0.0

    def test_admin_login(self):
        """Test admin login - POST /api/auth/sign-in/email"""
        login_data = {
            "email": "admin@vsvunite.com",
            "password": "Admin@123"
        }
        
        success, data, response_time = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if success and data.get('token'):
            self.admin_token = data['token']
            self.log_test("POST /api/auth/sign-in/email (Admin)", True, response_time=response_time)
            return True
        else:
            self.log_test("POST /api/auth/sign-in/email (Admin)", False, f"Response: {data}")
            return False

    def test_user_login(self):
        """Test user login - POST /api/auth/sign-in/email"""
        login_data = {
            "email": "udhay@mntfuture.com",
            "password": "123456"
        }
        
        success, data, response_time = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if success and data.get('token'):
            self.user_token = data['token']
            self.log_test("POST /api/auth/sign-in/email (User)", True, response_time=response_time)
            return True
        else:
            self.log_test("POST /api/auth/sign-in/email (User)", False, f"Response: {data}")
            return False

    def test_user_registration(self):
        """Test user registration - POST /api/auth/register"""
        timestamp = datetime.now().strftime("%H%M%S")
        user_data = {
            "name": f"API Test User {timestamp}",
            "username": f"apitest{timestamp}",
            "email": f"apitest{timestamp}@example.com",
            "password": "Test@123",
            "mobile": f"98765{timestamp}",
            "referralId": "VSV00001",  # Admin's referral ID
            "placement": "LEFT"
        }
        
        success, data, response_time = self.make_request('POST', 'api/auth/register', user_data, expected_status=200)
        
        if success and data.get('token'):
            self.test_user_id = data['user']['id']
            self.log_test("POST /api/auth/register", True, response_time=response_time)
            return True
        else:
            self.log_test("POST /api/auth/register", False, f"Response: {data}")
            return False

    def test_get_session(self):
        """Test get session - GET /api/auth/get-session"""
        success, data, response_time = self.make_request('GET', 'api/auth/get-session')
        self.log_test("GET /api/auth/get-session", success, response_time=response_time)

    def test_sign_out(self):
        """Test sign out - POST /api/auth/sign-out"""
        success, data, response_time = self.make_request('POST', 'api/auth/sign-out')
        self.log_test("POST /api/auth/sign-out", success and data.get('success'), response_time=response_time)

    def test_referral_lookup(self):
        """Test referral ID lookup - POST /api/auth/lookup-referral"""
        lookup_data = {"referralId": "VSV00001"}
        
        success, data, response_time = self.make_request('POST', 'api/auth/lookup-referral', lookup_data)
        self.log_test("POST /api/auth/lookup-referral", success and data.get('success'), response_time=response_time)

    def test_get_plans(self):
        """Test get all plans"""
        success, data = self.make_request('GET', 'api/plans')
        
        if success and data.get('success') and data.get('data'):
            plans = data['data']
            if plans:
                self.test_plan_id = plans[0]['id']  # Store first plan ID for activation test
            self.log_test("Get Plans", True)
            return True
        else:
            self.log_test("Get Plans", False, f"Response: {data}")
            return False

    def test_user_profile(self):
        """Test get user profile - GET /api/user/profile"""
        if not self.user_token:
            self.log_test("GET /api/user/profile", False, "No user token")
            return False
            
        success, data, response_time = self.make_request('GET', 'api/user/profile', token=self.user_token)
        self.log_test("GET /api/user/profile", success and data.get('success'), response_time=response_time)

    def test_user_dashboard(self):
        """Test user dashboard - GET /api/user/dashboard"""
        if not self.user_token:
            self.log_test("GET /api/user/dashboard", False, "No user token")
            return False
            
        success, data, response_time = self.make_request('GET', 'api/user/dashboard', token=self.user_token)
        self.log_test("GET /api/user/dashboard", success and data.get('success'), response_time=response_time)

    def test_plan_activation(self):
        """Test plan activation"""
        if not self.user_token or not self.test_plan_id:
            self.log_test("Plan Activation", False, "Missing user token or plan ID")
            return False
            
        activation_data = {"planId": self.test_plan_id}
        success, data = self.make_request('POST', 'api/plans/activate', activation_data, 
                                        token=self.user_token)
        self.log_test("Plan Activation", success and data.get('success'))

    def test_wallet_balance(self):
        """Test wallet balance"""
        if not self.user_token:
            self.log_test("Wallet Balance", False, "No user token")
            return False
            
        success, data = self.make_request('GET', 'api/wallet/balance', token=self.user_token)
        self.log_test("Wallet Balance", success and data.get('success'))

    def test_transactions(self):
        """Test get transactions"""
        if not self.user_token:
            self.log_test("Get Transactions", False, "No user token")
            return False
            
        success, data = self.make_request('GET', 'api/wallet/transactions', token=self.user_token)
        self.log_test("Get Transactions", success and data.get('success'))

    def test_team_tree(self):
        """Test team tree - GET /api/user/team/tree"""
        if not self.user_token:
            self.log_test("GET /api/user/team/tree", False, "No user token")
            return False
            
        success, data, response_time = self.make_request('GET', 'api/user/team/tree', token=self.user_token)
        self.log_test("GET /api/user/team/tree", success and data.get('success'), response_time=response_time)

    def test_team_list(self):
        """Test team list - GET /api/user/team/list"""
        if not self.user_token:
            self.log_test("GET /api/user/team/list", False, "No user token")
            return False
            
        success, data, response_time = self.make_request('GET', 'api/user/team/list', token=self.user_token)
        self.log_test("GET /api/user/team/list", success and data.get('success'), response_time=response_time)

    def test_withdrawal_request(self):
        """Test withdrawal request"""
        if not self.user_token:
            self.log_test("Withdrawal Request", False, "No user token")
            return False
            
        withdrawal_data = {
            "amount": 100,
            "bankDetails": {
                "accountNumber": "1234567890",
                "ifscCode": "SBIN0001234",
                "accountHolderName": "Test User",
                "bankName": "State Bank of India"
            }
        }
        
        success, data = self.make_request('POST', 'api/withdrawal/request', withdrawal_data, 
                                        token=self.user_token)
        
        if success and data.get('success'):
            self.test_withdrawal_id = data.get('withdrawalId')
            self.log_test("Withdrawal Request", True)
        else:
            self.log_test("Withdrawal Request", False, f"Response: {data}")

    def test_withdrawal_history(self):
        """Test withdrawal history"""
        if not self.user_token:
            self.log_test("Withdrawal History", False, "No user token")
            return False
            
        success, data = self.make_request('GET', 'api/withdrawal/history', token=self.user_token)
        self.log_test("Withdrawal History", success and data.get('success'))

    def test_profile_update(self):
        """Test profile update"""
        if not self.user_token:
            self.log_test("Profile Update", False, "No user token")
            return False
            
        update_data = {
            "name": "Updated Test User",
            "mobile": "9876543210"
        }
        
        success, data = self.make_request('PUT', 'api/user/profile', update_data, 
                                        token=self.user_token)
        self.log_test("Profile Update", success and data.get('success'))

    def test_password_change(self):
        """Test password change"""
        if not self.user_token:
            self.log_test("Password Change", False, "No user token")
            return False
            
        password_data = {
            "oldPassword": "Test@123",
            "newPassword": "NewTest@123"
        }
        
        success, data = self.make_request('POST', 'api/user/change-password', password_data, 
                                        token=self.user_token)
        self.log_test("Password Change", success and data.get('success'))

    def test_admin_dashboard(self):
        """Test admin dashboard"""
        if not self.admin_token:
            self.log_test("Admin Dashboard", False, "No admin token")
            return False
            
        success, data = self.make_request('GET', 'api/admin/dashboard', token=self.admin_token)
        self.log_test("Admin Dashboard", success and data.get('success'))

    def test_admin_users(self):
        """Test admin get all users"""
        if not self.admin_token:
            self.log_test("Admin Users List", False, "No admin token")
            return False
            
        success, data = self.make_request('GET', 'api/admin/users', token=self.admin_token)
        self.log_test("Admin Users List", success and data.get('success'))

    def test_admin_withdrawals(self):
        """Test admin get all withdrawals"""
        if not self.admin_token:
            self.log_test("Admin Withdrawals List", False, "No admin token")
            return False
            
        success, data = self.make_request('GET', 'api/admin/withdrawals', token=self.admin_token)
        self.log_test("Admin Withdrawals List", success and data.get('success'))

    def test_admin_plans(self):
        """Test admin get all plans"""
        if not self.admin_token:
            self.log_test("Admin Plans List", False, "No admin token")
            return False
            
        success, data = self.make_request('GET', 'api/admin/plans', token=self.admin_token)
        self.log_test("Admin Plans List", success and data.get('success'))

    def test_user_status_update(self):
        """Test admin update user status"""
        if not self.admin_token or not self.test_user_id:
            self.log_test("User Status Update", False, "Missing admin token or user ID")
            return False
            
        status_data = {"isActive": False}
        success, data = self.make_request('PUT', f'api/admin/users/{self.test_user_id}/status', 
                                        status_data, token=self.admin_token)
        self.log_test("User Status Update", success and data.get('success'))

    def test_withdrawal_approval(self):
        """Test admin approve withdrawal"""
        if not self.admin_token or not self.test_withdrawal_id:
            self.log_test("Withdrawal Approval", False, "Missing admin token or withdrawal ID")
            return False
            
        success, data = self.make_request('PUT', f'api/admin/withdrawals/{self.test_withdrawal_id}/approve', 
                                        token=self.admin_token)
        self.log_test("Withdrawal Approval", success and data.get('success'))

    def test_settings_endpoints(self):
        """Test settings endpoints"""
        # Public settings
        success, data = self.make_request('GET', 'api/settings/public')
        self.log_test("Public Settings", success and data.get('success'))
        
        # All settings (no auth required for this test)
        success, data = self.make_request('GET', 'api/settings')
        self.log_test("All Settings", success and data.get('success'))

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting MLM Platform API Tests...")
        print("=" * 50)
        
        # Basic health check
        if not self.test_health_check():
            print("❌ Backend is not healthy, stopping tests")
            return False
        
        # Authentication tests
        print("\n📋 Authentication Tests:")
        self.test_admin_login()
        self.test_user_registration()
        self.test_user_login()
        self.test_referral_lookup()
        
        # User functionality tests
        print("\n👤 User Functionality Tests:")
        self.test_get_plans()
        self.test_user_profile()
        self.test_user_dashboard()
        self.test_plan_activation()
        self.test_wallet_balance()
        self.test_transactions()
        self.test_team_tree()
        self.test_team_list()
        self.test_withdrawal_request()
        self.test_withdrawal_history()
        self.test_profile_update()
        self.test_password_change()
        
        # Admin functionality tests
        print("\n🔧 Admin Functionality Tests:")
        self.test_admin_dashboard()
        self.test_admin_users()
        self.test_admin_withdrawals()
        self.test_admin_plans()
        self.test_user_status_update()
        self.test_withdrawal_approval()
        
        # Settings tests
        print("\n⚙️ Settings Tests:")
        self.test_settings_endpoints()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failed_test in self.failed_tests:
                print(f"  - {failed_test}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n✅ Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80  # Consider 80%+ success rate as passing

def main():
    """Main test execution"""
    tester = MLMAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())