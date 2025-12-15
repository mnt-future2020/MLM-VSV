#!/usr/bin/env python3
"""
VSV Unite MLM Platform - KYC Feature Backend Testing
Tests all KYC-related endpoints as per review request
"""

import requests
import sys
import json
import base64
from datetime import datetime
from typing import Dict, Any, Optional

class KYCAPITester:
    def __init__(self, base_url="https://7e6c3298-af5e-4ce0-ad12-9fe5b3f26133.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.kyc_submission_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test credentials from review request
        self.admin_email = "admin@vsvunite.com"
        self.admin_password = "Admin@123"
        self.test_user_email = "testkycuser123@test.com"
        self.test_user_password = "Test@123"

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            self.failed_tests.append(f"{name}: {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    token: Optional[str] = None, expected_status: int = 200, 
                    files: Optional[Dict] = None) -> tuple[bool, Dict]:
        """Make HTTP request and return success status and response data"""
        url = f"{self.base_url}/{endpoint}"
        headers = {}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        if not files:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=15)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers, timeout=15)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=15)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=15)
            
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text[:200], "status_code": response.status_code}

            return success, response_data

        except Exception as e:
            return False, {"error": str(e)}

    def test_admin_login(self):
        """Test 1: Admin login"""
        login_data = {
            "email": self.admin_email,
            "password": self.admin_password
        }
        
        success, data = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if success and data.get('token'):
            self.admin_token = data['token']
            self.log_test("Admin Login", True)
            return True
        else:
            self.log_test("Admin Login", False, f"Response: {data}")
            return False

    def test_user_login(self):
        """Test 2: User login with PENDING_KYC status"""
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, data = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if success and data.get('token'):
            self.user_token = data['token']
            user = data.get('user', {})
            self.test_user_id = user.get('id')
            kyc_status = user.get('kycStatus')
            is_active = user.get('isActive')
            
            # Verify user has PENDING_KYC status and isActive=False
            if kyc_status == 'PENDING_KYC' and is_active == False:
                self.log_test("User Login with PENDING_KYC", True)
                return True
            else:
                self.log_test("User Login with PENDING_KYC", False, 
                            f"Expected kycStatus=PENDING_KYC and isActive=False, got kycStatus={kyc_status}, isActive={is_active}")
                return False
        else:
            self.log_test("User Login with PENDING_KYC", False, f"Response: {data}")
            return False

    def test_get_user_kyc_status(self):
        """Test 3: Get user's own KYC status - GET /api/kyc/me"""
        success, data = self.make_request('GET', 'api/kyc/me', token=self.user_token)
        
        if success:
            kyc_data = data.get('data', {})
            if kyc_data.get('status') in ['PENDING_KYC', 'KYC_SUBMITTED', 'KYC_REJECTED', None]:
                self.log_test("GET /api/kyc/me", True)
                return True
            else:
                self.log_test("GET /api/kyc/me", False, f"Unexpected status: {kyc_data}")
                return False
        else:
            # It's OK if no KYC submission exists yet
            if data.get('detail') == 'No KYC submission found':
                self.log_test("GET /api/kyc/me (No submission yet)", True)
                return True
            self.log_test("GET /api/kyc/me", False, f"Response: {data}")
            return False

    def create_sample_jpeg_base64(self):
        """Create a minimal valid JPEG base64 string for testing"""
        # Minimal 1x1 pixel JPEG (valid base64)
        jpeg_base64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA/9k="
        return jpeg_base64

    def test_submit_kyc(self):
        """Test 4: User submits KYC form - POST /api/kyc/submit"""
        kyc_data = {
            "form": {
                "name": "Test KYC User",
                "email": self.test_user_email,
                "phone": "9876543210",
                "address": "123 Test Street, Test City, Test State - 123456",
                "dob": "1990-01-01",
                "idNumber": "ABCDE1234F",
                "bank": {
                    "accountName": "Test KYC User",
                    "accountNumber": "1234567890",
                    "ifsc": "TEST0001234",
                    "bankName": "Test Bank"
                }
            },
            "idProofBase64": f"data:image/jpeg;base64,{self.create_sample_jpeg_base64()}"
        }
        
        success, data = self.make_request('POST', 'api/kyc/submit', kyc_data, token=self.user_token)
        
        if success and data.get('success'):
            kyc_submission = data.get('data', {})
            self.kyc_submission_id = kyc_submission.get('id')
            status = kyc_submission.get('status')
            
            if status == 'SUBMITTED':
                self.log_test("POST /api/kyc/submit", True)
                return True
            else:
                self.log_test("POST /api/kyc/submit", False, f"Expected status=SUBMITTED, got {status}")
                return False
        else:
            self.log_test("POST /api/kyc/submit", False, f"Response: {data}")
            return False

    def test_admin_kyc_stats(self):
        """Test 5: Admin gets KYC stats - GET /api/admin/kyc/stats"""
        success, data = self.make_request('GET', 'api/admin/kyc/stats', token=self.admin_token)
        
        if success and data.get('success'):
            stats = data.get('data', {})
            required_keys = ['pending', 'approved', 'rejected', 'pendingUsers', 'total']
            
            if all(key in stats for key in required_keys):
                self.log_test("GET /api/admin/kyc/stats", True)
                return True
            else:
                self.log_test("GET /api/admin/kyc/stats", False, f"Missing keys in stats: {stats}")
                return False
        else:
            self.log_test("GET /api/admin/kyc/stats", False, f"Response: {data}")
            return False

    def test_admin_kyc_pending_list(self):
        """Test 6: Admin gets pending KYC list - GET /api/admin/kyc/pending"""
        success, data = self.make_request('GET', 'api/admin/kyc/pending', token=self.admin_token)
        
        if success and data.get('success'):
            submissions = data.get('data', {}).get('submissions', [])
            self.log_test("GET /api/admin/kyc/pending", True)
            
            # Store first submission ID if available
            if submissions and not self.kyc_submission_id:
                self.kyc_submission_id = submissions[0].get('id')
            
            return True
        else:
            self.log_test("GET /api/admin/kyc/pending", False, f"Response: {data}")
            return False

    def test_admin_kyc_detail(self):
        """Test 7: Admin views KYC detail - GET /api/admin/kyc/{id}"""
        if not self.kyc_submission_id:
            self.log_test("GET /api/admin/kyc/{id}", False, "No KYC submission ID available")
            return False
        
        success, data = self.make_request('GET', f'api/admin/kyc/{self.kyc_submission_id}', 
                                         token=self.admin_token)
        
        if success and data.get('success'):
            kyc_detail = data.get('data', {})
            required_keys = ['id', 'userId', 'form', 'status']
            
            if all(key in kyc_detail for key in required_keys):
                self.log_test("GET /api/admin/kyc/{id}", True)
                return True
            else:
                self.log_test("GET /api/admin/kyc/{id}", False, f"Missing keys: {kyc_detail}")
                return False
        else:
            self.log_test("GET /api/admin/kyc/{id}", False, f"Response: {data}")
            return False

    def test_admin_reject_kyc(self):
        """Test 8: Admin rejects KYC - POST /api/admin/kyc/reject"""
        if not self.kyc_submission_id:
            self.log_test("POST /api/admin/kyc/reject", False, "No KYC submission ID available")
            return False
        
        reject_data = {
            "kycId": self.kyc_submission_id,
            "remarks": "Test rejection - ID proof is not clear. Please upload a clearer image."
        }
        
        success, data = self.make_request('POST', 'api/admin/kyc/reject', reject_data, 
                                         token=self.admin_token)
        
        if success and data.get('success'):
            self.log_test("POST /api/admin/kyc/reject", True)
            return True
        else:
            self.log_test("POST /api/admin/kyc/reject", False, f"Response: {data}")
            return False

    def test_user_resubmit_kyc(self):
        """Test 9: User resubmits KYC after rejection - POST /api/kyc/submit"""
        kyc_data = {
            "form": {
                "name": "Test KYC User",
                "email": self.test_user_email,
                "phone": "9876543210",
                "address": "123 Test Street, Test City, Test State - 123456",
                "dob": "1990-01-01",
                "idNumber": "ABCDE1234F",
                "bank": {
                    "accountName": "Test KYC User",
                    "accountNumber": "1234567890",
                    "ifsc": "TEST0001234",
                    "bankName": "Test Bank"
                }
            },
            "idProofBase64": f"data:image/jpeg;base64,{self.create_sample_jpeg_base64()}"
        }
        
        success, data = self.make_request('POST', 'api/kyc/submit', kyc_data, token=self.user_token)
        
        if success and data.get('success'):
            kyc_submission = data.get('data', {})
            self.kyc_submission_id = kyc_submission.get('id')
            status = kyc_submission.get('status')
            
            if status == 'SUBMITTED':
                self.log_test("User Resubmit KYC", True)
                return True
            else:
                self.log_test("User Resubmit KYC", False, f"Expected status=SUBMITTED, got {status}")
                return False
        else:
            self.log_test("User Resubmit KYC", False, f"Response: {data}")
            return False

    def test_admin_approve_kyc(self):
        """Test 10: Admin approves KYC - POST /api/admin/kyc/approve"""
        if not self.kyc_submission_id:
            self.log_test("POST /api/admin/kyc/approve", False, "No KYC submission ID available")
            return False
        
        approve_data = {
            "kycId": self.kyc_submission_id,
            "remarks": "All documents verified. KYC approved."
        }
        
        success, data = self.make_request('POST', 'api/admin/kyc/approve', approve_data, 
                                         token=self.admin_token)
        
        if success and data.get('success'):
            self.log_test("POST /api/admin/kyc/approve", True)
            return True
        else:
            self.log_test("POST /api/admin/kyc/approve", False, f"Response: {data}")
            return False

    def test_user_status_after_approval(self):
        """Test 11: Verify user status changed to ACTIVE after KYC approval"""
        # Login again to get fresh user data
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, data = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if success and data.get('token'):
            user = data.get('user', {})
            kyc_status = user.get('kycStatus')
            is_active = user.get('isActive')
            
            # Verify user is now ACTIVE
            if kyc_status == 'ACTIVE' and is_active == True:
                self.log_test("User Status After KYC Approval", True)
                return True
            else:
                self.log_test("User Status After KYC Approval", False, 
                            f"Expected kycStatus=ACTIVE and isActive=True, got kycStatus={kyc_status}, isActive={is_active}")
                return False
        else:
            self.log_test("User Status After KYC Approval", False, f"Response: {data}")
            return False

    def test_jpeg_validation(self):
        """Test 12: Test JPEG validation - only JPEG should be accepted"""
        # Test with PNG (should fail)
        png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        kyc_data = {
            "form": {
                "name": "Test User",
                "email": self.test_user_email,
                "phone": "9876543210",
                "address": "Test Address",
                "dob": "1990-01-01",
                "idNumber": "TEST123456",
                "bank": {
                    "accountName": "Test User",
                    "accountNumber": "1234567890",
                    "ifsc": "TEST0001234",
                    "bankName": "Test Bank"
                }
            },
            "idProofBase64": f"data:image/png;base64,{png_base64}"
        }
        
        success, data = self.make_request('POST', 'api/kyc/submit', kyc_data, 
                                         token=self.user_token, expected_status=400)
        
        # Should fail with 400 for non-JPEG
        if not success and data.get('status_code') == 400:
            self.log_test("JPEG Validation (Reject PNG)", True)
            return True
        else:
            self.log_test("JPEG Validation (Reject PNG)", False, 
                        f"Expected 400 error for PNG, got: {data}")
            return False

    def run_all_tests(self):
        """Run all KYC tests in sequence"""
        print("\n" + "="*60)
        print("VSV Unite MLM - KYC Feature Backend Testing")
        print("="*60 + "\n")
        
        print("🔐 Authentication Tests")
        print("-" * 60)
        if not self.test_admin_login():
            print("\n❌ Admin login failed. Cannot proceed with tests.")
            return False
        
        if not self.test_user_login():
            print("\n⚠️  User login failed. Some tests may be skipped.")
        
        print("\n📋 KYC Submission Tests")
        print("-" * 60)
        self.test_get_user_kyc_status()
        self.test_submit_kyc()
        
        print("\n👨‍💼 Admin KYC Management Tests")
        print("-" * 60)
        self.test_admin_kyc_stats()
        self.test_admin_kyc_pending_list()
        self.test_admin_kyc_detail()
        
        print("\n🔄 KYC Workflow Tests")
        print("-" * 60)
        self.test_admin_reject_kyc()
        self.test_user_resubmit_kyc()
        self.test_admin_approve_kyc()
        self.test_user_status_after_approval()
        
        print("\n✅ Validation Tests")
        print("-" * 60)
        self.test_jpeg_validation()
        
        # Print summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test}")
        
        print("="*60 + "\n")
        
        return self.tests_passed == self.tests_run

def main():
    tester = KYCAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
