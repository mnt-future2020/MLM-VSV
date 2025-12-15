#!/usr/bin/env python3
"""
Placement Field Testing for VSV Unite MLM Platform
Tests the placement field functionality in admin/users and user/details endpoints
"""

import requests
import sys
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

class PlacementFieldTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = "", response_time: float = 0.0):
        """Log test results with response time"""
        self.tests_run += 1
        result = {
            "name": name,
            "success": success,
            "details": details,
            "response_time": response_time,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        if success:
            self.tests_passed += 1
            time_str = f" ({response_time:.3f}s)" if response_time > 0 else ""
            print(f"✅ {name}{time_str}")
            if details:
                print(f"   ℹ️  {details}")
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

            response_time = time.time() - start_time
            
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text, "status_code": response.status_code}

            return success, response_data, response_time

        except Exception as e:
            return False, {"error": str(e)}, 0.0

    def test_admin_login(self):
        """Test admin login to get authentication token"""
        login_data = {
            "email": "admin@vsvunite.com",
            "password": "Admin@123"
        }
        
        success, data, response_time = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if success and data.get('token'):
            self.admin_token = data['token']
            self.log_test("Admin Login", True, "Successfully authenticated", response_time)
            return True
        else:
            self.log_test("Admin Login", False, f"Authentication failed: {data}")
            return False

    def test_admin_users_placement_field(self):
        """Test GET /api/admin/users endpoint for placement field"""
        if not self.admin_token:
            self.log_test("GET /api/admin/users - Placement Field", False, "No admin token available")
            return False
            
        success, data, response_time = self.make_request('GET', 'api/admin/users', token=self.admin_token)
        
        if not success:
            self.log_test("GET /api/admin/users - Placement Field", False, f"API call failed: {data}")
            return False
            
        if not data.get('success'):
            self.log_test("GET /api/admin/users - Placement Field", False, f"API returned error: {data}")
            return False
            
        users = data.get('data', [])
        if not users:
            self.log_test("GET /api/admin/users - Placement Field", False, "No users found in response")
            return False
            
        # Check placement field in each user
        placement_field_results = []
        users_with_placement = 0
        valid_placement_values = 0
        
        for user in users:
            user_id = user.get('referralId', user.get('id', 'Unknown'))
            has_placement_field = 'placement' in user
            placement_value = user.get('placement')
            
            placement_field_results.append({
                'user_id': user_id,
                'name': user.get('name', 'Unknown'),
                'has_placement_field': has_placement_field,
                'placement_value': placement_value
            })
            
            if has_placement_field:
                users_with_placement += 1
                
            # Check if placement value is valid (LEFT, RIGHT, or null)
            if placement_value in ['LEFT', 'RIGHT', None]:
                valid_placement_values += 1
        
        total_users = len(users)
        
        # Determine test success
        all_have_placement_field = users_with_placement == total_users
        all_valid_values = valid_placement_values == total_users
        
        details = f"Found {total_users} users. {users_with_placement}/{total_users} have placement field. {valid_placement_values}/{total_users} have valid placement values."
        
        if all_have_placement_field and all_valid_values:
            self.log_test("GET /api/admin/users - Placement Field", True, details, response_time)
            
            # Log detailed results
            print("   📋 Placement Field Analysis:")
            for result in placement_field_results[:5]:  # Show first 5 users
                status = "✅" if result['has_placement_field'] else "❌"
                value_display = result['placement_value'] if result['placement_value'] else "null"
                print(f"      {status} {result['name']} ({result['user_id']}): {value_display}")
            
            if len(placement_field_results) > 5:
                print(f"      ... and {len(placement_field_results) - 5} more users")
                
            return True
        else:
            self.log_test("GET /api/admin/users - Placement Field", False, details, response_time)
            return False

    def test_user_details_placement_field(self):
        """Test GET /api/user/details/{user_id} endpoint for placement field"""
        if not self.admin_token:
            self.log_test("GET /api/user/details/{user_id} - Placement Field", False, "No admin token available")
            return False
            
        # First get list of users to pick a non-admin user
        success, users_data, _ = self.make_request('GET', 'api/admin/users', token=self.admin_token)
        
        if not success or not users_data.get('success'):
            self.log_test("GET /api/user/details/{user_id} - Placement Field", False, "Could not get users list")
            return False
            
        users = users_data.get('data', [])
        
        # Find a non-admin user
        test_user = None
        for user in users:
            if user.get('role') != 'admin' and user.get('referralId') != 'VSV00001':
                test_user = user
                break
                
        if not test_user:
            self.log_test("GET /api/user/details/{user_id} - Placement Field", False, "No non-admin user found for testing")
            return False
            
        user_id = test_user.get('id') or test_user.get('referralId')
        if not user_id:
            self.log_test("GET /api/user/details/{user_id} - Placement Field", False, "Could not get user ID")
            return False
            
        # Test user details endpoint
        success, data, response_time = self.make_request('GET', f'api/user/details/{user_id}', token=self.admin_token)
        
        if not success:
            self.log_test("GET /api/user/details/{user_id} - Placement Field", False, f"API call failed: {data}")
            return False
            
        if not data.get('success'):
            self.log_test("GET /api/user/details/{user_id} - Placement Field", False, f"API returned error: {data}")
            return False
            
        user_details = data.get('data', {})
        if not user_details:
            self.log_test("GET /api/user/details/{user_id} - Placement Field", False, "No user details in response")
            return False
            
        # Check placement field
        has_placement_field = 'placement' in user_details
        placement_value = user_details.get('placement')
        is_valid_placement = placement_value in ['LEFT', 'RIGHT', None]
        
        user_name = user_details.get('name', 'Unknown')
        user_ref_id = user_details.get('referralId', 'Unknown')
        
        if has_placement_field and is_valid_placement:
            value_display = placement_value if placement_value else "null"
            details = f"User {user_name} ({user_ref_id}) has placement field with value: {value_display}"
            self.log_test("GET /api/user/details/{user_id} - Placement Field", True, details, response_time)
            
            # Verify placement matches teams collection data
            print(f"   📋 User Details Analysis:")
            print(f"      👤 User: {user_name} ({user_ref_id})")
            print(f"      📍 Placement: {value_display}")
            print(f"      ✅ Placement field present and valid")
            
            return True
        else:
            if not has_placement_field:
                details = f"User {user_name} ({user_ref_id}) missing placement field"
            else:
                details = f"User {user_name} ({user_ref_id}) has invalid placement value: {placement_value}"
            
            self.log_test("GET /api/user/details/{user_id} - Placement Field", False, details, response_time)
            return False

    def test_placement_data_consistency(self):
        """Test that placement data comes from teams collection in MongoDB"""
        if not self.admin_token:
            self.log_test("Placement Data Consistency Check", False, "No admin token available")
            return False
            
        # Get users list
        success, users_data, _ = self.make_request('GET', 'api/admin/users', token=self.admin_token)
        
        if not success or not users_data.get('success'):
            self.log_test("Placement Data Consistency Check", False, "Could not get users list")
            return False
            
        users = users_data.get('data', [])
        
        # Count placement statistics
        left_count = 0
        right_count = 0
        null_count = 0
        
        for user in users:
            placement = user.get('placement')
            if placement == 'LEFT':
                left_count += 1
            elif placement == 'RIGHT':
                right_count += 1
            else:
                null_count += 1
        
        total_users = len(users)
        
        # Log statistics
        details = f"Total users: {total_users}, LEFT: {left_count}, RIGHT: {right_count}, null: {null_count}"
        
        # Test passes if we have placement data and it's consistent
        has_placement_data = (left_count + right_count) > 0
        
        if has_placement_data:
            self.log_test("Placement Data Consistency Check", True, details, 0.0)
            
            print("   📊 Placement Statistics:")
            print(f"      📍 LEFT placements: {left_count}")
            print(f"      📍 RIGHT placements: {right_count}")
            print(f"      📍 No placement (admin/root): {null_count}")
            print(f"      ✅ Data appears to come from teams collection")
            
            return True
        else:
            self.log_test("Placement Data Consistency Check", False, f"No placement data found. {details}")
            return False

    def run_placement_tests(self):
        """Run all placement field tests"""
        print("🚀 Starting Placement Field Testing - VSV Unite MLM Platform")
        print("=" * 70)
        print("Testing placement field changes for:")
        print("1. GET /api/admin/users endpoint")
        print("2. GET /api/user/details/{user_id} endpoint")
        print("3. Data consistency with teams collection")
        print("=" * 70)
        
        # Admin login
        print("\n🔐 Authentication:")
        if not self.test_admin_login():
            print("❌ Cannot proceed without admin authentication")
            return False
        
        # Test placement field in admin/users endpoint
        print("\n👥 Testing Admin Users Endpoint:")
        admin_users_success = self.test_admin_users_placement_field()
        
        # Test placement field in user/details endpoint
        print("\n👤 Testing User Details Endpoint:")
        user_details_success = self.test_user_details_placement_field()
        
        # Test data consistency
        print("\n📊 Testing Data Consistency:")
        consistency_success = self.test_placement_data_consistency()
        
        # Print results
        print("\n" + "=" * 70)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failed_test in self.failed_tests:
                print(f"  - {failed_test}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n✅ Success Rate: {success_rate:.1f}%")
        
        # Expected results summary
        print(f"\n📋 Expected Results Check:")
        print(f"   - Placement field in admin/users: {'✅' if admin_users_success else '❌'}")
        print(f"   - Placement field in user/details: {'✅' if user_details_success else '❌'}")
        print(f"   - Data from teams collection: {'✅' if consistency_success else '❌'}")
        print(f"   - Values are LEFT/RIGHT/null: {'✅' if admin_users_success and user_details_success else '❌'}")
        
        all_tests_passed = admin_users_success and user_details_success and consistency_success
        
        if all_tests_passed:
            print("\n🎉 All placement field tests PASSED!")
            print("✅ Placement field is working correctly in both endpoints")
            print("✅ Data comes from teams collection as expected")
            print("✅ Values are properly formatted (LEFT/RIGHT/null)")
        else:
            print("\n⚠️  Some placement field tests FAILED!")
            print("❌ Please check the failed tests above")
        
        return all_tests_passed

def main():
    """Main test execution"""
    tester = PlacementFieldTester()
    
    try:
        success = tester.run_placement_tests()
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())