#!/usr/bin/env python3
"""
Comprehensive Binary Tree API Test
Tests the binary tree API with different user scenarios
"""

import requests
import json
import sys
from datetime import datetime

class ComprehensiveTreeTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.user_id = None
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    Details: {details}")
        print()
    
    def make_request(self, method: str, endpoint: str, data=None, token=None, expected_status=200):
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
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            return {
                'success': response.status_code == expected_status,
                'status_code': response.status_code,
                'data': response_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'status_code': 0,
                'data': {"error": str(e)}
            }
    
    def test_admin_login(self):
        """Login as admin"""
        print("🔐 Admin Login Test")
        
        login_data = {
            "email": "admin@vsvunite.com", 
            "password": "Admin@123"
        }
        
        result = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if result['success'] and result['data'].get('token'):
            self.admin_token = result['data']['token']
            self.log_result("Admin Login", True)
            return True
        else:
            self.log_result("Admin Login", False, f"Response: {result['data']}")
            return False
    
    def test_user_registration(self):
        """Register a test user"""
        print("👤 User Registration Test")
        
        timestamp = datetime.now().strftime("%H%M%S")
        user_data = {
            "name": f"Tree Test User {timestamp}",
            "username": f"treeuser{timestamp}",
            "email": f"treetest{timestamp}@example.com",
            "password": "TreeTest@123",
            "mobile": f"98765{timestamp}",
            "referralId": "VSV00001",  # Admin's referral ID
            "placement": "LEFT"
        }
        
        result = self.make_request('POST', 'api/auth/register', user_data)
        
        if result['success'] and result['data'].get('token'):
            self.user_token = result['data']['token']
            self.user_id = result['data']['user']['id']
            self.log_result("User Registration", True, f"User ID: {self.user_id}")
            return True
        else:
            self.log_result("User Registration", False, f"Response: {result['data']}")
            return False
    
    def test_admin_tree_api(self):
        """Test tree API as admin"""
        print("🌳 Admin Tree API Test")
        
        result = self.make_request('GET', 'api/user/team/tree', token=self.admin_token)
        
        if result['success']:
            tree_data = result['data'].get('data')
            self.log_result("Admin Tree API", True, f"Tree structure retrieved")
            
            # Print admin tree
            print("📋 Admin Tree Structure:")
            print(json.dumps(tree_data, indent=2))
            print()
            return True
        else:
            self.log_result("Admin Tree API", False, f"Status: {result['status_code']}")
            return False
    
    def test_user_tree_api(self):
        """Test tree API as regular user"""
        print("🌳 User Tree API Test")
        
        if not self.user_token:
            self.log_result("User Tree API", False, "No user token")
            return False
        
        result = self.make_request('GET', 'api/user/team/tree', token=self.user_token)
        
        if result['success']:
            tree_data = result['data'].get('data')
            self.log_result("User Tree API", True, "Tree structure retrieved")
            
            # Print user tree
            print("📋 User Tree Structure:")
            print(json.dumps(tree_data, indent=2))
            print()
            return True
        else:
            self.log_result("User Tree API", False, f"Status: {result['status_code']}")
            return False
    
    def test_unauthorized_access(self):
        """Test tree API without token"""
        print("🚫 Unauthorized Access Test")
        
        result = self.make_request('GET', 'api/user/team/tree', expected_status=401)
        
        if result['success']:  # Should fail with 401
            self.log_result("Unauthorized Access", True, "Correctly rejected unauthorized request")
            return True
        else:
            self.log_result("Unauthorized Access", False, 
                          f"Expected 401, got {result['status_code']}")
            return False
    
    def run_all_tests(self):
        """Run comprehensive tree API tests"""
        print("🚀 Comprehensive Binary Tree API Tests")
        print("=" * 60)
        print()
        
        tests_passed = 0
        total_tests = 5
        
        # Test 1: Admin login
        if self.test_admin_login():
            tests_passed += 1
        
        # Test 2: User registration
        if self.test_user_registration():
            tests_passed += 1
        
        # Test 3: Admin tree API
        if self.test_admin_tree_api():
            tests_passed += 1
        
        # Test 4: User tree API
        if self.test_user_tree_api():
            tests_passed += 1
        
        # Test 5: Unauthorized access
        if self.test_unauthorized_access():
            tests_passed += 1
        
        # Results
        print("=" * 60)
        print(f"📊 Test Results: {tests_passed}/{total_tests} passed")
        
        if tests_passed == total_tests:
            print("✅ All binary tree API tests passed!")
        else:
            print(f"❌ {total_tests - tests_passed} test(s) failed")
        
        return tests_passed == total_tests

def main():
    """Main execution"""
    tester = ComprehensiveTreeTester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())