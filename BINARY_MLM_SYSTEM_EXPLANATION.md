# Binary MLM System - PV & Matching Income Explanation

## 📊 Binary Tree Structure

### Basic Concept:
- Oru user maximum 2 direct referrals vechukalam (LEFT and RIGHT)
- Binary tree la ella members um left or right la place aaguvanga
- PV (Point Value) system use panni income calculate pannuvom

```
                    Admin (VSV00001)
                         |
            -------------------------
            |                       |
        LEFT USER             RIGHT USER
      (PV: 1000)              (PV: 1500)
            |                       |
        --------                --------
        |      |                |      |
      L1    R1                L2    R2
```

## 💰 Point Value (PV) System

### What is PV?
- PV = Point Value assigned to each plan
- When user activates plan, that plan's PV points add aagum
- PV automatically distribute aagum in upline's left or right leg

### Plan PV Examples:
```
Starter Plan    : ₹599   → 500 PV
Standard Plan   : ₹1,199 → 800 PV
Premium Plan    : ₹1,799 → 1,000 PV
Professional Plan: ₹2,999 → 1,500 PV
```

## 🌳 PV Distribution Flow

### Step-by-Step Process:

**1. User Registration:**
```javascript
User A registers under Sponsor B with placement = "LEFT"
↓
User A creates account with:
- totalPV: 0
- leftPV: 0
- rightPV: 0
- placement: "LEFT"
```

**2. Plan Activation:**
```javascript
User A activates Premium Plan (₹1,799 = 1,000 PV)
↓
User A's account:
- totalPV: 1,000
- currentPlan: "Premium Plan"
↓
This PV needs to distribute to upline
```

**3. Upline PV Update:**
```javascript
Sponsor B has User A on LEFT side
↓
Sponsor B's PV updates:
- leftPV: +1,000 (User A's PV added)
↓
If Sponsor B has sponsor (Sponsor C):
- Sponsor C's left/right PV also increases based on Sponsor B's placement
```

### Formula for PV Distribution:

```python
def distribute_pv(activated_user_id, pv_amount):
    """
    When user activates plan, PV flows up the binary tree
    """
    current_user = get_user(activated_user_id)
    current_pv = pv_amount
    
    # Travel up the tree
    while current_user.sponsor_id:
        sponsor = get_user(current_user.sponsor_id)
        placement = current_user.placement  # LEFT or RIGHT
        
        # Add PV to sponsor's left or right leg
        if placement == "LEFT":
            sponsor.leftPV += current_pv
        else:  # RIGHT
            sponsor.rightPV += current_pv
        
        # Update sponsor's total PV
        sponsor.totalPV = sponsor.leftPV + sponsor.rightPV
        
        # Check for matching income
        calculate_matching_income(sponsor)
        
        # Move up the tree
        current_user = sponsor
```

## 💵 Matching Income (Binary Income)

### Concept:
- Matching income milkum when left and right legs la PV match aagum
- Smaller leg's PV la irunthu income calculate pannuvom
- Matching ratio: Usually 10-20% of matched PV

### Formula:

```python
def calculate_matching_income(user):
    """
    Calculate matching income from paired PV
    """
    # Find smaller leg
    smaller_pv = min(user.leftPV, user.rightPV)
    larger_pv = max(user.leftPV, user.rightPV)
    
    # Calculate unpaired PV from previous cycle
    carry_forward_pv = user.carry_forward_pv or 0
    
    # Available PV for matching (smaller leg + carry forward)
    available_pv = smaller_pv + carry_forward_pv
    
    # Pair matching amount (from user's plan)
    matching_income_per_pv = user.plan.matchingIncome  # e.g., ₹25 per 100 PV
    
    # Calculate matched PV
    matched_pv = smaller_pv
    
    # Income calculation
    income = (matched_pv * matching_income_per_pv) / 100
    
    # Apply daily capping
    daily_capping = user.plan.dailyCapping
    if income > daily_capping:
        income = daily_capping
        # Carry forward remaining to next day
        remaining_pv = matched_pv - (daily_capping * 100 / matching_income_per_pv)
        user.carry_forward_pv = remaining_pv
    
    # Flush matched PV from both legs
    user.leftPV -= matched_pv
    user.rightPV -= matched_pv
    
    # Add income to wallet
    add_to_wallet(user, income, "MATCHING_INCOME")
    
    return income
```

### Example Calculation:

```
Scenario:
--------
User: VSV00001
Plan: Premium Plan (matchingIncome = ₹50 per 100 PV, dailyCapping = ₹500)

Current PV Status:
- leftPV: 5,000 PV
- rightPV: 3,000 PV

Calculation:
-----------
Step 1: Find smaller leg = 3,000 PV

Step 2: Calculate matching income
Income = (3,000 * ₹50) / 100
Income = ₹1,500

Step 3: Apply daily capping
Daily capping = ₹500
Income given today = ₹500

Step 4: Carry forward remaining
Remaining income = ₹1,500 - ₹500 = ₹1,000
Equivalent PV = (₹1,000 * 100) / ₹50 = 2,000 PV
Carry forward PV = 2,000 PV for next day

Step 5: Flush matched PV
leftPV = 5,000 - 3,000 = 2,000 PV (carry forward)
rightPV = 3,000 - 3,000 = 0 PV

After Calculation:
-----------------
- Income added to wallet: ₹500
- leftPV remaining: 2,000 PV
- rightPV remaining: 0 PV
- Carry forward for tomorrow: 2,000 PV worth ₹1,000 income
```

## 🔄 Complete Flow Diagram

```
1. NEW USER JOINS
   ↓
2. USER SELECTS SPONSOR & PLACEMENT (LEFT/RIGHT)
   ↓
3. ACCOUNT CREATED
   - totalPV: 0
   - leftPV: 0
   - rightPV: 0
   ↓
4. USER ACTIVATES PLAN
   - Selects plan (e.g., Premium = 1,000 PV)
   - Payment done
   ↓
5. PLAN ACTIVATION PROCESSING
   - User's totalPV = 1,000
   - Sponsor gets referral income
   ↓
6. PV DISTRIBUTION TO UPLINE
   - Travel up the tree
   - Each upline's left/right PV updated
   - Check for matching at each level
   ↓
7. MATCHING INCOME CALCULATION
   - For each upline who has matching PV
   - Calculate income based on smaller leg
   - Apply daily capping
   - Flush matched PV
   - Carry forward excess
   ↓
8. WALLET UPDATE
   - Matching income added to wallet
   - Transaction record created
   ↓
9. DAILY CRON JOB (RUNS EVERY DAY)
   - Process carry forward PV
   - Calculate pending matching income
   - Distribute daily capping amounts
```

## 📈 Income Types in Binary MLM

### 1. Referral Income (Direct Income)
```
Formula: Fixed amount per plan activation
Example: User A refers User B
         User B activates Premium Plan
         User A gets ₹200 referral income
```

### 2. Matching Income (Binary Income)
```
Formula: Based on PV matching in left and right legs
Calculation: (Matched_PV * Matching_Rate) / 100
Apply: Daily capping
```

### 3. Level Income (Optional)
```
Formula: Percentage of downline's plan amount
Example: 5% from level 1, 3% from level 2, etc.
```

## 🎯 Key Rules

### 1. PV Flushing:
- Matched PV flush aagum (both left and right la irunthu minus pannuvom)
- Unmatched PV carry forward aagum next matching ku
- Daily capping ku exceed aana PV um carry forward aagum

### 2. Daily Capping:
- Oru day maximum earning limit
- Excess income next day ku carry forward
- Wallet balance overall limit um irukalam

### 3. Binary Pairing:
- Left and right PV compare pannuvom
- Smaller value basis la income calculate aagum
- Remaining PV stay aagum for future matching

### 4. Upline Updates:
- Every plan activation affects entire upline
- PV automatically distribute aagum based on placement
- Real-time matching calculation nadakkanum

## 🔧 Current Implementation Status

### ✅ Implemented:
1. User registration with sponsor and placement
2. Binary tree structure
3. PV fields in database (totalPV, leftPV, rightPV)
4. Referral income on plan activation

### ❌ Not Yet Implemented:
1. **PV Distribution to Upline** - When plan activates, PV should flow up
2. **Matching Income Calculation** - Auto-calculate when PV matches
3. **Daily Capping Logic** - Limit income per day
4. **PV Flushing** - Remove matched PV from legs
5. **Carry Forward Logic** - Store pending income for next day
6. **Cron Job** - Daily processing of pending income

## 🚀 Recommended Next Steps

### To Complete Binary System:

1. **Create PV Distribution Function**
   - Trigger on plan activation
   - Update all upline's left/right PV
   - Real-time calculation

2. **Implement Matching Income**
   - Compare left vs right PV
   - Calculate income
   - Apply capping
   - Flush PV

3. **Add Carry Forward Table**
   - Store pending PV/income
   - Process daily via cron job

4. **Create Admin Dashboard Stats**
   - Show PV distribution
   - Matching income history
   - Daily capping usage

5. **Add Cron Job**
   - Run every 24 hours
   - Process carry forward
   - Distribute pending income

## 📊 Database Schema Additions Needed

### Users Collection:
```javascript
{
  totalPV: 0,        // ✅ Already exists
  leftPV: 0,         // ✅ Already exists
  rightPV: 0,        // ✅ Already exists
  carryForwardPV: 0, // ❌ Need to add
  dailyCappingUsed: 0, // ❌ Need to add
  lastMatchingDate: null, // ❌ Need to add
}
```

### Carry Forward Collection (NEW):
```javascript
{
  userId: ObjectId,
  pendingPV: 0,
  pendingIncome: 0,
  date: Date,
  processed: false
}
```

---

**Note:** Ippo basic structure ready irukku. Matching income logic backend la implement panna venum for complete binary system!
