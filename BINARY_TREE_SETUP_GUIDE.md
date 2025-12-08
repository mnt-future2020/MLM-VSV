# Binary Tree Setup & Admin Initialization Guide

## 🌳 Binary Tree Structure

### Root Node (Admin)
The binary MLM tree starts with the Admin account as the ROOT node.

```
                    Admin (VSV00001)
                    sponsorId: null
                    leftPV: 0, rightPV: 0
                          |
        ----------------------------------
        |                                |
    LEFT USERS                      RIGHT USERS
```

## 👤 Admin Account Details

### Default Configuration:
```javascript
{
  name: "VSV Admin",
  username: "vsvadmin",
  email: "admin@vsvunite.com",
  password: "Admin@123",
  referralId: "VSV00001",     // ✅ This is the SPONSOR ID for tree
  role: "admin",
  sponsorId: null,            // ✅ No sponsor - ROOT of tree
  placement: null,            // ✅ No placement - ROOT
  leftPV: 0,
  rightPV: 0,
  totalPV: 0
}
```

### Environment Variables (backend/.env):
```
ADMIN_EMAIL=admin@vsvunite.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=VSV Admin
ADMIN_USERNAME=vsvadmin
ADMIN_REFERRAL_ID=VSV00001
```

## 🚀 How to Start Binary Tree

### Step 1: Admin Login
```
URL: /login
Email: admin@vsvunite.com
Password: Admin@123
```

### Step 2: Register First Member
```
Go to: /dashboard/new-member or /admin/new-member

Form Fields:
- Sponsor ID: VSV00001 (auto-filled from admin)
- Sponsor Name: VSV Admin (auto-filled)
- Placement: LEFT or RIGHT ⚠️ IMPORTANT!
- Member Details: Fill all
- Plan: Select a plan (optional)
```

### Step 3: Tree Structure After First User
```
                Admin (VSV00001)
                      |
        ------------------------------
        |                            |
    User A (LEFT)                (Empty)
    VSVXXXXXX
```

### Step 4: Register Second Member
```
Sponsor ID: VSV00001 (still admin)
Placement: RIGHT (to balance tree)

Result:
                Admin (VSV00001)
                      |
        ------------------------------
        |                            |
    User A (LEFT)              User B (RIGHT)
    VSVXXXXXX                  VSVYYYYYY
```

### Step 5: Third Level - Register Under User A
```
Sponsor ID: VSVXXXXXX (User A's referral ID)
Placement: LEFT or RIGHT

Result:
                Admin (VSV00001)
                      |
        ------------------------------
        |                            |
    User A (LEFT)              User B (RIGHT)
        |
    ----------
    |        |
User C    (Empty)
```

## ⚠️ IMPORTANT RULES

### 1. Sponsor ID (Referral ID)
- **Admin's Referral ID: VSV00001**
- All first-level users must use VSV00001 as sponsor
- Second-level users use their parent's referral ID
- This creates the hierarchical structure

### 2. Placement
- **LEFT or RIGHT - User MUST choose**
- Cannot change after registration
- Determines which leg the PV goes to
- Binary tree = maximum 2 direct children

### 3. PV Flow
```
User C joins under User A (LEFT) with 1000 PV
↓
User A's leftPV += 1000
↓
User A is LEFT of Admin
↓
Admin's leftPV += 1000
```

### 4. Matching Income
```
When Admin has:
leftPV = 1000
rightPV = 1500

Matching = min(1000, 1500) = 1000
Income = 1000 × ₹25 = ₹25,000
(Subject to daily capping)

After matching:
leftPV = 0
rightPV = 500
```

## 🔍 Verification Steps

### Check Admin Setup:
```bash
# MongoDB Query
db.users.findOne({ email: "admin@vsvunite.com" })

Expected:
{
  referralId: "VSV00001",
  sponsorId: null,
  role: "admin",
  leftPV: 0,
  rightPV: 0
}
```

### Check Tree Structure:
```bash
# Check teams collection
db.teams.find({ sponsorId: "admin_user_id" })

Expected: All direct downline users
```

### Check PV Distribution:
```bash
# After user activates plan
db.users.findOne({ referralId: "VSV00001" })

Expected:
{
  leftPV: X,    # Sum of left leg PV
  rightPV: Y,   # Sum of right leg PV
  totalPV: Z    # Lifetime PV earned from matching
}
```

## 🎯 Testing Scenario

### Complete Test Flow:

**Step 1: Create Test Users**
```
User A:
- Sponsor: VSV00001
- Placement: LEFT
- Plan: Standard (₹1,199 = 800 PV)

User B:
- Sponsor: VSV00001
- Placement: RIGHT
- Plan: Premium (₹1,799 = 1,000 PV)
```

**Step 2: Check Admin PV**
```
Admin should have:
leftPV: 800
rightPV: 1,000
```

**Step 3: Check Matching Income**
```
Matched PV = min(800, 1000) = 800
Daily limit = 500 / 25 = 20 PV

Day 1:
- today_pv = 20
- income = 20 × 25 = ₹500
- leftPV = 780
- rightPV = 980
- totalPV = 20

Day 2:
- today_pv = 20
- income = ₹500
- leftPV = 760
- rightPV = 960
- totalPV = 40

... continues until all PV matched
```

**Step 4: Verify Wallet**
```
Admin wallet:
- balance should increase by ₹500 per day
- totalEarnings should accumulate
```

**Step 5: Check Transactions**
```
db.transactions.find({ 
  userId: "admin_id", 
  type: "MATCHING_INCOME" 
})

Should show daily ₹500 entries
```

## 🔧 Troubleshooting

### Issue 1: "Sponsor not found"
**Cause:** Incorrect referral ID
**Solution:** Use exact referral ID (case-sensitive)
- Admin: VSV00001
- Users: Check their referralId field

### Issue 2: "PV not distributing"
**Cause:** Missing team record or placement
**Solution:** 
- Check teams collection has entry
- Verify placement is LEFT or RIGHT
- Check sponsor chain is complete

### Issue 3: "No matching income"
**Cause:** Both legs don't have PV
**Solution:**
- Check leftPV and rightPV both > 0
- Verify user has active plan
- Check daily limit not exceeded

### Issue 4: "Admin can't see downline"
**Cause:** Tree relationship not established
**Solution:**
- Verify teams collection has entries
- Check sponsorId matches admin's _id
- Ensure placement is set

## 📊 Database Collections Overview

### users
```javascript
{
  _id: ObjectId,
  referralId: "VSV00001",      // Used as sponsor ID
  sponsorId: null,              // Admin has no sponsor
  placement: null,              // Admin has no placement
  leftPV: 0,
  rightPV: 0,
  totalPV: 0
}
```

### teams
```javascript
{
  userId: "user_object_id",
  sponsorId: "sponsor_object_id",
  placement: "LEFT" or "RIGHT",
  level: 1,
  createdAt: Date
}
```

### wallets
```javascript
{
  userId: "user_object_id",
  balance: 0,
  totalEarnings: 0,
  totalWithdrawals: 0
}
```

### transactions
```javascript
{
  userId: "user_object_id",
  type: "MATCHING_INCOME",
  amount: 500,
  pv: 20,
  description: "Binary matching income - 20 PV @ ₹25/PV",
  status: "COMPLETED"
}
```

## ✅ Checklist for Binary Tree Setup

- [x] Admin account created with VSV00001
- [x] Admin has no sponsor (root of tree)
- [x] Admin has leftPV and rightPV fields
- [x] New member form auto-fills sponsor ID
- [x] Placement selection (LEFT/RIGHT) available
- [x] PV distribution function implemented
- [x] Matching income calculation implemented
- [x] Daily capping logic implemented
- [x] PV flushing after matching
- [x] Carry forward mechanism
- [x] Wallet updates automatic
- [x] Transactions recorded

## 🚀 Ready to Use!

The binary tree system is now fully configured and ready to use.

**To Start:**
1. Login as admin (admin@vsvunite.com / Admin@123)
2. Go to New Member page
3. Sponsor ID will auto-show as VSV00001
4. Register users with LEFT/RIGHT placement
5. Activate plans
6. PV flows automatically
7. Matching income calculates automatically
8. Check wallet for earnings

---

**Note:** Admin (VSV00001) is the root and receives matching income from the entire network!
