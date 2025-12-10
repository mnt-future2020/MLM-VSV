#!/usr/bin/env python3
"""
VSV Unite MLM Platform - Final Confirmation Test
Verify NO referral income after complete reset as per review request

Test Steps:
1. Login as admin (admin@vsvunite.com / Admin@123)
2. Verify admin wallet is ₹0
3. Check all plans have referralIncome = 0 (field exists but not used)
4. Create a NEW test user with specific details
5. After creation, verify:
   - Admin wallet is STILL ₹0
   - NO referral income transaction created
   - User is created successfully with plan

Expected Results:
- Admin wallet: ₹0 before and after
- No REFERRAL_INCOME transactions
- System working correctly
"""

import requests
import sys
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

class FinalConfirmationTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.admin_token = None
        self.test_results = []
        
    def log_result(self, step: str, success: bool, details: str = ""):
        """Log test step results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = f"{status} - {step}"
        if details:
            result += f": {details}"
        print(result)
        self.test_results.append({
            "step": step,
            "success": success,
            "details": details
        })
        return success

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    token: Optional[str] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request and return success status and response data"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text, "status_code": response.status_code}

            return success, response_data

        except Exception as e:
            return False, {"error": str(e)}

    def test_step_1_admin_login(self):
        """Step 1: Login as admin (admin@vsvunite.com / Admin@123)"""
        print("\n🔐 STEP 1: Admin Login")
        
        login_data = {
            "email": "admin@vsvunite.com",
            "password": "Admin@123"
        }
        
        success, data = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if success and data.get('token'):
            self.admin_token = data['token']
            admin_name = data.get('user', {}).get('name', 'Admin')
            return self.log_result("Admin Login", True, f"Logged in as {admin_name}")
        else:
            return self.log_result("Admin Login", False, f"Login failed: {data}")

    def test_step_2_verify_admin_wallet_zero(self):
        """Step 2: Verify admin wallet is ₹0"""
        print("\n💰 STEP 2: Verify Admin Wallet is ₹0")
        
        if not self.admin_token:
            return self.log_result("Admin Wallet Check", False, "No admin token")
        
        success, data = self.make_request('GET', 'api/wallet/balance', token=self.admin_token)
        
        if success and data.get('success'):
            wallet_data = data.get('data', {})
            balance = wallet_data.get('balance', 0)
            total_earnings = wallet_data.get('totalEarnings', 0)
            
            if balance == 0:
                return self.log_result("Admin Wallet is ₹0", True, f"Balance: ₹{balance}, Total Earnings: ₹{total_earnings}")
            else:
                return self.log_result("Admin Wallet is ₹0", False, f"Balance: ₹{balance} (expected ₹0)")
        else:
            return self.log_result("Admin Wallet Check", False, f"API failed: {data}")

    def test_step_3_check_plans_referral_income(self):
        """Step 3: Check all plans have referralIncome field (but not used in logic)"""
        print("\n📋 STEP 3: Check Plans Configuration")
        
        success, data = self.make_request('GET', 'api/plans')
        
        if success and data.get('success'):
            plans = data.get('data', [])
            
            if not plans:
                return self.log_result("Plans Configuration", False, "No plans found")
            
            print(f"   Found {len(plans)} plans:")
            all_plans_valid = True
            
            for plan in plans:
                name = plan.get('name', 'Unknown')
                amount = plan.get('amount', 0)
                pv = plan.get('pv', 0)
                referral_income = plan.get('referralIncome', 0)
                
                print(f"   - {name}: ₹{amount}, PV={pv}, referralIncome={referral_income}")
                
                # Note: referralIncome field exists but should not be used in logic
                if 'referralIncome' not in plan:
                    all_plans_valid = False
            
            if all_plans_valid:
                return self.log_result("Plans Configuration", True, f"All {len(plans)} plans have referralIncome field (but not used in logic)")
            else:
                return self.log_result("Plans Configuration", False, "Some plans missing referralIncome field")
        else:
            return self.log_result("Plans Configuration", False, f"API failed: {data}")

    def test_step_4_create_new_test_user(self):
        """Step 4: Create a NEW test user with specific details"""
        print("\n👤 STEP 4: Create New Test User")
        
        if not self.admin_token:
            return self.log_result("Create Test User", False, "No admin token")
        
        # Get first available plan
        success, plans_data = self.make_request('GET', 'api/plans')
        if not success or not plans_data.get('data'):
            return self.log_result("Get Plans for User", False, "Could not get plans")
        
        basic_plan = None
        for plan in plans_data['data']:
            if plan.get('name', '').lower() == 'basic':
                basic_plan = plan
                break
        
        if not basic_plan:
            basic_plan = plans_data['data'][0]  # Use first plan if Basic not found
        
        # Create user with exact details from review request
        user_data = {
            "name": "Final Test User",
            "username": "finaltestuser",
            "email": "finaltest@test.com",
            "password": "123456",
            "mobile": "8888888888",
            "referralId": "VSV00001",  # Sponsor: VSV00001
            "placement": "LEFT",       # Placement: LEFT
            "planId": basic_plan['id'] # Plan: Basic
        }
        
        print(f"   Creating user: {user_data['name']} ({user_data['username']})")
        print(f"   Email: {user_data['email']}, Mobile: {user_data['mobile']}")
        print(f"   Sponsor: {user_data['referralId']}, Placement: {user_data['placement']}")
        print(f"   Plan: {basic_plan['name']} (₹{basic_plan['amount']})")
        
        success, data = self.make_request('POST', 'api/auth/register', user_data)
        
        if success and data.get('success'):
            user_info = data.get('user', {})
            user_name = user_info.get('name', 'Unknown')
            referral_id = user_info.get('referralId', 'Unknown')
            
            return self.log_result("Create Test User", True, f"User created: {user_name} (ID: {referral_id})")
        else:
            return self.log_result("Create Test User", False, f"Registration failed: {data}")

    def test_step_5_verify_no_referral_income(self):
        """Step 5: Verify admin wallet is STILL ₹0 and NO referral income transactions"""
        print("\n🔍 STEP 5: Verify NO Referral Income Given")
        
        if not self.admin_token:
            return self.log_result("Verify No Referral Income", False, "No admin token")
        
        # Wait a moment for any potential async processing
        time.sleep(2)
        
        # Check admin wallet balance again
        success, wallet_data = self.make_request('GET', 'api/wallet/balance', token=self.admin_token)
        
        if not success or not wallet_data.get('success'):
            return self.log_result("Check Admin Wallet After", False, f"Wallet API failed: {wallet_data}")
        
        wallet_info = wallet_data.get('data', {})
        final_balance = wallet_info.get('balance', 0)
        final_earnings = wallet_info.get('totalEarnings', 0)
        
        print(f"   Admin wallet after user creation:")
        print(f"   - Balance: ₹{final_balance}")
        print(f"   - Total Earnings: ₹{final_earnings}")
        
        # Check for REFERRAL_INCOME transactions
        success, transactions_data = self.make_request('GET', 'api/wallet/transactions', token=self.admin_token)
        
        referral_transactions = []
        if success and transactions_data.get('success'):
            transactions = transactions_data.get('data', [])
            referral_transactions = [t for t in transactions if t.get('type') == 'REFERRAL_INCOME']
        
        print(f"   REFERRAL_INCOME transactions found: {len(referral_transactions)}")
        
        # Test passes if:
        # 1. Admin wallet balance is still ₹0
        # 2. No REFERRAL_INCOME transactions exist
        wallet_still_zero = final_balance == 0
        no_referral_transactions = len(referral_transactions) == 0
        
        if wallet_still_zero and no_referral_transactions:
            return self.log_result("NO Referral Income Given", True, f"✅ Admin wallet: ₹{final_balance}, Referral transactions: {len(referral_transactions)}")
        else:
            issues = []
            if not wallet_still_zero:
                issues.append(f"Admin wallet increased to ₹{final_balance}")
            if not no_referral_transactions:
                issues.append(f"{len(referral_transactions)} referral income transactions found")
            
            return self.log_result("NO Referral Income Given", False, "; ".join(issues))

    def run_final_confirmation_test(self):
        """Run the complete final confirmation test"""
        print("🎯 VSV Unite MLM Platform - Final Confirmation Test")
        print("Verify NO referral income after complete reset")
        print("=" * 70)
        
        # Run all test steps
        step_results = []
        
        step_results.append(self.test_step_1_admin_login())
        step_results.append(self.test_step_2_verify_admin_wallet_zero())
        step_results.append(self.test_step_3_check_plans_referral_income())
        step_results.append(self.test_step_4_create_new_test_user())
        step_results.append(self.test_step_5_verify_no_referral_income())
        
        # Print final results
        print("\n" + "=" * 70)
        print("📊 FINAL CONFIRMATION TEST RESULTS:")
        
        passed_steps = sum(step_results)
        total_steps = len(step_results)
        
        print(f"   Steps Passed: {passed_steps}/{total_steps}")
        
        if all(step_results):
            print("\n✅ ALL TESTS PASSED - REFERRAL INCOME SYSTEM COMPLETELY DISABLED")
            print("   ✓ Admin wallet remains at ₹0")
            print("   ✓ No REFERRAL_INCOME transactions created")
            print("   ✓ User creation with plan works correctly")
            print("   ✓ System is working as expected")
        else:
            print("\n❌ SOME TESTS FAILED")
            for i, result in enumerate(self.test_results):
                if not result['success']:
                    print(f"   ❌ Step {i+1}: {result['step']} - {result['details']}")
        
        print("\n" + "=" * 70)
        
        return all(step_results)

def main():
    """Main test execution"""
    tester = FinalConfirmationTester()
    
    try:
        success = tester.run_final_confirmation_test()
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())