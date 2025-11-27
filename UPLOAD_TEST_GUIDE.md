# CSV Upload Testing Guide

## Overview
This guide explains how to test the CSV upload functionality with the `extended_patient_outbreak_dataset_5000_diverse.csv` file.

## Prerequisites
- Admin access to the system (username: `admin`, password: `ai4lassa2025`)
- The CSV file: `extended_patient_outbreak_dataset_5000_diverse.csv` (located in project root)
- Development server running (`npm run dev`)

## What's Been Fixed

### 1. **CSV Validation Updated**
The upload route now correctly validates the extended patient outbreak dataset structure with all 19 required fields:
- Patient_ID, Age, Sex, Admission_Date, Ward_ICU, Outcome
- Temperature_C, Heart_Rate_bpm, Respiratory_Rate, Systolic_BP, Diastolic_BP
- SpO2, GCS, Oxygen_Support, Bleeding
- State, LGA, Case_Status, Last_Update

### 2. **ML API Integration**
- Added `uploadDataset()` method to FastAPI client (`src/lib/fastapi.ts`)
- Upload route now forwards validated data to ML API endpoint
- Fallback handling if ML API is unavailable

### 3. **Dashboard Auto-Refresh**
- Admin panel automatically refreshes dashboard data after successful upload
- Shows real-time feedback during upload process
- Updates KPIs and statistics with latest data

### 4. **Updated Sample Data**
- Admin panel sample data section now shows correct CSV structure
- ML Requirements Guide updated with new field definitions
- Validation rules match actual dataset structure

## Testing Steps

### Step 1: Start the Development Server
```bash
npm run dev
```

### Step 2: Access Admin Panel
1. Navigate to `http://localhost:3000/admin`
2. Login with credentials:
   - Username: `admin`
   - Password: `ai4lassa2025`

### Step 3: Review Sample Data Format
1. Go to "Data Management" tab
2. Scroll to "Sample Data Format" section
3. Verify the format matches your CSV file structure

### Step 4: Download ML Requirements Guide (Optional)
1. In the "Data Management" tab
2. Click "Download ML Requirements Guide"
3. Review the comprehensive guide for data format specifications

### Step 5: Upload the CSV File
1. Go to "Data Management" tab
2. Scroll to "Data Upload" section
3. Click "Choose File"
4. Select `extended_patient_outbreak_dataset_5000_diverse.csv`
5. Select Upload Type: "Outbreak Data"
6. Click "Upload Data"

### Step 6: Monitor Upload Process
Watch for status messages:
- "Uploading..." - File is being validated
- "Upload successful! Refreshing dashboard..." - Validation passed, updating data
- "Upload successful! Dashboard updated." - Complete!

### Step 7: Verify Dashboard Update
1. Check the dashboard statistics cards
2. Verify that:
   - Total Records count has updated
   - Confirmed Cases reflect new data
   - States/LGAs Affected counts are current
   - Recent Activity shows latest upload timestamp

## Expected Results

### ✅ Successful Upload Should Show:
- File validation passes (first 100 records checked)
- Record count: ~5000 records processed
- ML API status: "connected" (if ML API is running) or "fallback"
- Dashboard automatically refreshes with new statistics
- Success message displayed for 5 seconds

### ❌ Common Issues and Solutions:

#### Issue: "Data validation failed"
**Cause**: CSV structure doesn't match requirements
**Solution**: 
- Check that all 19 required fields are present
- Verify field names match exactly (case-sensitive)
- Ensure no extra/missing columns

#### Issue: "ML API upload failed"
**Cause**: ML API endpoint not available
**Solution**: 
- This is expected if ML API isn't running
- Upload will still succeed with fallback mode
- Data is validated and logged locally

#### Issue: "File too large"
**Cause**: File exceeds 50MB limit
**Solution**: 
- Split file into smaller chunks
- Remove unnecessary columns
- Compress data if possible

## File Structure Verification

Your CSV should have this header (first line):
```csv
Patient_ID,Age,Sex,Admission_Date,Ward_ICU,Outcome,Temperature_C,Heart_Rate_bpm,Respiratory_Rate,Systolic_BP,Diastolic_BP,SpO2,GCS,Oxygen_Support,Bleeding,State,LGA,Case_Status,Last_Update
```

Sample data row:
```csv
P001,59,Male,2025-09-01,Ward,Discharged,37.3,88,22,94,65,96,11,No,No,Borno,Maiduguri,Confirmed,2025-09-15
```

## Validation Rules Applied

### Field-Specific Validation (First 100 Records):
- **Age**: 0-120 years
- **Sex**: Male, Female, or Other
- **Ward_ICU**: Ward or ICU
- **Outcome**: Discharged, Referred, Deceased, In Treatment, or Recovered
- **Temperature_C**: 30-45°C
- **Case_Status**: Confirmed, Probable, or Suspected
- **State**: Must be valid Nigerian state
- **SpO2**: 0-100%

### Performance Optimization:
- System validates first 100 records for quick feedback
- Shows up to 20 validation errors (to avoid overwhelming output)
- Total record count is still accurate

## ML API Integration

### If ML API is Running:
The upload endpoint will:
1. Validate CSV locally
2. Forward data to `{FASTAPI_URL}/upload`
3. Wait for ML API processing confirmation
4. Return success with ML API status

### If ML API is Not Running:
The upload will:
1. Validate CSV locally
2. Attempt ML API connection
3. Log the error (non-blocking)
4. Continue with local processing
5. Return success with fallback status

## Environment Variables

Ensure these are set in `.env.local` (optional for testing):
```env
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
FASTAPI_API_KEY=your_api_key_here
```

If not set, defaults to `http://localhost:8000` (standard FastAPI local dev server).

## Troubleshooting

### Check Browser Console
Open DevTools (F12) and check Console tab for:
- Upload progress logs
- ML API connection status
- Validation error details
- Dashboard refresh status

### Check Server Logs
Terminal where `npm run dev` is running will show:
- File upload received
- Validation results
- ML API connection attempts
- Record counts processed

### Manual Validation
To manually test CSV structure:
```bash
# Check number of columns in header
head -n 1 extended_patient_outbreak_dataset_5000_diverse.csv | tr ',' '\n' | wc -l
# Should return: 19

# Check total records
wc -l extended_patient_outbreak_dataset_5000_diverse.csv
# Should return: ~5001 (including header)
```

## Next Steps After Successful Upload

1. **View Dashboard**: Check updated statistics on dashboard tab
2. **Download Reports**: Use download functionality to export processed data
3. **Database Page**: Navigate to `/database` to see geographic breakdown
4. **Alerts**: Check if any new alerts were generated based on the data

## Files Modified for This Feature

1. `src/app/api/admin/upload/route.ts` - Updated validation and ML API integration
2. `src/lib/fastapi.ts` - Added uploadDataset() method
3. `src/app/admin/page.tsx` - Added dashboard refresh after upload
4. `src/app/api/admin/guide/route.ts` - Updated requirements guide
5. `UPLOAD_TEST_GUIDE.md` - This testing guide

## Support

If you encounter issues:
1. Check this guide first
2. Review browser console logs
3. Review server terminal logs
4. Verify CSV file structure matches requirements
5. Ensure you're logged in as admin

---

**Last Updated**: October 8, 2025
**Version**: 2.0 - Extended Patient Outbreak Dataset Support

