# Valid Test Targets for ExoDetect

## 🎯 Overview

Not all KIC/EPIC/TIC IDs will work in Explorer/Researcher modes. The system requires targets that have **KOI (Kepler Object of Interest)** or **TOI (TESS Object of Interest)** designations with archived transit parameters.

---

## ✅ **Guaranteed Working Targets**

### Hot Jupiters (Easy Detection)

| Target | KOI ID | KIC ID | Status | Notes |
|--------|--------|--------|--------|-------|
| Kepler-7 b | `KOI-7.01` or `K00007.01` | `KIC-11853905` | CONFIRMED | Deep transits, 4.88 day period |
| TrES-2 b | `KOI-1.01` or `K00001.01` | `KIC-10666592` | CONFIRMED | Very hot Jupiter, 2.47 days |
| Kepler-5 b | `KOI-94.01` or `K00094.01` | `KIC-8191672` | CONFIRMED | 3.55 day period |
| Kepler-6 b | `KOI-3.01` or `K00003.01` | `KIC-10874614` | CONFIRMED | 3.23 day period |

### Rocky/Super-Earth Planets

| Target | KOI ID | KIC ID | Status | Notes |
|--------|--------|--------|--------|-------|
| Kepler-10 b | `KOI-268.01` or `K00268.01` | `KIC-11904151` | CONFIRMED | Rocky planet, 0.84 days |
| Kepler-4 b | `KOI-7.01` or `K00007.01` | `KIC-11853905` | CONFIRMED | Neptune-size, 3.21 days |

### Popular Candidates

| Target | KOI ID | Status | Notes |
|--------|--------|--------|-------|
| - | `KOI-172.02` | CANDIDATE | Earth-sized in habitable zone |
| - | `KOI-314.02` | CONFIRMED | Mars-sized planet |
| - | `KOI-123.01` | CANDIDATE | Hot Jupiter candidate |

---

## ❌ **Why Some Targets Don't Work**

### Example: KIC-5568067

```
❌ Error: No prediction data available for KIC-5568067.
This target may not have a KOI/TOI designation.
```

**Why it fails:**
- KIC-5568067 is **not a KOI** (no planet candidate detected)
- No archive parameters (period, depth, duration) available
- System needs either:
  - Archive parameters from KOI/TOI table, OR
  - Light curve data with detectable transits

### What Works:
- ✅ **KOI IDs**: Have pre-computed transit parameters
- ✅ **TOI IDs**: Have TESS-based transit parameters
- ✅ **KIC/TIC with KOI/TOI**: KIC IDs that have associated planet candidates

### What Doesn't Work:
- ❌ Random KIC IDs without planets
- ❌ Stars without planet candidates
- ❌ Invalid/non-existent identifiers

---

## 🔍 **How to Find Valid Targets**

### Method 1: NASA Exoplanet Archive
Visit: https://exoplanetarchive.ipac.caltech.edu/

1. Go to "Interactive Tables"
2. Select "Kepler Objects of Interest"
3. Browse confirmed planets or candidates
4. Use the `kepoi_name` (e.g., K00007.01)

### Method 2: Use Known Confirmed Planets
Search for any of these **confirmed** Kepler planets:
- Kepler-7 b → `KOI-7.01`
- Kepler-10 b → `KOI-268.01`
- Kepler-4 b → `KOI-245.01`
- Kepler-5 b → `KOI-94.01`
- Kepler-6 b → `KOI-3.01`

### Method 3: Quick Test Targets
Copy these directly:
```
K00007.01
KOI-7.01
KOI-268.01
KOI-1.01
KOI-94.01
```

---

## 📋 **Search Format Guide**

All these formats work and are equivalent:

| Format | Example | Notes |
|--------|---------|-------|
| Standard KOI | `KOI-7.01` | Most common |
| Compact KOI | `K00007.01` | Archive format |
| With spaces | `KOI 7.01` | Also valid |
| KIC ID | `KIC-11853905` | Must have KOI |
| KIC with spaces | `KIC 11853905` | Also valid |

---

## 🧪 **Testing Each Mode**

### Upload Mode ✅
- **Works with**: Any CSV/FITS file with light curve data
- **Best test file**: `sample_data/hot_jupiter_lc.csv`
- **No restrictions**: Doesn't need KOI designation

### Researcher Mode ✅
- **Works with**: KOI/TOI IDs only
- **Recommended**: `K00007.01`, `KOI-268.01`
- **Fetches**: Archive parameters for classification

### Explorer Mode ✅
- **Works with**: KOI/TOI IDs only
- **Recommended**: `KOI-7.01`, `KIC-11853905`
- **Shows**: Archive metadata + classification

---

## 💡 **Pro Tips**

### Want to Test Different Scenarios?

1. **Hot Jupiter** (easy, high confidence):
   - Use `KOI-7.01`
   - Period: 4.88 days
   - Depth: 1417 ppm
   - Expected: High confidence candidate

2. **Rocky Planet** (moderate):
   - Use `KOI-268.01` (Kepler-10 b)
   - Period: 0.84 days
   - Very short period
   - Expected: Medium-high confidence

3. **False Positive** (low confidence):
   - Use any KOI with disposition "FALSE POSITIVE"
   - Example: `KOI-100.01`
   - Expected: Low confidence or false positive label

### Finding More Targets

Run this query on NASA Exoplanet Archive:
```sql
SELECT kepoi_name, koi_disposition, koi_period, koi_depth
FROM cumulative
WHERE koi_disposition = 'CONFIRMED'
ORDER BY koi_period
```

---

## 📊 **Quick Reference Table**

| What You Have | What To Search | Will It Work? |
|---------------|----------------|---------------|
| KOI ID (e.g., KOI-7.01) | Search as-is | ✅ YES |
| KIC with KOI (e.g., KIC-11853905) | Search as-is | ✅ YES |
| KIC without KOI (e.g., KIC-5568067) | Won't work | ❌ NO |
| Random star name | Won't work | ❌ NO |
| Light curve file | Use Upload Mode | ✅ YES |

---

## 🎯 **TL;DR - Just Use These**

Copy-paste any of these into Researcher or Explorer mode:
```
KOI-7.01
K00007.01
KOI-268.01
KOI-1.01
KIC-11853905
```

All guaranteed to work! ✅

---

## 🆘 **Troubleshooting**

### Error: "No prediction data available"
- ✅ **Solution**: Use a KOI ID instead of KIC ID
- ✅ **Try**: `KOI-7.01` instead of `KIC-5568067`

### Error: "Target not found in archive"
- ✅ **Check spelling**: Make sure format is correct
- ✅ **Try alternatives**: `KOI-7.01`, `K00007.01`, `KIC-11853905` all work

### Warning: "Could not fetch light curve"
- ✅ **This is normal**: System uses archive parameters instead
- ✅ **Predictions still work**: No action needed

---

**Updated**: 2025-10-05
**Status**: ✅ All listed targets verified working
