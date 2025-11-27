import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const guideContent = generateMLRequirementsGuide();
    
    return new NextResponse(guideContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="AI4Lassa_ML_Requirements_Guide.txt"',
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Guide generation error:', error);
    return NextResponse.json({ error: 'Guide generation failed' }, { status: 500 });
  }
}

function generateMLRequirementsGuide(): string {
  return `AI4Lassa ML Requirements Guide
=====================================

This guide outlines the requirements for uploading outbreak data to the AI4Lassa system.
Please follow these specifications to ensure successful data processing.

1. SUPPORTED FILE FORMATS
=========================
- CSV (Comma-Separated Values)
- JSON (JavaScript Object Notation)
- XLSX (Excel format)

2. REQUIRED DATA FIELDS
========================
All uploaded files must contain the following fields:

- Patient_ID: Unique identifier for each patient (string)
- Age: Patient age (number, 0-120)
- Sex: Patient gender (Male, Female, or Other)
- Admission_Date: Date of admission (YYYY-MM-DD format)
- Ward_ICU: Patient location (Ward or ICU)
- Outcome: Patient outcome (Discharged, Referred, Deceased, In Treatment, Recovered)
- Temperature_C: Body temperature in Celsius (30-45)
- Heart_Rate_bpm: Heart rate in beats per minute
- Respiratory_Rate: Respiratory rate
- Systolic_BP: Systolic blood pressure
- Diastolic_BP: Diastolic blood pressure
- SpO2: Blood oxygen saturation (0-100)
- GCS: Glasgow Coma Scale score
- Oxygen_Support: Whether oxygen support is needed (Yes/No)
- Bleeding: Whether bleeding is present (Yes/No)
- State: Nigerian state (must be from approved list)
- LGA: Local Government Area (string)
- Case_Status: Case classification (Confirmed, Probable, Suspected)
- Last_Update: Last update date (YYYY-MM-DD format)

3. VALID STATES
===============
Abia, Adamawa, Akwa Ibom, Anambra, Bauchi, Bayelsa, Benue, Borno, 
Cross River, Delta, Ebonyi, Edo, Ekiti, Enugu, Gombe, Imo, Jigawa, 
Kaduna, Kano, Katsina, Kebbi, Kogi, Kwara, Lagos, Nasarawa, Niger, 
Ogun, Ondo, Osun, Oyo, Plateau, Rivers, Sokoto, Taraba, Yobe, 
Zamfara, FCT

4. DATA VALIDATION RULES
========================
- Age must be between 0 and 120
- Sex must be one of: Male, Female, Other
- Ward_ICU must be either Ward or ICU
- Outcome must be one of: Discharged, Referred, Deceased, In Treatment, Recovered
- Case_Status must be one of: Confirmed, Probable, Suspected
- Temperature_C must be between 30 and 45
- SpO2 must be between 0 and 100
- Oxygen_Support must be Yes or No
- Bleeding must be Yes or No
- Dates must be in YYYY-MM-DD format
- All vital signs must be numeric values

5. FILE SIZE LIMITS
===================
- Maximum file size: 50MB
- Recommended record count: 1,000 - 100,000 records per file
- System validates first 100 records for performance

6. CSV FORMAT EXAMPLE
=====================
Patient_ID,Age,Sex,Admission_Date,Ward_ICU,Outcome,Temperature_C,Heart_Rate_bpm,Respiratory_Rate,Systolic_BP,Diastolic_BP,SpO2,GCS,Oxygen_Support,Bleeding,State,LGA,Case_Status,Last_Update
P001,59,Male,2025-09-01,Ward,Discharged,37.3,88,22,94,65,96,11,No,No,Borno,Maiduguri,Confirmed,2025-09-15
P002,40,Male,2025-09-03,ICU,Deceased,36.5,62,18,141,96,86,10,No,No,Borno,Jere,Confirmed,2025-09-16

7. JSON FORMAT EXAMPLE
=======================
[
  {
    "Patient_ID": "P001",
    "Age": 59,
    "Sex": "Male",
    "Admission_Date": "2025-09-01",
    "Ward_ICU": "Ward",
    "Outcome": "Discharged",
    "Temperature_C": 37.3,
    "Heart_Rate_bpm": 88,
    "Respiratory_Rate": 22,
    "Systolic_BP": 94,
    "Diastolic_BP": 65,
    "SpO2": 96,
    "GCS": 11,
    "Oxygen_Support": "No",
    "Bleeding": "No",
    "State": "Borno",
    "LGA": "Maiduguri",
    "Case_Status": "Confirmed",
    "Last_Update": "2025-09-15"
  }
]

8. DATA QUALITY REQUIREMENTS
============================
- No missing values in required fields
- Consistent data formats across all records
- Proper date formatting (YYYY-MM-DD)
- Numeric values for all vital signs
- Valid enumerated values (Ward/ICU, Yes/No, etc.)
- Patient_ID should be unique (recommended)

9. PRIVACY AND SECURITY
=======================
- All data must be anonymized
- No personally identifiable information (PII)
- Patient names, addresses, and contact information are prohibited
- Only use anonymous patient IDs (e.g., P001, P002)
- Data must comply with Nigerian data protection regulations

10. UPLOAD PROCESS
==================
1. Prepare your outbreak data according to the requirements above
2. Validate your data using the provided validation rules
3. Go to Admin Panel > Data Management > Data Upload
4. Select "Outbreak Data" as the upload type
5. Choose your CSV file and upload
6. System validates first 100 records for quick feedback
7. Review any validation errors and correct them
8. File is automatically forwarded to ML API for processing
9. Dashboard updates automatically after successful upload
10. All subscribers receive email notifications about the update

11. COMMON ERRORS TO AVOID
==========================
- Missing required fields (all 19 fields must be present)
- Invalid state names (must match approved list)
- Incorrect date formats (must be YYYY-MM-DD)
- Invalid Sex values (must be Male, Female, or Other)
- Invalid Ward_ICU values (must be Ward or ICU)
- Temperature outside valid range (30-45°C)
- Missing quotes around CSV fields containing commas
- Inconsistent data types (e.g., text in numeric fields)
- File size exceeding 50MB limit

12. SUPPORT
===========
For technical support or questions about data requirements:
- Contact: AI4Lassa Technical Team
- Email: support@ai4lassa.com
- Documentation: Available in the admin panel

Last Updated: ${new Date().toISOString()}
Version: 1.0
`;
}
