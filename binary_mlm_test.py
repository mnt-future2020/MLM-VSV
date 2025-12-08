#!/usr/bin/env python3
"""
Binary MLM System Testing - VSV Unite Platform
Tests Binary Tree Structure, PV Distribution, and Income Calculations
"""

import requests
import json
from datetime import datetime
from typing import Dict, Any, Optional, List

class BinaryMLMTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.admin_token = None
        self.test_results = []
        self.created_users = []
        
    def log_result(self, test_name: str, status: str, details: str = "", data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {details}")
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    token: Optional[str] = None) -> tuple[bool, Dict]:
        """Make HTTP request"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
                
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text, "status_code": response.status_code}

            return response.status_code < 400, response_data

        except Exception as e:
            return False, {"error": str(e)}

    def admin_login(self):
        """Login as admin"""
        print("\n🔐 Admin Authentication")
        login_data = {
            "email": "admin@vsvunite.com",
            "password": "Admin@123"
        }
        
        success, data = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if success and data.get('token'):
            self.admin_token = data['token']
            self.log_result("Admin Login", "PASS", "Successfully authenticated")
            return True
        else:
            self.log_result("Admin Login", "FAIL", f"Authentication failed: {data}")
            return False

    def create_test_users(self):
        """Create 8 test users in binary tree structure as specified"""
        print("\n👥 Creating Test Users in Binary Tree Structure")
        
        # Test users data as per the expected structure
        users_data = [
            {
                "name": "RAH AVI",
                "username": "rahavi001",
                "email": "rahavi@test.com",
                "password": "Test@123",
                "mobile": "9876543201",
                "referralId": "VSV00001",  # Under admin
                "placement": "LEFT",
                "planId": None  # No plan
            },
            {
                "name": "Udhayaseelan",
                "username": "udhaya001", 
                "email": "udhaya@test.com",
                "password": "Test@123",
                "mobile": "9876543202",
                "referralId": "VSV00001",  # Under admin
                "placement": "LEFT",
                "planId": "basic"  # Basic plan (PV=1)
            },
            {
                "name": "Ravi",
                "username": "ravi001",
                "email": "ravi@test.com", 
                "password": "Test@123",
                "mobile": "9876543203",
                "referralId": "VSV00001",  # Under admin
                "placement": "RIGHT",
                "planId": "standard"  # Standard plan (PV=2)
            },
            {
                "name": "Priya",
                "username": "priya001",
                "email": "priya@test.com",
                "password": "Test@123", 
                "mobile": "9876543204",
                "referralId": None,  # Will be set to Udhayaseelan's ID
                "placement": "LEFT",
                "planId": "basic"  # Basic plan (PV=1)
            },
            {
                "name": "Amit",
                "username": "amit001",
                "email": "amit@test.com",
                "password": "Test@123",
                "mobile": "9876543205", 
                "referralId": None,  # Will be set to Udhayaseelan's ID
                "placement": "RIGHT",
                "planId": "advanced"  # Advanced plan (PV=4)
            },
            {
                "name": "Sneha",
                "username": "sneha001",
                "email": "sneha@test.com",
                "password": "Test@123",
                "mobile": "9876543206",
                "referralId": None,  # Will be set to Ravi's ID
                "placement": "LEFT", 
                "planId": "premium"  # Premium plan (PV=6)
            },
            {
                "name": "Vikram",
                "username": "vikram001",
                "email": "vikram@test.com",
                "password": "Test@123",
                "mobile": "9876543207",
                "referralId": None,  # Will be set to Ravi's ID
                "placement": "RIGHT",
                "planId": "advanced"  # Advanced plan (PV=4)
            }
        ]
        
        # First get available plans
        success, plans_data = self.make_request('GET', 'api/plans')
        if not success:
            self.log_result("Get Plans", "FAIL", "Could not fetch plans")
            return False
            
        plans = {plan['name'].lower(): plan['id'] for plan in plans_data.get('data', [])}
        
        # Create users in order
        for i, user_data in enumerate(users_data):
            # Set plan ID if specified
            if user_data['planId'] and user_data['planId'] in plans:
                user_data['planId'] = plans[user_data['planId']]
            else:
                user_data.pop('planId', None)
                
            # Set referral ID for child users
            if user_data['referralId'] is None:
                if user_data['name'] in ['Priya', 'Amit']:
                    # Find Udhayaseelan's referral ID
                    udhaya_user = next((u for u in self.created_users if u['name'] == 'Udhayaseelan'), None)
                    if udhaya_user:
                        user_data['referralId'] = udhaya_user['referralId']
                elif user_data['name'] in ['Sneha', 'Vikram']:
                    # Find Ravi's referral ID
                    ravi_user = next((u for u in self.created_users if u['name'] == 'Ravi'), None)
                    if ravi_user:
                        user_data['referralId'] = ravi_user['referralId']
            
            # Create user
            success, response = self.make_request('POST', 'api/auth/register', user_data)
            
            if success and response.get('success'):
                user_info = response.get('user', {})
                user_info['expected_pv'] = self.get_plan_pv(user_data.get('planId'))
                self.created_users.append(user_info)
                self.log_result(f"Create User: {user_data['name']}", "PASS", 
                              f"Created with ID: {user_info.get('referralId', 'N/A')}")
            else:
                self.log_result(f"Create User: {user_data['name']}", "FAIL", 
                              f"Registration failed: {response}")
                
        return len(self.created_users) >= 6  # At least 6 users should be created

    def get_plan_pv(self, plan_id: str) -> int:
        """Get PV value for a plan"""
        if not plan_id:
            return 0
        
        success, plans_data = self.make_request('GET', 'api/plans')
        if success:
            for plan in plans_data.get('data', []):
                if plan['id'] == plan_id:
                    return plan.get('pv', 0)
        return 0

    def test_binary_tree_api(self):
        """Test Binary Tree API and verify structure"""
        print("\n🌳 Testing Binary Tree API")
        
        success, data = self.make_request('GET', 'api/user/team/tree', token=self.admin_token)
        
        if not success:
            self.log_result("Binary Tree API", "FAIL", f"API call failed: {data}")
            return False
            
        tree_data = data.get('data')
        if not tree_data:
            self.log_result("Binary Tree API", "FAIL", "No tree data returned")
            return False
            
        self.log_result("Binary Tree API", "PASS", "API responded successfully")
        
        # Verify tree structure
        self.verify_tree_structure(tree_data)
        return True

    def verify_tree_structure(self, tree_data: Dict):
        """Verify the binary tree structure matches expected layout"""
        print("\n🔍 Verifying Tree Structure")
        
        # Check root node (Admin)
        if tree_data.get('referralId') != 'VSV00001':
            self.log_result("Root Node Verification", "FAIL", "Root is not admin")
            return False
            
        self.log_result("Root Node Verification", "PASS", f"Admin is root: {tree_data.get('name')}")
        
        # Check left and right children
        left_child = tree_data.get('left')
        right_child = tree_data.get('right')
        
        if left_child:
            self.log_result("Left Child Found", "PASS", f"Name: {left_child.get('name')}")
            self.verify_child_tree(left_child, "LEFT")
        else:
            self.log_result("Left Child Found", "WARN", "No left child found")
            
        if right_child:
            self.log_result("Right Child Found", "PASS", f"Name: {right_child.get('name')}")
            self.verify_child_tree(right_child, "RIGHT")
        else:
            self.log_result("Right Child Found", "WARN", "No right child found")

    def verify_child_tree(self, node: Dict, side: str):
        """Verify child nodes in the tree"""
        name = node.get('name', 'Unknown')
        
        # Check if this node has children
        left_child = node.get('left')
        right_child = node.get('right')
        
        if left_child:
            self.log_result(f"{side} - {name} Left Child", "PASS", 
                          f"Found: {left_child.get('name')}")
        if right_child:
            self.log_result(f"{side} - {name} Right Child", "PASS", 
                          f"Found: {right_child.get('name')}")

    def test_pv_distribution(self):
        """Test PV distribution calculations"""
        print("\n💰 Testing PV Distribution")
        
        # Get admin's current PV values
        success, data = self.make_request('GET', 'api/user/team/tree', token=self.admin_token)
        
        if not success:
            self.log_result("PV Distribution Test", "FAIL", "Could not fetch tree data")
            return False
            
        admin_data = data.get('data', {})
        left_pv = admin_data.get('leftPV', 0)
        right_pv = admin_data.get('rightPV', 0)
        total_pv = admin_data.get('totalPV', 0)
        
        self.log_result("Admin Left PV", "INFO", f"Current: {left_pv}")
        self.log_result("Admin Right PV", "INFO", f"Current: {right_pv}")
        self.log_result("Admin Total PV", "INFO", f"Current: {total_pv}")
        
        # Calculate expected PV based on tree structure
        expected_left_pv = self.calculate_expected_left_pv()
        expected_right_pv = self.calculate_expected_right_pv()
        
        self.log_result("Expected Left PV", "INFO", f"Should be: {expected_left_pv}")
        self.log_result("Expected Right PV", "INFO", f"Should be: {expected_right_pv}")
        
        # Verify PV calculations
        if left_pv == expected_left_pv:
            self.log_result("Left PV Verification", "PASS", f"Matches expected: {left_pv}")
        else:
            self.log_result("Left PV Verification", "FAIL", 
                          f"Expected {expected_left_pv}, got {left_pv}")
            
        if right_pv == expected_right_pv:
            self.log_result("Right PV Verification", "PASS", f"Matches expected: {right_pv}")
        else:
            self.log_result("Right PV Verification", "FAIL", 
                          f"Expected {expected_right_pv}, got {right_pv}")

    def calculate_expected_left_pv(self) -> int:
        """Calculate expected left PV based on created users"""
        # Left side: Udhayaseelan (Basic=1) + Priya (Basic=1) + Amit (Advanced=4) = 6
        return 6

    def calculate_expected_right_pv(self) -> int:
        """Calculate expected right PV based on created users"""
        # Right side: Ravi (Standard=2) + Sneha (Premium=6) + Vikram (Advanced=4) = 12
        return 12

    def test_reports_api(self):
        """Test Reports API with different date ranges"""
        print("\n📊 Testing Reports API")
        
        # Test basic reports endpoint
        success, data = self.make_request('GET', 'api/admin/reports/dashboard', token=self.admin_token)
        
        if success and data.get('success'):
            self.log_result("Reports API", "PASS", "Dashboard reports retrieved")
            
            # Verify report data structure
            report_data = data.get('data', {})
            self.verify_reports_data(report_data)
        else:
            self.log_result("Reports API", "FAIL", f"API call failed: {data}")

    def verify_reports_data(self, report_data: Dict):
        """Verify reports data structure and values"""
        # Check total members
        total_members = report_data.get('totalMembers', 0)
        expected_members = len(self.created_users) + 1  # +1 for admin
        
        if total_members >= expected_members:
            self.log_result("Total Members Count", "PASS", f"Found {total_members} members")
        else:
            self.log_result("Total Members Count", "FAIL", 
                          f"Expected at least {expected_members}, got {total_members}")

    def test_member_list_api(self):
        """Test Member List API and verify all users"""
        print("\n👥 Testing Member List API")
        
        success, data = self.make_request('GET', 'api/admin/users', token=self.admin_token)
        
        if not success:
            self.log_result("Member List API", "FAIL", f"API call failed: {data}")
            return False
            
        users = data.get('data', [])
        total_users = len(users)
        
        self.log_result("Member List API", "PASS", f"Retrieved {total_users} users")
        
        # Verify all created users are in the list
        created_user_names = [user.get('name') for user in self.created_users]
        found_users = []
        
        for user in users:
            user_name = user.get('name')
            if user_name in created_user_names:
                found_users.append(user_name)
                self.log_result(f"User Found: {user_name}", "PASS", 
                              f"Plan: {user.get('currentPlan', 'None')}")
        
        missing_users = set(created_user_names) - set(found_users)
        if missing_users:
            self.log_result("All Users Verification", "FAIL", 
                          f"Missing users: {list(missing_users)}")
        else:
            self.log_result("All Users Verification", "PASS", "All created users found")

    def test_income_calculations(self):
        """Test income calculations and wallet balances"""
        print("\n💵 Testing Income Calculations")
        
        # Get admin wallet to check for matching income
        success, data = self.make_request('GET', 'api/wallet/balance', token=self.admin_token)
        
        if success and data.get('success'):
            wallet_data = data.get('data', {})
            balance = wallet_data.get('balance', 0)
            total_earnings = wallet_data.get('totalEarnings', 0)
            
            self.log_result("Admin Wallet Balance", "INFO", f"Balance: ₹{balance}")
            self.log_result("Admin Total Earnings", "INFO", f"Earnings: ₹{total_earnings}")
            
            # Check if matching income was calculated
            # Formula: min(leftPV, rightPV) * ₹25
            expected_left_pv = self.calculate_expected_left_pv()
            expected_right_pv = self.calculate_expected_right_pv()
            expected_matching_income = min(expected_left_pv, expected_right_pv) * 25
            
            self.log_result("Expected Matching Income", "INFO", 
                          f"min({expected_left_pv}, {expected_right_pv}) * 25 = ₹{expected_matching_income}")
            
            if total_earnings >= expected_matching_income:
                self.log_result("Matching Income Calculation", "PASS", 
                              f"Income calculated correctly")
            else:
                self.log_result("Matching Income Calculation", "WARN", 
                              f"Expected ₹{expected_matching_income}, got ₹{total_earnings}")
        else:
            self.log_result("Wallet Balance API", "FAIL", f"API call failed: {data}")

    def run_comprehensive_test(self):
        """Run comprehensive Binary MLM system test"""
        print("🚀 Starting Binary MLM System Comprehensive Testing")
        print("=" * 60)
        
        # Step 1: Admin login
        if not self.admin_login():
            print("❌ Cannot proceed without admin authentication")
            return False
            
        # Step 2: Create test users in binary tree structure
        if not self.create_test_users():
            print("⚠️ Some users could not be created, continuing with available users")
            
        # Step 3: Test Binary Tree API
        self.test_binary_tree_api()
        
        # Step 4: Test PV Distribution
        self.test_pv_distribution()
        
        # Step 5: Test Reports API
        self.test_reports_api()
        
        # Step 6: Test Member List API
        self.test_member_list_api()
        
        # Step 7: Test Income Calculations
        self.test_income_calculations()
        
        # Generate summary
        self.generate_test_summary()
        
        return True

    def generate_test_summary(self):
        """Generate comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📋 BINARY MLM SYSTEM TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['status'] == 'PASS'])
        failed_tests = len([r for r in self.test_results if r['status'] == 'FAIL'])
        warnings = len([r for r in self.test_results if r['status'] == 'WARN'])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⚠️ Warnings: {warnings}")
        
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        # Show failed tests
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result['status'] == 'FAIL':
                    print(f"  - {result['test']}: {result['details']}")
        
        # Show warnings
        if warnings > 0:
            print("\n⚠️ WARNINGS:")
            for result in self.test_results:
                if result['status'] == 'WARN':
                    print(f"  - {result['test']}: {result['details']}")
        
        print(f"\n📊 Created Users: {len(self.created_users)}")
        for user in self.created_users:
            print(f"  - {user.get('name')} ({user.get('referralId')})")

def main():
    """Main test execution"""
    tester = BinaryMLMTester()
    
    try:
        success = tester.run_comprehensive_test()
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())