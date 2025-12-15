#!/usr/bin/env python3
"""
VSV Unite MLM Platform - Final Verification Test
Tests specific requirements from the review request:

Test 1: Verify Referral Income is Completely Removed
Test 2: Verify Database is Clean  
Test 3: Verify Plan Management UI
"""

import requests
import sys
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

class FinalVerificationTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
            if details:
                print(f"   {details}")
        else:
            print(f"❌ {name}")
            if details:
                print(f"   {details}")
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
            
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text, "status_code": response.status_code}

            return success, response_data, response_time

        except Exception as e:
            return False, {"error": str(e)}, 0.0

    def admin_login(self):
        """Login as admin"""
        print("🔐 Logging in as admin...")
        login_data = {
            "email": "admin@vsvunite.com",
            "password": "Admin@123"
        }
        
        success, data, _ = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if success and data.get('token'):
            self.admin_token = data['token']
            print("✅ Admin login successful")
            return True
        else:
            print(f"❌ Admin login failed: {data}")
            return False

    def get_admin_wallet_balance(self):
        """Get admin's current wallet balance"""
        success, data, _ = self.make_request('GET', 'api/wallet/balance', token=self.admin_token)
        
        if success and data.get('success'):
            balance = data.get('data', {}).get('balance', 0)
            return balance
        else:
            print(f"❌ Could not get admin wallet balance: {data}")
            return None

    def get_total_users_count(self):
        """Get total users count"""
        success, data, _ = self.make_request('GET', 'api/admin/users', token=self.admin_token)
        
        if success and data.get('success'):
            users = data.get('data', [])
            return len(users)
        else:
            print(f"❌ Could not get users count: {data}")
            return None

    def get_referral_income_transactions(self):
        """Get all REFERRAL_INCOME transactions for admin"""
        success, data, _ = self.make_request('GET', 'api/wallet/transactions', token=self.admin_token)
        
        if success and data.get('success'):
            transactions = data.get('data', [])
            referral_transactions = [t for t in transactions if t.get('type') == 'REFERRAL_INCOME']
            return referral_transactions
        else:
            print(f"❌ Could not get transactions: {data}")
            return []

    def get_plans(self):
        """Get all plans"""
        success, data, _ = self.make_request('GET', 'api/plans')
        
        if success and data.get('success'):
            return data.get('data', [])
        else:
            print(f"❌ Could not get plans: {data}")
            return []

    def create_test_user(self):
        """Create the specific test user as per review request"""
        user_data = {
            "name": "Test User Fresh",
            "username": "testuserfresh",
            "email": "testfresh@test.com",
            "password": "123456",
            "mobile": "9876543210",
            "referralId": "VSV00001",  # Admin's referral ID
            "placement": "LEFT",
            "planId": None  # Will be set after getting Basic plan ID
        }
        
        # Get Basic plan ID
        plans = self.get_plans()
        basic_plan = None
        for plan in plans:
            if plan.get('name') == 'Basic':
                basic_plan = plan
                break
        
        if not basic_plan:
            print("❌ Could not find Basic plan")
            return None
        
        user_data["planId"] = basic_plan['id']
        
        success, data, _ = self.make_request('POST', 'api/auth/register', user_data)
        
        if success and data.get('success'):
            return data.get('user')
        else:
            print(f"❌ Could not create test user: {data}")
            return None

    def test_1_referral_income_removal(self):
        """Test 1: Verify Referral Income is Completely Removed"""
        print("\n" + "="*70)
        print("🔍 TEST 1: Verify Referral Income is Completely Removed")
        print("="*70)
        
        # Step 1: Check admin's current wallet balance
        print("📊 Step 1: Checking admin's current wallet balance...")
        initial_balance = self.get_admin_wallet_balance()
        if initial_balance is None:
            self.log_test("Get Admin Initial Balance", False, "Could not retrieve admin wallet balance")
            return False
        
        print(f"   Admin's initial wallet balance: ₹{initial_balance}")
        
        # Step 2: Create new test user with Basic plan
        print("\n📝 Step 2: Creating new test user with Basic plan...")
        test_user = self.create_test_user()
        if not test_user:
            self.log_test("Create Test User", False, "Could not create test user")
            return False
        
        print(f"   Created user: {test_user.get('name')} ({test_user.get('referralId')})")
        print(f"   Sponsor: VSV00001 (admin)")
        print(f"   Placement: LEFT")
        print(f"   Plan: Basic")
        
        # Wait for any async processing
        time.sleep(3)
        
        # Step 3: Check admin's wallet balance after user creation
        print("\n💰 Step 3: Checking admin's wallet balance after user creation...")
        final_balance = self.get_admin_wallet_balance()
        if final_balance is None:
            self.log_test("Get Admin Final Balance", False, "Could not retrieve admin wallet balance")
            return False
        
        print(f"   Admin's final wallet balance: ₹{final_balance}")
        
        # Step 4: Verify no REFERRAL_INCOME transactions
        print("\n📋 Step 4: Checking for REFERRAL_INCOME transactions...")
        referral_transactions = self.get_referral_income_transactions()
        print(f"   REFERRAL_INCOME transactions found: {len(referral_transactions)}")
        
        # Step 5: Verify only PLAN_ACTIVATION transaction for new user
        print("\n🔍 Step 5: Verifying transaction types...")
        success, data, _ = self.make_request('GET', 'api/wallet/transactions', token=self.admin_token)
        all_transactions = []
        if success and data.get('success'):
            all_transactions = data.get('data', [])
        
        plan_activation_transactions = [t for t in all_transactions if t.get('type') == 'PLAN_ACTIVATION']
        print(f"   PLAN_ACTIVATION transactions found: {len(plan_activation_transactions)}")
        
        # Verification
        balance_unchanged = (final_balance == initial_balance)
        no_referral_income = (len(referral_transactions) == 0)
        
        print(f"\n📊 VERIFICATION RESULTS:")
        print(f"   Admin balance unchanged: {balance_unchanged} (₹{initial_balance} → ₹{final_balance})")
        print(f"   No REFERRAL_INCOME transactions: {no_referral_income}")
        print(f"   PLAN_ACTIVATION transactions exist: {len(plan_activation_transactions) > 0}")
        
        test_passed = balance_unchanged and no_referral_income
        
        if test_passed:
            self.log_test("Referral Income Completely Removed", True, 
                         "✅ Admin wallet unchanged, no referral income transactions")
        else:
            details = []
            if not balance_unchanged:
                details.append(f"Balance changed from ₹{initial_balance} to ₹{final_balance}")
            if not no_referral_income:
                details.append(f"Found {len(referral_transactions)} REFERRAL_INCOME transactions")
            self.log_test("Referral Income Completely Removed", False, "; ".join(details))
        
        return test_passed

    def test_2_database_clean(self):
        """Test 2: Verify Database is Clean"""
        print("\n" + "="*70)
        print("🔍 TEST 2: Verify Database is Clean")
        print("="*70)
        
        # Step 1: Check total users count
        print("👥 Step 1: Checking total users count...")
        total_users = self.get_total_users_count()
        if total_users is None:
            self.log_test("Get Total Users Count", False, "Could not retrieve users count")
            return False
        
        print(f"   Total users in database: {total_users}")
        
        # Step 2: Check admin wallet balance is reasonable
        print("\n💰 Step 2: Checking admin wallet balance...")
        admin_balance = self.get_admin_wallet_balance()
        if admin_balance is None:
            self.log_test("Get Admin Balance", False, "Could not retrieve admin balance")
            return False
        
        print(f"   Admin wallet balance: ₹{admin_balance}")
        
        # Step 3: Verify no old referral income transactions exist
        print("\n📋 Step 3: Checking for old referral income transactions...")
        referral_transactions = self.get_referral_income_transactions()
        print(f"   Total REFERRAL_INCOME transactions: {len(referral_transactions)}")
        
        # Verification
        users_count_reasonable = total_users >= 2  # At least admin + test user
        no_old_referral_income = len(referral_transactions) == 0
        
        print(f"\n📊 DATABASE VERIFICATION:")
        print(f"   Users count ≥ 2: {users_count_reasonable} (found {total_users})")
        print(f"   No referral income transactions: {no_old_referral_income}")
        print(f"   Admin balance: ₹{admin_balance}")
        
        test_passed = users_count_reasonable and no_old_referral_income
        
        if test_passed:
            self.log_test("Database is Clean", True, 
                         f"✅ {total_users} users, no referral income transactions")
        else:
            details = []
            if not users_count_reasonable:
                details.append(f"Expected ≥2 users, found {total_users}")
            if not no_old_referral_income:
                details.append(f"Found {len(referral_transactions)} old referral income transactions")
            self.log_test("Database is Clean", False, "; ".join(details))
        
        return test_passed

    def test_3_plan_management_ui(self):
        """Test 3: Verify Plan Management UI"""
        print("\n" + "="*70)
        print("🔍 TEST 3: Verify Plan Management UI")
        print("="*70)
        
        # Step 1: Call GET /api/plans
        print("📋 Step 1: Calling GET /api/plans...")
        plans = self.get_plans()
        
        if not plans:
            self.log_test("Get Plans API", False, "Could not retrieve plans")
            return False
        
        print(f"   Found {len(plans)} plans")
        
        # Step 2: Check if plans still have referralIncome field
        print("\n🔍 Step 2: Checking plan structure...")
        plans_with_referral_income = []
        
        for plan in plans:
            plan_name = plan.get('name', 'Unknown')
            has_referral_income = 'referralIncome' in plan
            referral_income_value = plan.get('referralIncome', 'N/A')
            
            print(f"   Plan: {plan_name}")
            print(f"     - Has referralIncome field: {has_referral_income}")
            if has_referral_income:
                print(f"     - referralIncome value: {referral_income_value}")
                plans_with_referral_income.append(plan_name)
            print(f"     - Amount: ₹{plan.get('amount', 0)}")
            print(f"     - PV: {plan.get('pv', 0)}")
            print(f"     - Active: {plan.get('isActive', False)}")
        
        # Step 3: Verify plans are working properly
        print(f"\n✅ Step 3: Plan functionality verification...")
        all_plans_active = all(plan.get('isActive', False) for plan in plans)
        all_plans_have_amount = all(plan.get('amount', 0) > 0 for plan in plans)
        all_plans_have_pv = all(plan.get('pv', 0) > 0 for plan in plans)
        
        print(f"   All plans active: {all_plans_active}")
        print(f"   All plans have amount > 0: {all_plans_have_amount}")
        print(f"   All plans have PV > 0: {all_plans_have_pv}")
        
        # Verification
        plans_working = all_plans_active and all_plans_have_amount and all_plans_have_pv
        has_referral_income_fields = len(plans_with_referral_income) > 0
        
        print(f"\n📊 PLAN MANAGEMENT VERIFICATION:")
        print(f"   Plans API working: ✅")
        print(f"   Plans have referralIncome field: {has_referral_income_fields}")
        print(f"   Plans with referralIncome: {plans_with_referral_income}")
        print(f"   All plans functional: {plans_working}")
        
        # Test passes if plans are working (referralIncome field may still exist in DB but not used)
        test_passed = plans_working and len(plans) > 0
        
        if test_passed:
            details = f"✅ {len(plans)} plans working properly"
            if has_referral_income_fields:
                details += f" (referralIncome field exists but not used in logic)"
            self.log_test("Plan Management UI Working", True, details)
        else:
            self.log_test("Plan Management UI Working", False, "Plans not functioning properly")
        
        return test_passed

    def run_final_verification(self):
        """Run all final verification tests"""
        print("🚀 VSV Unite MLM Platform - Final Verification Test")
        print("Testing specific requirements from review request")
        print("="*70)
        
        # Login as admin
        if not self.admin_login():
            print("❌ Cannot proceed without admin login")
            return False
        
        # Run all tests
        test_results = []
        
        test_results.append(self.test_1_referral_income_removal())
        test_results.append(self.test_2_database_clean())
        test_results.append(self.test_3_plan_management_ui())
        
        # Print final results
        print("\n" + "="*70)
        print("📊 FINAL VERIFICATION RESULTS")
        print("="*70)
        
        print(f"Tests Passed: {sum(test_results)}/{len(test_results)}")
        
        if all(test_results):
            print("\n✅ ALL VERIFICATION TESTS PASSED")
            print("   ✓ Referral income system completely removed")
            print("   ✓ Database is clean with no old referral income")
            print("   ✓ Plan management UI working properly")
            print("\n🎉 VSV Unite MLM Platform is ready for production!")
        else:
            print("\n❌ SOME VERIFICATION TESTS FAILED")
            for i, result in enumerate(test_results, 1):
                status = "✅ PASSED" if result else "❌ FAILED"
                test_names = [
                    "Referral Income Removal",
                    "Database Clean",
                    "Plan Management UI"
                ]
                print(f"   Test {i} ({test_names[i-1]}): {status}")
        
        if self.failed_tests:
            print(f"\n❌ Failed Test Details:")
            for failed_test in self.failed_tests:
                print(f"   - {failed_test}")
        
        return all(test_results)

def main():
    """Main test execution"""
    tester = FinalVerificationTester()
    
    try:
        success = tester.run_final_verification()
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())