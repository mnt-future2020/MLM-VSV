#!/usr/bin/env python3
"""
Reports API Testing Script
Tests the GET /api/admin/reports/dashboard endpoint to verify real data vs dummy data
"""

import requests
import json
from datetime import datetime
from typing import Dict, Any, Optional

class ReportsAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.admin_token = None

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    token: Optional[str] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request and return success status and response data"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text, "status_code": response.status_code}

            return success, response_data

        except Exception as e:
            return False, {"error": str(e)}

    def test_admin_login(self):
        """Test admin login to get authentication token"""
        print("🔐 Testing Admin Login...")
        
        login_data = {
            "email": "admin@vsvunite.com",
            "password": "Admin@123"
        }
        
        success, data = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if success and data.get('token'):
            self.admin_token = data['token']
            print("✅ Admin login successful")
            print(f"   Token: {self.admin_token[:20]}...")
            return True
        else:
            print(f"❌ Admin login failed: {data}")
            return False

    def test_reports_dashboard_api(self):
        """Test the Reports Dashboard API"""
        print("\n📊 Testing Reports Dashboard API...")
        
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        success, data = self.make_request('GET', 'api/admin/reports/dashboard', token=self.admin_token)
        
        if not success:
            print(f"❌ API call failed: {data}")
            return False
            
        print("✅ API call successful")
        print("\n📋 Response Analysis:")
        print("=" * 50)
        
        # Pretty print the full response
        print("Full Response:")
        print(json.dumps(data, indent=2, default=str))
        
        # Analyze the response structure
        if data.get('success'):
            response_data = data.get('data', {})
            
            print("\n🔍 Data Analysis:")
            print("-" * 30)
            
            # Check overview data
            overview = response_data.get('overview', {})
            if overview:
                print("📈 Overview Data:")
                print(f"   Total Users: {overview.get('totalUsers', 'N/A')}")
                print(f"   Active Users: {overview.get('activeUsers', 'N/A')}")
                print(f"   Total Earnings: {overview.get('totalEarnings', 'N/A')}")
                print(f"   Total Withdrawals: {overview.get('totalWithdrawals', 'N/A')}")
            else:
                print("❌ No overview data found")
            
            # Check plan distribution
            plan_distribution = response_data.get('planDistribution', {})
            if plan_distribution:
                print("\n📊 Plan Distribution:")
                for plan, count in plan_distribution.items():
                    print(f"   {plan}: {count}")
            else:
                print("❌ No plan distribution data found")
            
            # Check daily reports
            daily_reports = response_data.get('dailyReports', [])
            if daily_reports:
                print(f"\n📅 Daily Reports ({len(daily_reports)} days):")
                for i, report in enumerate(daily_reports[:3]):  # Show first 3 days
                    print(f"   Day {i+1}: {report}")
                if len(daily_reports) > 3:
                    print(f"   ... and {len(daily_reports) - 3} more days")
            else:
                print("❌ No daily reports data found")
            
            # Check income breakdown
            income_breakdown = response_data.get('incomeBreakdown', {})
            if income_breakdown:
                print("\n💰 Income Breakdown:")
                for income_type, amount in income_breakdown.items():
                    print(f"   {income_type}: {amount}")
            else:
                print("❌ No income breakdown data found")
            
            # Determine if data looks real or dummy
            print("\n🎯 Data Assessment:")
            print("-" * 30)
            
            is_real_data = self.assess_data_authenticity(response_data)
            
            if is_real_data:
                print("✅ Data appears to be REAL (connected to database)")
            else:
                print("⚠️  Data appears to be DUMMY/HARDCODED")
                
            return is_real_data
            
        else:
            print(f"❌ API returned error: {data}")
            return False

    def assess_data_authenticity(self, data: Dict) -> bool:
        """Assess if the data looks real or dummy"""
        indicators = []
        
        overview = data.get('overview', {})
        
        # Check for typical dummy values
        dummy_indicators = [0, 100, 1000, 5000, 10000]  # Common dummy values
        
        total_users = overview.get('totalUsers', 0)
        active_users = overview.get('activeUsers', 0)
        total_earnings = overview.get('totalEarnings', 0)
        total_withdrawals = overview.get('totalWithdrawals', 0)
        
        # Real data indicators
        if total_users > 0 and total_users not in dummy_indicators:
            indicators.append("✅ Total users count looks realistic")
        elif total_users in dummy_indicators:
            indicators.append("⚠️  Total users count looks like dummy data")
        
        if active_users > 0 and active_users <= total_users:
            indicators.append("✅ Active users count is logical")
        elif active_users > total_users:
            indicators.append("❌ Active users > total users (data inconsistency)")
        
        if isinstance(total_earnings, (int, float)) and total_earnings >= 0:
            indicators.append("✅ Total earnings has valid format")
        
        if isinstance(total_withdrawals, (int, float)) and total_withdrawals >= 0:
            indicators.append("✅ Total withdrawals has valid format")
        
        # Check plan distribution
        plan_distribution = data.get('planDistribution', {})
        if plan_distribution and any(count > 0 for count in plan_distribution.values()):
            indicators.append("✅ Plan distribution has non-zero values")
        elif plan_distribution and all(count == 0 for count in plan_distribution.values()):
            indicators.append("⚠️  All plan distribution counts are zero")
        
        # Check daily reports
        daily_reports = data.get('dailyReports', [])
        if daily_reports and len(daily_reports) == 7:
            indicators.append("✅ Daily reports has 7 days of data")
        elif len(daily_reports) != 7:
            indicators.append("⚠️  Daily reports doesn't have 7 days")
        
        # Print all indicators
        for indicator in indicators:
            print(f"   {indicator}")
        
        # Determine if data is real based on indicators
        positive_indicators = len([i for i in indicators if i.startswith("✅")])
        total_indicators = len(indicators)
        
        authenticity_score = positive_indicators / total_indicators if total_indicators > 0 else 0
        print(f"\n📊 Authenticity Score: {positive_indicators}/{total_indicators} ({authenticity_score:.1%})")
        
        return authenticity_score >= 0.7  # 70% threshold for real data

    def run_test(self):
        """Run the complete reports API test"""
        print("🚀 Starting Reports API Test...")
        print("=" * 50)
        
        # Step 1: Login as admin
        if not self.test_admin_login():
            return False
        
        # Step 2: Test reports API
        return self.test_reports_dashboard_api()

def main():
    """Main test execution"""
    tester = ReportsAPITester()
    
    try:
        success = tester.run_test()
        print("\n" + "=" * 50)
        if success:
            print("✅ Reports API test completed successfully")
            print("📊 The API is returning data from the database")
        else:
            print("❌ Reports API test failed")
            print("⚠️  Check if the API is working correctly or returning dummy data")
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())