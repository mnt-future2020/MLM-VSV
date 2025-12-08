# Binary MLM Calculation - Verified Implementation ✅

## Final Formula (As Per User Specification)

### 1️⃣ PV Flows Upwards Completely
- When a user joins with a plan (e.g., 10 PV, 30 PV, 40 PV)
- PV goes to their sponsor
- Sponsor receives PV on the exact side (LEFT or RIGHT) where user is placed
- PV continues flowing up to sponsor's sponsor, all the way to Admin
- **No skipping, no percentage cut - Full PV flows up**

### 2️⃣ Points Accumulate on Left and Right Separately
Each user has:
- Left side points (`leftPV`)
- Right side points (`rightPV`)
- These accumulate from all downline purchases

### 3️⃣ PV Matching = Smallest Side
```
Matching PV = min(leftPV, rightPV)
```
Binary MLM earning based on matching - you can only match when both sides have points.

### 4️⃣ Daily PV Limit (Capping)
Even if matching PV is high, user can earn only up to their plan's daily limit.

Example:
- Plan daily limit = 10 PV
- Matched PV = 30 PV
- **Allowed today = 10 PV only**
- Daily Earnings = 10 × ₹25 = ₹250

### 5️⃣ Carry Forward
After taking matching PV:
- Matching PV is subtracted from **both** sides
- Remaining points carry to next day

Example:
```
Day 1:
  Left = 30, Right = 40
  Matching = 30
  Allowed (plan limit) = 10
  Carry forward: Left = 20, Right = 30
```

### 6️⃣ Today PV vs Total PV
- **Today PV**: PV used for that day's earning (after capping)
- **Total PV**: Sum of all daily PV earnings (lifetime)

### 7️⃣ Daily Amount Calculation
```
Amount = Today PV × ₹25
```

### 8️⃣ Complete Example (Verified)

#### Day 1
- **Initial**: A=30 PV (left), B=40 PV (right)
- **Plan Limit**: 10 PV/day
- **Matching**: min(30, 40) = 30
- **Today PV**: min(30, 10) = 10 (limited by plan)
- **Earnings**: 10 × ₹25 = **₹250** ✅
- **Carry Forward**: Left=20, Right=30 ✅

#### Day 2
- **Previous Carry**: Left=20, Right=30
- **New PV**: C joins with 10 PV → Right becomes 40
- **Current**: Left=20, Right=40
- **Matching**: min(20, 40) = 20
- **Today PV**: min(20, 10) = 10 (limited by plan)
- **Earnings**: 10 × ₹25 = **₹250** ✅
- **Carry Forward**: Left=10, Right=30 ✅

**Total Earnings**: ₹500
**Total PV (lifetime)**: 20

## Implementation Details

### Database Schema

**users collection:**
```javascript
{
  leftPV: Number,          // Left leg accumulated PV
  rightPV: Number,         // Right leg accumulated PV
  totalPV: Number,         // Lifetime PV earned
  dailyPVUsed: Number,     // PV used today (resets daily)
  lastMatchingDate: Date,  // Last matching calculation date
  currentPlan: ObjectId    // Active plan (required for matching)
}
```

**plans collection:**
```javascript
{
  name: String,
  pv: Number,              // PV value of plan
  dailyCapping: Number,    // Daily earning limit in ₹
  // dailyCapping / 25 = max PV per day
}
```

**wallets collection:**
```javascript
{
  userId: String,
  balance: Number,
  totalEarnings: Number,
  totalWithdrawals: Number
}
```

### Backend Functions

#### 1. `distribute_pv_upward(user_id, pv_amount)`
- Called when user activates a plan
- Adds PV to all sponsors up the chain
- Respects placement (LEFT/RIGHT)
- Triggers matching income calculation for each sponsor

#### 2. `calculate_matching_income(user_id)`
- Calculates: `matched_pv = min(leftPV, rightPV)`
- Applies daily capping: `today_pv = min(matched_pv, remaining_daily_limit)`
- Income: `today_pv × ₹25`
- Updates wallet
- Subtracts `today_pv` from both sides
- Increments `totalPV`
- Creates transaction record

### Plan Daily Limits

| Plan | Daily Capping | Max PV/Day |
|------|---------------|------------|
| Basic | ₹250 | 10 PV |
| Standard | ₹500 | 20 PV |
| Advanced | ₹1,000 | 40 PV |
| Premium | ₹1,500 | 60 PV |

## Testing Results

✅ **All calculations verified against user's exact formula**
✅ **Day 1 scenario: PASS**
✅ **Day 2 scenario: PASS**
✅ **Carry forward logic: PASS**
✅ **Daily limit capping: PASS**
✅ **PV distribution upward: PASS**

## Test Script
Run: `python3 /app/test_binary_mlm_formula.py`

## Summary
The binary MLM system is implemented **exactly** as per the user's specification:
1. ✅ PV flows upward completely
2. ✅ Left & Right accumulation
3. ✅ Matching = min(left, right)
4. ✅ Daily capping
5. ✅ Carry forward
6. ✅ Today PV tracking
7. ✅ Total PV (lifetime)
8. ✅ Amount = PV × ₹25

**Status**: Production Ready 🚀
**Last Verified**: 2025-01-08
