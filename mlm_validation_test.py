#!/usr/bin/env python3
"""
Binary MLM System Validation Test - VSV Unite Platform
Validates existing 8-user binary tree structure and calculations
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

class MLMValidationTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.admin_token = None
        self.test_results = []
        
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
        print("🔐 Admin Authentication")
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

    def test_binary_tree_structure(self):
        """Test 1: Binary Tree API and verify 8-user structure"""
        print("\n🌳 Test 1: Binary Tree Structure Validation")
        
        success, data = self.make_request('GET', 'api/user/team/tree', token=self.admin_token)
        
        if not success:
            self.log_result("Binary Tree API Call", "FAIL", f"API call failed: {data}")
            return False
            
        tree_data = data.get('data')
        if not tree_data:
            self.log_result("Binary Tree API Call", "FAIL", "No tree data returned")
            return False
            
        self.log_result("Binary Tree API Call", "PASS", "API responded successfully")
        
        # Verify tree structure matches expected layout
        self.verify_expected_structure(tree_data)
        return True

    def verify_expected_structure(self, tree_data: Dict):
        """Verify the tree matches the expected 8-user structure"""
        
        # Expected structure:
        # Admin (VSV00001)
        # ├─ LEFT: UDHAYASEELAN (Basic, PV=1)
        # │   ├─ LEFT: Priya (Basic, PV=1)  
        # │   └─ RIGHT: Amit (Advanced, PV=4)
        # └─ RIGHT: Ravi (Standard, PV=2)
        #     ├─ LEFT: Sneha (Premium, PV=6)
        #     └─ RIGHT: Vikram (Advanced, PV=4)
        
        # Check root (Admin)
        if tree_data.get('referralId') != 'VSV00001':
            self.log_result("Root Node Verification", "FAIL", "Root is not admin")
            return
            
        self.log_result("Root Node Verification", "PASS", f"Admin is root: {tree_data.get('name')}")
        
        # Check left branch (Udhayaseelan)
        left_child = tree_data.get('left')
        if left_child:
            left_name = left_child.get('name', '')
            if 'UDHAYASEELAN' in left_name.upper():
                self.log_result("Left Child (Udhayaseelan)", "PASS", f"Found: {left_name}")
                
                # Check Udhayaseelan's children
                priya = left_child.get('left')
                amit = left_child.get('right')
                
                if priya and 'PRIYA' in priya.get('name', '').upper():
                    self.log_result("Priya (Left under Udhayaseelan)", "PASS", f"Found: {priya.get('name')}")
                else:
                    self.log_result("Priya (Left under Udhayaseelan)", "FAIL", "Not found or incorrect position")
                    
                if amit and 'AMIT' in amit.get('name', '').upper():
                    self.log_result("Amit (Right under Udhayaseelan)", "PASS", f"Found: {amit.get('name')}")
                else:
                    self.log_result("Amit (Right under Udhayaseelan)", "FAIL", "Not found or incorrect position")
            else:
                self.log_result("Left Child (Udhayaseelan)", "FAIL", f"Expected Udhayaseelan, found: {left_name}")
        else:
            self.log_result("Left Child (Udhayaseelan)", "FAIL", "No left child found")
            
        # Check right branch (Ravi)
        right_child = tree_data.get('right')
        if right_child:
            right_name = right_child.get('name', '')
            if 'RAVI' in right_name.upper():
                self.log_result("Right Child (Ravi)", "PASS", f"Found: {right_name}")
                
                # Check Ravi's children
                sneha = right_child.get('left')
                vikram = right_child.get('right')
                
                if sneha and 'SNEHA' in sneha.get('name', '').upper():
                    self.log_result("Sneha (Left under Ravi)", "PASS", f"Found: {sneha.get('name')}")
                else:
                    self.log_result("Sneha (Left under Ravi)", "FAIL", "Not found or incorrect position")
                    
                if vikram and 'VIKRAM' in vikram.get('name', '').upper():
                    self.log_result("Vikram (Right under Ravi)", "PASS", f"Found: {vikram.get('name')}")
                else:
                    self.log_result("Vikram (Right under Ravi)", "FAIL", "Not found or incorrect position")
            else:
                self.log_result("Right Child (Ravi)", "FAIL", f"Expected Ravi, found: {right_name}")
        else:
            self.log_result("Right Child (Ravi)", "FAIL", "No right child found")

    def test_pv_distribution_calculations(self):
        """Test 2: PV Distribution Verification"""
        print("\n💰 Test 2: PV Distribution Calculations")
        
        success, data = self.make_request('GET', 'api/user/team/tree', token=self.admin_token)
        
        if not success:
            self.log_result("PV Distribution API", "FAIL", "Could not fetch tree data")
            return
            
        tree_data = data.get('data', {})
        
        # Get current PV values
        admin_left_pv = tree_data.get('leftPV', 0)
        admin_right_pv = tree_data.get('rightPV', 0)
        admin_total_pv = tree_data.get('totalPV', 0)
        
        self.log_result("Admin Current Left PV", "INFO", f"{admin_left_pv}")
        self.log_result("Admin Current Right PV", "INFO", f"{admin_right_pv}")
        self.log_result("Admin Current Total PV", "INFO", f"{admin_total_pv}")
        
        # Calculate expected PV based on plan values
        # Left side: Udhayaseelan(Basic=1) + Priya(Basic=1) + Amit(Advanced=4) = 6
        # Right side: Ravi(Standard=2) + Sneha(Premium=6) + Vikram(Advanced=4) = 12
        expected_left_pv = 6
        expected_right_pv = 12
        
        self.log_result("Expected Left PV", "INFO", f"{expected_left_pv} (Udhayaseelan:1 + Priya:1 + Amit:4)")
        self.log_result("Expected Right PV", "INFO", f"{expected_right_pv} (Ravi:2 + Sneha:6 + Vikram:4)")
        
        # Verify calculations
        if admin_left_pv >= expected_left_pv:
            self.log_result("Left PV Calculation", "PASS", f"Current {admin_left_pv} >= Expected {expected_left_pv}")
        else:
            self.log_result("Left PV Calculation", "FAIL", f"Current {admin_left_pv} < Expected {expected_left_pv}")
            
        if admin_right_pv >= expected_right_pv:
            self.log_result("Right PV Calculation", "PASS", f"Current {admin_right_pv} >= Expected {expected_right_pv}")
        else:
            self.log_result("Right PV Calculation", "FAIL", f"Current {admin_right_pv} < Expected {expected_right_pv}")
        
        # Verify PV travels up the sponsor chain
        self.verify_pv_chain(tree_data)

    def verify_pv_chain(self, tree_data: Dict):
        """Verify PV travels up the sponsor chain correctly"""
        
        # Check Udhayaseelan's PV (should have PV from Priya and Amit)
        left_child = tree_data.get('left')
        if left_child:
            udhaya_left_pv = left_child.get('leftPV', 0)
            udhaya_right_pv = left_child.get('rightPV', 0)
            
            # Expected: Priya(1) on left, Amit(4) on right
            if udhaya_left_pv >= 1:
                self.log_result("Udhayaseelan Left PV", "PASS", f"Has {udhaya_left_pv} PV from Priya")
            else:
                self.log_result("Udhayaseelan Left PV", "FAIL", f"Expected >=1, got {udhaya_left_pv}")
                
            if udhaya_right_pv >= 4:
                self.log_result("Udhayaseelan Right PV", "PASS", f"Has {udhaya_right_pv} PV from Amit")
            else:
                self.log_result("Udhayaseelan Right PV", "FAIL", f"Expected >=4, got {udhaya_right_pv}")
        
        # Check Ravi's PV (should have PV from Sneha and Vikram)
        right_child = tree_data.get('right')
        if right_child:
            ravi_left_pv = right_child.get('leftPV', 0)
            ravi_right_pv = right_child.get('rightPV', 0)
            
            # Expected: Sneha(6) on left, Vikram(4) on right
            if ravi_left_pv >= 6:
                self.log_result("Ravi Left PV", "PASS", f"Has {ravi_left_pv} PV from Sneha")
            else:
                self.log_result("Ravi Left PV", "FAIL", f"Expected >=6, got {ravi_left_pv}")
                
            if ravi_right_pv >= 4:
                self.log_result("Ravi Right PV", "PASS", f"Has {ravi_right_pv} PV from Vikram")
            else:
                self.log_result("Ravi Right PV", "FAIL", f"Expected >=4, got {ravi_right_pv}")

    def test_reports_api(self):
        """Test 3: Reports API with different date ranges"""
        print("\n📊 Test 3: Reports API Testing")
        
        # Test dashboard reports
        success, data = self.make_request('GET', 'api/admin/reports/dashboard', token=self.admin_token)
        
        if success and data.get('success'):
            self.log_result("Reports Dashboard API", "PASS", "Successfully retrieved dashboard data")
            
            report_data = data.get('data', {})
            
            # Verify total members count
            total_members = report_data.get('totalMembers', 0)
            if total_members >= 8:  # Admin + 7 users minimum
                self.log_result("Total Members in Reports", "PASS", f"Found {total_members} members")
            else:
                self.log_result("Total Members in Reports", "FAIL", f"Expected >=8, got {total_members}")
            
            # Check total earnings
            total_earnings = report_data.get('totalEarnings', 0)
            self.log_result("Total Earnings in Reports", "INFO", f"₹{total_earnings}")
            
            # Check plan distribution
            plan_distribution = report_data.get('planDistribution', {})
            self.log_result("Plan Distribution", "INFO", f"{plan_distribution}")
            
        else:
            self.log_result("Reports Dashboard API", "FAIL", f"API call failed: {data}")

    def test_member_list_api(self):
        """Test 4: Member List API - verify all 8 users"""
        print("\n👥 Test 4: Member List API Verification")
        
        success, data = self.make_request('GET', 'api/admin/users', token=self.admin_token)
        
        if not success:
            self.log_result("Member List API", "FAIL", f"API call failed: {data}")
            return
            
        users = data.get('data', [])
        total_users = len(users)
        
        self.log_result("Member List API", "PASS", f"Retrieved {total_users} users")
        
        # Expected users and their plans
        expected_users = {
            'VSV Admin': None,
            'UDHAYASEELAN': 'Basic',
            'Priya': 'Basic', 
            'Amit': 'Advanced',
            'Ravi': 'Standard',
            'Sneha': 'Premium',
            'Vikram': 'Advanced'
        }
        
        found_users = {}
        for user in users:
            user_name = user.get('name', '')
            user_plan = user.get('currentPlan')
            
            # Check if this matches any expected user
            for expected_name, expected_plan in expected_users.items():
                if expected_name.upper() in user_name.upper():
                    found_users[expected_name] = user_plan
                    
                    if user_plan == expected_plan:
                        self.log_result(f"User {expected_name} Plan", "PASS", 
                                      f"Correct plan: {user_plan}")
                    else:
                        self.log_result(f"User {expected_name} Plan", "FAIL", 
                                      f"Expected {expected_plan}, got {user_plan}")
        
        # Check if all expected users were found
        missing_users = set(expected_users.keys()) - set(found_users.keys())
        if missing_users:
            self.log_result("All Expected Users Found", "FAIL", 
                          f"Missing: {list(missing_users)}")
        else:
            self.log_result("All Expected Users Found", "PASS", "All users present")

    def test_income_calculations(self):
        """Test 5: Income Calculation - matching income verification"""
        print("\n💵 Test 5: Income Calculation Verification")
        
        # Get admin wallet
        success, data = self.make_request('GET', 'api/wallet/balance', token=self.admin_token)
        
        if not success:
            self.log_result("Admin Wallet API", "FAIL", f"API call failed: {data}")
            return
            
        wallet_data = data.get('data', {})
        balance = wallet_data.get('balance', 0)
        total_earnings = wallet_data.get('totalEarnings', 0)
        
        self.log_result("Admin Wallet Balance", "INFO", f"₹{balance}")
        self.log_result("Admin Total Earnings", "INFO", f"₹{total_earnings}")
        
        # Get current PV values for calculation
        success, tree_data = self.make_request('GET', 'api/user/team/tree', token=self.admin_token)
        
        if success:
            tree = tree_data.get('data', {})
            left_pv = tree.get('leftPV', 0)
            right_pv = tree.get('rightPV', 0)
            
            # Calculate expected matching income
            # Formula: min(leftPV, rightPV) * ₹25
            expected_matching_income = min(left_pv, right_pv) * 25
            
            self.log_result("Matching Income Formula", "INFO", 
                          f"min({left_pv}, {right_pv}) × ₹25 = ₹{expected_matching_income}")
            
            if total_earnings >= expected_matching_income:
                self.log_result("Matching Income Calculation", "PASS", 
                              f"Earnings ₹{total_earnings} >= Expected ₹{expected_matching_income}")
            else:
                self.log_result("Matching Income Calculation", "FAIL", 
                              f"Earnings ₹{total_earnings} < Expected ₹{expected_matching_income}")
        
        # Check transactions for income records
        success, trans_data = self.make_request('GET', 'api/wallet/transactions', token=self.admin_token)
        
        if success:
            transactions = trans_data.get('data', [])
            matching_income_transactions = [t for t in transactions if t.get('type') == 'MATCHING_INCOME']
            referral_income_transactions = [t for t in transactions if t.get('type') == 'REFERRAL_INCOME']
            
            self.log_result("Matching Income Transactions", "INFO", 
                          f"Found {len(matching_income_transactions)} transactions")
            self.log_result("Referral Income Transactions", "INFO", 
                          f"Found {len(referral_income_transactions)} transactions")

    def run_comprehensive_validation(self):
        """Run comprehensive validation of Binary MLM system"""
        print("🚀 Binary MLM System Comprehensive Validation")
        print("Testing existing 8-user binary tree structure and calculations")
        print("=" * 70)
        
        # Step 1: Admin login
        if not self.admin_login():
            print("❌ Cannot proceed without admin authentication")
            return False
            
        # Step 2: Test Binary Tree Structure
        self.test_binary_tree_structure()
        
        # Step 3: Test PV Distribution
        self.test_pv_distribution_calculations()
        
        # Step 4: Test Reports API
        self.test_reports_api()
        
        # Step 5: Test Member List API
        self.test_member_list_api()
        
        # Step 6: Test Income Calculations
        self.test_income_calculations()
        
        # Generate final summary
        self.generate_validation_summary()
        
        return True

    def generate_validation_summary(self):
        """Generate comprehensive validation summary"""
        print("\n" + "=" * 70)
        print("📋 BINARY MLM SYSTEM VALIDATION SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['status'] == 'PASS'])
        failed_tests = len([r for r in self.test_results if r['status'] == 'FAIL'])
        info_tests = len([r for r in self.test_results if r['status'] == 'INFO'])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"ℹ️ Info: {info_tests}")
        
        if total_tests > info_tests:
            success_rate = (passed_tests / (total_tests - info_tests)) * 100
            print(f"Success Rate: {success_rate:.1f}%")
        
        # Critical findings
        print(f"\n🔍 CRITICAL FINDINGS:")
        
        # Tree structure validation
        structure_tests = [r for r in self.test_results if 'Child' in r['test'] or 'Node' in r['test']]
        structure_passed = len([r for r in structure_tests if r['status'] == 'PASS'])
        print(f"  - Tree Structure: {structure_passed}/{len(structure_tests)} components verified")
        
        # PV calculation validation  
        pv_tests = [r for r in self.test_results if 'PV' in r['test'] and r['status'] in ['PASS', 'FAIL']]
        pv_passed = len([r for r in pv_tests if r['status'] == 'PASS'])
        print(f"  - PV Calculations: {pv_passed}/{len(pv_tests)} calculations correct")
        
        # Income validation
        income_tests = [r for r in self.test_results if 'Income' in r['test'] and r['status'] in ['PASS', 'FAIL']]
        income_passed = len([r for r in income_tests if r['status'] == 'PASS'])
        print(f"  - Income Calculations: {income_passed}/{len(income_tests)} calculations correct")
        
        # Show failed tests
        if failed_tests > 0:
            print(f"\n❌ FAILED VALIDATIONS:")
            for result in self.test_results:
                if result['status'] == 'FAIL':
                    print(f"  - {result['test']}: {result['details']}")
        
        # Overall assessment
        print(f"\n🎯 OVERALL ASSESSMENT:")
        if failed_tests == 0:
            print("  ✅ All validations passed - Binary MLM system is working correctly")
        elif failed_tests <= 2:
            print("  ⚠️ Minor issues found - System mostly functional")
        else:
            print("  ❌ Multiple issues found - System needs attention")

def main():
    """Main validation execution"""
    tester = MLMValidationTester()
    
    try:
        success = tester.run_comprehensive_validation()
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Validation execution failed: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())