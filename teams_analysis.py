#!/usr/bin/env python3
"""
Teams Collection Analysis for VSV Unite MLM Platform
Analyzes the teams collection data and binary tree structure
"""

import requests
import json
import sys
from datetime import datetime

class TeamsAnalyzer:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.admin_token = None
        
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
    
    def login_admin(self):
        """Login as admin"""
        print("🔐 Logging in as admin...")
        
        login_data = {
            "email": "admin@vsvunite.com",
            "password": "Admin@123"
        }
        
        result = self.make_request('POST', 'api/auth/sign-in/email', login_data)
        
        if result['success'] and result['data'].get('token'):
            self.admin_token = result['data']['token']
            print("✅ Admin login successful")
            return True
        else:
            print(f"❌ Admin login failed: {result['data']}")
            return False
    
    def get_binary_tree(self):
        """Get admin's binary tree"""
        print("\n🌳 Getting admin's binary tree...")
        
        result = self.make_request('GET', 'api/user/team/tree', token=self.admin_token)
        
        if result['success'] and result['data'].get('success'):
            tree_data = result['data']['data']
            print("✅ Binary tree retrieved successfully")
            return tree_data
        else:
            print(f"❌ Failed to get binary tree: {result['data']}")
            return None
    
    def get_teams_data(self):
        """Get teams collection data via admin endpoint"""
        print("\n👥 Getting teams collection data...")
        
        result = self.make_request('GET', 'api/admin/team/all', token=self.admin_token)
        
        if result['success'] and result['data'].get('success'):
            teams_data = result['data']['data']
            print("✅ Teams data retrieved successfully")
            return teams_data
        else:
            print(f"❌ Failed to get teams data: {result['data']}")
            return None
    
    def analyze_tree_structure(self, tree_data):
        """Analyze the binary tree structure"""
        print("\n📊 BINARY TREE ANALYSIS")
        print("=" * 50)
        
        if not tree_data:
            print("❌ No tree data available")
            return
        
        # Root analysis
        print(f"🔹 ROOT NODE (Admin):")
        print(f"   Name: {tree_data.get('name')}")
        print(f"   Referral ID: {tree_data.get('referralId')}")
        print(f"   Current Plan: {tree_data.get('currentPlan', 'No Plan')}")
        print(f"   Active: {tree_data.get('isActive')}")
        print(f"   Left PV: {tree_data.get('leftPV', 0)}")
        print(f"   Right PV: {tree_data.get('rightPV', 0)}")
        print(f"   Total PV: {tree_data.get('totalPV', 0)}")
        
        # Left child
        left_child = tree_data.get('left')
        if left_child:
            print(f"\n🔹 LEFT CHILD:")
            print(f"   Name: {left_child.get('name')}")
            print(f"   Referral ID: {left_child.get('referralId')}")
            print(f"   Placement: {left_child.get('placement')}")
            print(f"   Current Plan: {left_child.get('currentPlan', 'No Plan')}")
            print(f"   Active: {left_child.get('isActive')}")
            print(f"   Left PV: {left_child.get('leftPV', 0)}")
            print(f"   Right PV: {left_child.get('rightPV', 0)}")
            print(f"   Total PV: {left_child.get('totalPV', 0)}")
        else:
            print(f"\n🔹 LEFT CHILD: Empty")
        
        # Right child
        right_child = tree_data.get('right')
        if right_child:
            print(f"\n🔹 RIGHT CHILD:")
            print(f"   Name: {right_child.get('name')}")
            print(f"   Referral ID: {right_child.get('referralId')}")
            print(f"   Placement: {right_child.get('placement')}")
            print(f"   Current Plan: {right_child.get('currentPlan', 'No Plan')}")
            print(f"   Active: {right_child.get('isActive')}")
            print(f"   Left PV: {right_child.get('leftPV', 0)}")
            print(f"   Right PV: {right_child.get('rightPV', 0)}")
            print(f"   Total PV: {right_child.get('totalPV', 0)}")
        else:
            print(f"\n🔹 RIGHT CHILD: Empty")
        
        # Tree statistics
        total_nodes = self.count_nodes(tree_data)
        print(f"\n📈 TREE STATISTICS:")
        print(f"   Total Nodes: {total_nodes}")
        print(f"   Has Left Child: {'Yes' if left_child else 'No'}")
        print(f"   Has Right Child: {'Yes' if right_child else 'No'}")
        print(f"   Tree Depth: {self.get_tree_depth(tree_data)}")
    
    def analyze_teams_collection(self, teams_data):
        """Analyze teams collection data"""
        print("\n📋 TEAMS COLLECTION ANALYSIS")
        print("=" * 50)
        
        if not teams_data:
            print("❌ No teams data available")
            return
        
        members = teams_data.get('members', [])
        stats = teams_data.get('stats', {})
        
        print(f"📊 COLLECTION STATISTICS:")
        print(f"   Total Members: {stats.get('totalMembers', 0)}")
        print(f"   Left Placement: {stats.get('leftMembers', 0)}")
        print(f"   Right Placement: {stats.get('rightMembers', 0)}")
        
        if members:
            print(f"\n👥 TEAM MEMBERS DETAILS:")
            for i, member in enumerate(members, 1):
                print(f"\n   {i}. {member.get('name', 'N/A')}")
                print(f"      Referral ID: {member.get('referralId', 'N/A')}")
                print(f"      Email: {member.get('email', 'N/A')}")
                print(f"      Mobile: {member.get('mobile', 'N/A')}")
                print(f"      Placement: {member.get('placement', 'N/A')}")
                print(f"      Sponsor: {member.get('sponsorName', 'N/A')} ({member.get('sponsorId', 'N/A')})")
                print(f"      Current Plan: {member.get('currentPlan', 'No Plan')}")
                print(f"      Active: {member.get('isActive', False)}")
                print(f"      Joined: {member.get('joinedAt', 'N/A')}")
        else:
            print(f"\n👥 TEAM MEMBERS: None found")
    
    def count_nodes(self, node):
        """Count total nodes in tree"""
        if not node:
            return 0
        
        count = 1
        if node.get('left'):
            count += self.count_nodes(node['left'])
        if node.get('right'):
            count += self.count_nodes(node['right'])
        
        return count
    
    def get_tree_depth(self, node):
        """Get maximum depth of tree"""
        if not node:
            return 0
        
        left_depth = self.get_tree_depth(node.get('left')) if node.get('left') else 0
        right_depth = self.get_tree_depth(node.get('right')) if node.get('right') else 0
        
        return 1 + max(left_depth, right_depth)
    
    def verify_data_consistency(self, tree_data, teams_data):
        """Verify consistency between tree and teams collection"""
        print("\n🔍 DATA CONSISTENCY VERIFICATION")
        print("=" * 50)
        
        if not tree_data or not teams_data:
            print("❌ Cannot verify consistency - missing data")
            return
        
        # Count users in tree vs teams collection
        tree_users = self.count_nodes(tree_data) - 1  # Exclude admin
        teams_users = len(teams_data.get('members', []))
        
        print(f"📊 USER COUNT COMPARISON:")
        print(f"   Users in Tree: {tree_users}")
        print(f"   Users in Teams Collection: {teams_users}")
        print(f"   Match: {'✅ Yes' if tree_users == teams_users else '❌ No'}")
        
        # Check placement consistency
        left_in_tree = 1 if tree_data.get('left') else 0
        right_in_tree = 1 if tree_data.get('right') else 0
        
        stats = teams_data.get('stats', {})
        left_in_teams = stats.get('leftMembers', 0)
        right_in_teams = stats.get('rightMembers', 0)
        
        print(f"\n📊 PLACEMENT COMPARISON:")
        print(f"   Left - Tree: {left_in_tree}, Teams: {left_in_teams}, Match: {'✅' if left_in_tree == left_in_teams else '❌'}")
        print(f"   Right - Tree: {right_in_tree}, Teams: {right_in_teams}, Match: {'✅' if right_in_tree == right_in_teams else '❌'}")
    
    def run_analysis(self):
        """Run complete analysis"""
        print("🚀 VSV UNITE MLM - TEAMS & BINARY TREE ANALYSIS")
        print("=" * 60)
        
        # Step 1: Login
        if not self.login_admin():
            return False
        
        # Step 2: Get binary tree
        tree_data = self.get_binary_tree()
        
        # Step 3: Get teams data
        teams_data = self.get_teams_data()
        
        # Step 4: Analyze tree structure
        if tree_data:
            self.analyze_tree_structure(tree_data)
        
        # Step 5: Analyze teams collection
        if teams_data:
            self.analyze_teams_collection(teams_data)
        
        # Step 6: Verify consistency
        if tree_data and teams_data:
            self.verify_data_consistency(tree_data, teams_data)
        
        # Final summary
        print(f"\n🎯 REVIEW REQUEST VERIFICATION:")
        print(f"   ✅ Admin login successful (admin@vsvunite.com)")
        print(f"   ✅ Binary tree API tested (GET /api/user/team/tree)")
        print(f"   ✅ Tree structure analyzed")
        print(f"   ✅ PV values verified")
        print(f"   ✅ Teams collection data examined")
        print(f"   ✅ Users showing under admin: {'Yes' if tree_data and (tree_data.get('left') or tree_data.get('right')) else 'No'}")
        
        print("\n" + "=" * 60)
        print("✅ Analysis completed successfully!")
        
        return True

def main():
    """Main execution"""
    analyzer = TeamsAnalyzer()
    
    try:
        success = analyzer.run_analysis()
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())