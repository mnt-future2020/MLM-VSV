#!/usr/bin/env python3
"""
Phase 3 Backend Testing - VSV Unite MLM KYC Portal
Tests:
1. Profile photo upload in KYC (JPEG, max 500KB)
2. Profile edit restriction after KYC approval (403 error)
3. Admin can edit user profile
4. Weak members report API
"""

import requests
import sys
import json
import base64
from datetime import datetime

class Phase3BackendTester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, passed, details=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = {
            "test": name,
            "status": status,
            "passed": passed,
            "details": details
        }
        self.test_results.append(result)
        print(f"\n{status} - {name}")
        if details:
            print(f"   Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        req_headers = {'Content-Type': 'application/json'}
        
        if token:
            req_headers['Authorization'] = f'Bearer {token}'
        
        if headers:
            req_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if not success and response.status_code != expected_status:
                try:
                    error_detail = response.json()
                    details += f", Response: {json.dumps(error_detail, indent=2)}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            return success, response.json() if response.status_code < 400 else {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def create_small_jpeg_base64(self):
        """Create a small JPEG base64 string (under 500KB)"""
        # This is a minimal 1x1 JPEG image in base64
        return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "/api/auth/sign-in/email",
            200,
            data={"email": "admin@vsvunite.com", "password": "Admin@123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_create_test_user(self):
        """Create a test user for Phase 3 testing"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"phase3user{timestamp}@test.com"
        
        success, response = self.run_test(
            "Create Test User",
            "POST",
            "/api/auth/register",
            200,
            data={
                "name": "Phase3 Test User",
                "username": f"phase3user{timestamp}",
                "email": test_email,
                "password": "Test@123",
                "mobile": "9876543210",
                "referralId": "VSV00001",
                "placement": "LEFT"
            }
        )
        
        if success and 'token' in response:
            self.user_token = response['token']
            self.test_user_id = response['user']['id']
            return True
        return False

    def test_kyc_with_profile_photo(self):
        """Test KYC submission with profile photo"""
        profile_photo = self.create_small_jpeg_base64()
        id_proof = self.create_small_jpeg_base64()
        
        kyc_data = {
            "name": "Phase3 Test User",
            "email": "phase3user@test.com",
            "phone": "9876543210",
            "address": "Test Address, Mumbai",
            "dob": "1990-01-01",
            "idNumber": "ABCDE1234F",
            "bank": {
                "accountName": "Phase3 Test User",
                "accountNumber": "1234567890",
                "ifsc": "SBIN0001234",
                "bankName": "State Bank of India"
            },
            "idProofBase64": id_proof,
            "profilePhotoBase64": profile_photo
        }
        
        success, response = self.run_test(
            "KYC Submission with Profile Photo",
            "POST",
            "/api/kyc/submit",
            200,
            data=kyc_data,
            token=self.user_token
        )
        return success

    def test_approve_kyc(self):
        """Approve the test user's KYC"""
        # First get pending KYC submissions
        success, response = self.run_test(
            "Get Pending KYC Submissions",
            "GET",
            "/api/admin/kyc/pending",
            200,
            token=self.admin_token
        )
        
        if not success or not response.get('data'):
            return False
        
        # Find our test user's KYC
        kyc_id = None
        submissions = response.get('data', [])
        
        # Handle both list and dict responses
        if isinstance(submissions, list):
            for submission in submissions:
                if isinstance(submission, dict) and submission.get('userId') == self.test_user_id:
                    kyc_id = submission.get('id')
                    break
        
        if not kyc_id:
            # If not found, just use the first pending KYC for testing
            if submissions and len(submissions) > 0:
                if isinstance(submissions[0], dict):
                    kyc_id = submissions[0].get('id')
        
        if not kyc_id:
            self.log_test("Find Test User KYC", False, "KYC submission not found")
            return False
        
        # Approve the KYC
        success, response = self.run_test(
            "Approve KYC",
            "POST",
            "/api/admin/kyc/approve",
            200,
            data={"kycId": kyc_id},
            token=self.admin_token
        )
        return success

    def test_profile_edit_restriction(self):
        """Test that user cannot edit profile after KYC approval"""
        success, response = self.run_test(
            "User Profile Edit After KYC Approval (Should Fail with 403)",
            "PUT",
            "/api/user/profile",
            403,  # Expecting 403 Forbidden
            data={"name": "Updated Name", "mobile": "9999999999"},
            token=self.user_token
        )
        return success

    def test_admin_can_edit_user_profile(self):
        """Test that admin can edit user profile regardless of KYC status"""
        success, response = self.run_test(
            "Admin Edit User Profile",
            "PUT",
            f"/api/admin/user/{self.test_user_id}/profile",
            200,
            data={"name": "Admin Updated Name", "mobile": "8888888888"},
            token=self.admin_token
        )
        return success

    def test_binary_tree_with_profile_photo(self):
        """Test that binary tree includes profile photo"""
        success, response = self.run_test(
            "Get Binary Tree (Check Profile Photo)",
            "GET",
            "/api/user/team/tree",
            200,
            token=self.admin_token
        )
        
        if success:
            # Check if tree data includes profilePhoto field
            tree_data = response.get('data', {})
            has_profile_photo_field = 'profilePhoto' in tree_data
            details = f"Tree includes profilePhoto field: {has_profile_photo_field}"
            self.log_test("Binary Tree Has Profile Photo Field", has_profile_photo_field, details)
        
        return success

    def test_weak_members_report(self):
        """Test weak members report API"""
        # Use admin user ID for testing
        success, response = self.run_test(
            "Get Weak Members Report",
            "GET",
            "/api/tree/weak-members/VSV00001",
            200,
            token=self.admin_token
        )
        
        if success:
            data = response.get('data', {})
            summary = data.get('summary', {})
            
            # Verify response structure
            has_summary = 'summary' in data
            has_weak_members = 'weakMembers' in data
            has_left_side = 'leftSideWeak' in data
            has_right_side = 'rightSideWeak' in data
            
            details = f"Summary: {json.dumps(summary, indent=2)}"
            self.log_test("Weak Report Has Required Fields", 
                         has_summary and has_weak_members and has_left_side and has_right_side,
                         details)
            
            # Check if weak members have severity levels
            weak_members = data.get('weakMembers', [])
            if weak_members:
                first_member = weak_members[0]
                has_severity = 'overallSeverity' in first_member
                has_weakness_reasons = 'weaknessReasons' in first_member
                
                self.log_test("Weak Members Have Severity Info",
                             has_severity and has_weakness_reasons,
                             f"First member: {json.dumps(first_member, indent=2)[:200]}")
        
        return success

    def run_all_tests(self):
        """Run all Phase 3 tests"""
        print("=" * 80)
        print("PHASE 3 BACKEND TESTING - VSV Unite MLM KYC Portal")
        print("=" * 80)
        print(f"Base URL: {self.base_url}")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)

        # Test sequence
        if not self.test_admin_login():
            print("\n❌ Admin login failed. Cannot proceed with tests.")
            return False

        if not self.test_create_test_user():
            print("\n❌ Test user creation failed. Cannot proceed with tests.")
            return False

        # Test KYC with profile photo
        self.test_kyc_with_profile_photo()

        # Approve KYC
        self.test_approve_kyc()

        # Test profile edit restriction
        self.test_profile_edit_restriction()

        # Test admin can edit user profile
        self.test_admin_can_edit_user_profile()

        # Test binary tree with profile photo
        self.test_binary_tree_with_profile_photo()

        # Test weak members report
        self.test_weak_members_report()

        # Print summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        print("=" * 80)

        # Print failed tests
        failed_tests = [t for t in self.test_results if not t['passed']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}")
                if test['details']:
                    print(f"    {test['details']}")

        return self.tests_passed == self.tests_run


def main():
    tester = Phase3BackendTester()
    success = tester.run_all_tests()
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
