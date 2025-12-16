import os
import sys
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load env
load_dotenv("backend/.env")

MONGO_URL = os.getenv("MONGO_URL")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

if not MONGO_URL:
    print("MONGO_URL not found")
    sys.exit(1)

client = MongoClient(MONGO_URL)
db = client[MONGO_DB_NAME]
users_collection = db["users"]
teams_collection = db["teams"]

def verify_consistency():
    print("Verifying User vs Team Consistency...")
    
    # 1. Get all users
    all_users = list(users_collection.find({}, {"_id": 1, "username": 1, "referralId": 1, "placement": 1, "isActive": 1}))
    user_ids = {str(u["_id"]): u for u in all_users}
    print(f"Total Users: {len(all_users)}")
    
    # 2. Get all team entries
    all_teams = list(teams_collection.find({}, {"userId": 1, "placement": 1, "sponsorId": 1}))
    team_user_ids = {t["userId"] for t in all_teams}
    print(f"Total Team Entries: {len(all_teams)}")
    
    # 3. Find Users NOT in Team
    missing_from_team = []
    for uid, user in user_ids.items():
        if uid not in team_user_ids:
            # Check if admin (root might not mean in team?? Usually root is in team too or top)
            # Actually root users might NOT have a parent, so maybe not in team if team stores parent-child?
            # Let's check schema.
            missing_from_team.append(user)
            
    print(f"\n--- Users Missing from Teams Collection ({len(missing_from_team)}) ---")
    for u in missing_from_team:
        print(f"User: {u.get('username', 'N/A')} ({u.get('referralId')}) - Active: {u.get('isActive')}")
        
    # 4. Check Depth Reachability
    # Build adjacency list
    adj = {}
    for t in all_teams:
        parent = t.get("sponsorId") # This is parent ID logic
        child = t.get("userId")
        if parent:
            if parent not in adj: adj[parent] = []
            adj[parent].append(child)
            
    # Find Root (Admin)
    admin = users_collection.find_one({"role": "admin"})
    if not admin:
        print("Admin not found!")
        return
        
    admin_id = str(admin["_id"])
    print(f"\nRoot Admin ID: {admin_id}")
    
    # BFS to find reachable nodes
    queue = [(admin_id, 0)]
    visited = {admin_id}
    max_depth_reached = 0
    reachable_count = 1 # Admin
    
    depth_counts = {}
    
    while queue:
        curr, depth = queue.pop(0)
        max_depth_reached = max(max_depth_reached, depth)
        depth_counts[depth] = depth_counts.get(depth, 0) + 1
        
        children = adj.get(curr, [])
        for child in children:
            if child not in visited:
                visited.add(child)
                reachable_count += 1
                queue.append((child, depth + 1))
                
    print(f"\n--- Tree Reachability ---")
    print(f"Max Depth: {max_depth_reached}")
    print(f"Reachable Nodes (staring from Admin): {reachable_count}")
    print(f"Depth Distribution: {depth_counts}")
    
    print(f"\nUnreachable Nodes (in Team but disconnected from Root): {len(team_user_ids) - reachable_count}")
    # Note: Admin might not be in team_user_ids if it has no parent entry in 'teams'. 
    # If 'teams' table stores "Child -> Parent", result is correct.
    
    # If Reachable < Total Users, we have a problem (Orphans).

if __name__ == "__main__":
    verify_consistency()
