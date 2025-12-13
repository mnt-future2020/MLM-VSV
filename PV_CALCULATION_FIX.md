# PV Calculation Fix - Implementation Summary

## Problem Statement

The previous PV calculation had an incorrect formula that didn't properly handle the relationship between matched PV and daily capping.

### Previous (Incorrect) Behavior:
```python
# OLD CODE (WRONG):
"$inc": {
    "leftPV": -today_pv,        # ❌ Wrong - should subtract matched_pv
    "rightPV": -today_pv,       # ❌ Wrong - should subtract matched_pv
    "totalPV": today_pv         # ❌ Wrong - should add matched_pv
}
```

**Issue**: When daily capping limited the payout, the matched PV wasn't properly flushed from both sides.

### Example of the Problem:
- Left PV: 14, Right PV: 37
- Matched PV: min(14, 37) = 14
- Daily Cap: 250 (max 10 PV/day)
- Today PV: min(14, 10) = 10
- Income: 10 × ₹25 = ₹250

**Old (Wrong) Result**:
- Left PV: 4 (14 - 10)  ❌ Wrong!
- Right PV: 27 (37 - 10)  ❌ Wrong!
- Total PV: 27 (17 + 10)  ❌ Wrong!
- The 4 PV difference was "lost" forever

**Correct Result**:
- Left PV: 0 (14 - 14)  ✅ Correct!
- Right PV: 23 (37 - 14)  ✅ Correct!
- Total PV: 31 (17 + 14)  ✅ Correct!
- Daily PV Used: 10
- Income: ₹250

## Solution

### New (Correct) Behavior:
```python
# Calculate matched PV
matched_pv = min(left_pv, right_pv)

# Calculate today's payout (limited by daily cap)
max_pv_per_day = daily_capping // matching_income_rate
remaining_pv_today = max_pv_per_day - daily_pv_used
today_pv = min(matched_pv, remaining_pv_today)

# Pay income based on today_pv
income = today_pv * matching_income_rate

# BUT flush matched_pv (not today_pv) from both sides
users_collection.update_one(
    {"_id": ObjectId(user_id)},
    {
        "$inc": {
            "leftPV": -matched_pv,      # ✅ Flush full matched amount
            "rightPV": -matched_pv,     # ✅ Flush full matched amount
            "totalPV": matched_pv       # ✅ Track lifetime matched volume
        },
        "$set": {
            "dailyPVUsed": daily_pv_used + today_pv,  # ✅ Track daily cap usage
            "lastMatchingDate": today_date,
            "updatedAt": get_ist_now()
        }
    }
)
```

## Key Concepts

### 1. **matched_pv** (Matched PV)
- The minimum of left and right PV
- Represents the actual pairs that can be matched
- **Always flushed from both sides** regardless of capping

### 2. **today_pv** (Today's Payout PV)
- The amount of PV that will be paid out today
- Limited by daily capping: `min(matched_pv, remaining_daily_cap)`
- **Used for income calculation only**

### 3. **totalPV** (Lifetime Matched PV)
- Cumulative total of all matched PV (not capped)
- Used for rank calculation and statistics
- **Increases by matched_pv, not today_pv**

### 4. **dailyPVUsed** (Daily Cap Tracking)
- Tracks how much PV was paid out today
- Resets every day
- **Increases by today_pv, not matched_pv**

## Files Modified

1. **`/app/backend/server.py`**
   - Function: `calculate_matching_income(user_id: str)` (line ~1933)
   - Endpoint: `/api/admin/calculate-daily-matching` (line ~4551)

2. **`/app/backend/app/services/mlm_service.py`**
   - Function: `calculate_matching_income(user_id: str)` (line ~155)

## Test Results

### Test 1: User's Example Scenario
**Input**: Left=14, Right=37, Total=17, Daily Cap=250 (10 PV/day)

**Results**:
- ✅ Left PV: 0 (Expected: 0)
- ✅ Right PV: 23 (Expected: 23)
- ✅ Total PV: 31 (Expected: 31)
- ✅ Daily PV Used: 10 (Expected: 10)
- ✅ Income: ₹250 (Expected: ₹250)

### Test 2: Capping Scenario
**Input**: Left=50, Right=60, Total=0, Daily Cap=250 (10 PV/day)

**Results**:
- ✅ Left PV: 0 (50-50, Expected: 0)
- ✅ Right PV: 10 (60-50, Expected: 10)
- ✅ Total PV: 50 (0+50, Expected: 50)
- ✅ Daily PV Used: 10 (Expected: 10)
- ✅ Income: ₹250 (Expected: ₹250)

## Impact

### User Dashboard
- Binary tree will show accurate PV values
- Total PV reflects true lifetime matching volume
- Users can see correct left/right leg accumulation

### Admin Dashboard
- Admin can see accurate team statistics
- PV reports will show correct matching data
- EOD calculations will work correctly

### Financial Accuracy
- Income calculations remain correct (based on daily capping)
- But PV flushing is now mathematically correct
- No more "lost" PV that should have been cleared

## Testing

Run comprehensive test:
```bash
cd /app && python3 comprehensive_pv_test.py
```

Or simple test:
```bash
cd /app && python3 test_via_api.py
```

## Deployment Notes

- **No database migration required**
- Changes are in calculation logic only
- Existing PV values are not affected
- Future calculations will use correct formula

## Formula Summary

```
matched_pv = min(leftPV, rightPV)
today_pv = min(matched_pv, remaining_daily_cap)

income = today_pv × ₹25

leftPV -= matched_pv
rightPV -= matched_pv
totalPV += matched_pv
dailyPVUsed += today_pv
```

This ensures:
1. ✅ Matched pairs properly cleared from both legs
2. ✅ Total PV reflects true lifetime matching
3. ✅ Income respects daily capping
4. ✅ Daily cap tracking works correctly

---

**Status**: ✅ Fixed and Tested
**Date**: December 13, 2025
**Verified**: All test scenarios passing
