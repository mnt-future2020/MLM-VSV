#!/usr/bin/env python3
"""
Binary Tree API Test for VSV Unite MLM Platform
Tests the GET /api/user/team/tree endpoint specifically
"""

import requests
import json
import sys
from datetime import datetime

class BinaryTreeAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.admin_token = None
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test results with clear formatting"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    Details: {details}")
        print()
    
    def make_request(self, method: str, endpoint: str, data=None, token=None, expected_status=200):
        """Make HTTP request and return response details"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            
            # Parse response
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            return {
                'success': response.status_code == expected_status,
                'status_code': response.status_code,
                'data': response_data,
                'expected_status': expected_status
            }
            
        except Exception as e:
            return {
                'success': False,
                'status_code': 0,
                'data': {"error": str(e)},
                'expected_status': expected_status
            }
    
    def test_admin_login(self):
        """Step 1: Login as admin to get token"""
        print("🔐 Step 1: Admin Login")
        
        login_data = {
            "email": "admin@vsvunite.com",
            "password": "Admin@123"
        }
        
        result = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if result['success'] and result['data'].get('token'):
            self.admin_token = result['data']['token']
            self.log_result("Admin Login", True, f"Token received: {self.admin_token[:20]}...")
            return True
        else:
            self.log_result("Admin Login", False, 
                          f"Status: {result['status_code']}, Response: {result['data']}")
            return False
    
    def test_binary_tree_api(self):
        """Step 2: Test the binary tree API endpoint"""
        print("🌳 Step 2: Binary Tree API Test")
        
        if not self.admin_token:
            self.log_result("Binary Tree API", False, "No admin token available")
            return False
        
        result = self.make_request('GET', 'api/user/team/tree', token=self.admin_token)
        
        # Check status code
        if not result['success']:
            self.log_result("Binary Tree API - Status Code", False, 
                          f"Expected: {result['expected_status']}, Got: {result['status_code']}")
            return False
        else:
            self.log_result("Binary Tree API - Status Code", True, 
                          f"Status: {result['status_code']}")
        
        # Check response structure
        response_data = result['data']
        
        # Verify success field
        if not response_data.get('success'):
            self.log_result("Binary Tree API - Success Field", False, 
                          f"Expected success: true, Got: {response_data.get('success')}")
            return False
        else:
            self.log_result("Binary Tree API - Success Field", True, "success: true")
        
        # Verify data object exists
        if 'data' not in response_data:
            self.log_result("Binary Tree API - Data Object", False, "No 'data' field in response")
            return False
        else:
            self.log_result("Binary Tree API - Data Object", True, "Data object present")
        
        # Check tree structure
        tree_data = response_data['data']
        
        if tree_data is None:
            self.log_result("Binary Tree API - Tree Structure", True, 
                          "Tree data is null (valid for admin with no team)")
            return True
        
        # If tree data exists, verify required fields
        required_fields = ['id', 'name', 'referralId']
        missing_fields = []
        
        for field in required_fields:
            if field not in tree_data:
                missing_fields.append(field)
        
        if missing_fields:
            self.log_result("Binary Tree API - Required Fields", False, 
                          f"Missing fields: {missing_fields}")
            return False
        else:
            self.log_result("Binary Tree API - Required Fields", True, 
                          f"All required fields present: {required_fields}")
        
        # Print tree structure for verification
        print("📋 Tree Structure:")
        print(json.dumps(tree_data, indent=2))
        print()
        
        return True
    
    def run_test(self):
        """Run the complete binary tree API test"""
        print("🚀 Binary Tree API Test - VSV Unite MLM Platform")
        print("=" * 60)
        print()
        
        # Step 1: Login
        if not self.test_admin_login():
            print("❌ Cannot proceed without admin token")
            return False
        
        # Step 2: Test binary tree API
        if not self.test_binary_tree_api():
            print("❌ Binary tree API test failed")
            return False
        
        print("✅ All binary tree API tests passed!")
        print("=" * 60)
        return True

def main():
    """Main execution"""
    tester = BinaryTreeAPITester()
    
    try:
        success = tester.run_test()
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())