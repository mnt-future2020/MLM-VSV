
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import sys

# Load env from backend
load_dotenv("backend/.env")

MONGO_URL = os.getenv("MONGO_URL")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")
client = MongoClient(MONGO_URL)
db = client[MONGO_DB_NAME]
users_collection = db["users"]
teams_collection = db["teams"]

def get_all_downline(parent_id, side=None, depth=0, max_depth=10):
    if depth > max_depth:
        return []
    
    members = []
    
    # Get direct children
    children = list(teams_collection.find({"sponsorId": parent_id}))
    
    for child in children:
        child_user = users_collection.find_one({"_id": ObjectId(child["userId"])})
        if child_user:
            child_side = child.get("placement", "UNKNOWN")
            members.append({
                "user": child_user,
                "side": child_side if depth == 0 else side,  # Track original side from root
                "depth": depth + 1
            })
            # Get their downline
            members.extend(get_all_downline(child["userId"], child_side if depth == 0 else side, depth + 1, max_depth))
    
    return members

def analyze_user(user_email=None):
    if user_email:
        user = users_collection.find_one({"email": user_email})
    else:
        # Find specific user
        user = users_collection.find_one({"referralId": "VSVRJAH0TD"})
        if not user:
            print("User VSVRJAH0TD not found")
            # Fallback to random
            user = users_collection.find_one({"role": "user"})
    
    if not user:
        print("No suitable user found")
        return

    print(f"Analyzing user: {user.get('name')} ({user.get('_id')})")
    
    # Check if they have children
    children = list(teams_collection.find({"sponsorId": str(user["_id"])}))
    print(f"Direct children count: {len(children)}")
    
    # Check legs
    left_leg = teams_collection.find_one({"sponsorId": str(user["_id"]), "placement": "LEFT"})
    right_leg = teams_collection.find_one({"sponsorId": str(user["_id"]), "placement": "RIGHT"})
    
    print(f"Left Leg: {'Found' if left_leg else 'MISSING'}")
    print(f"Right Leg: {'Found' if right_leg else 'MISSING'}")
    
    if not left_leg and not right_leg:
        print("Verdict: WEAK (Missing Both)")
    elif not left_leg:
        print("Verdict: WEAK (Missing Left)")
    elif not right_leg:
        print("Verdict: WEAK (Missing Right)")
    else:
        print("Verdict: STRONG (Has both legs)")
        
    # Run downline logic
    downline = get_all_downline(str(user["_id"]))
    print(f"Total downline count: {len(downline)}")
    
    if len(downline) > 0:
        print("Downline members:")
        for m in downline:
            print(f"- {m['user'].get('name')} (Side: {m['side']})")
    else:
        print("No downline (Correct for leaf node)")

if __name__ == "__main__":
    analyze_user()
