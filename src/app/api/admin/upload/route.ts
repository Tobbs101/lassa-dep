import { NextRequest, NextResponse } from 'next/server';
import { fastapiClient } from '@/lib/fastapi';
import { emailService } from '@/lib/email';

// ML Requirements for data upload - Updated to match extended_patient_outbreak_dataset structure
const ML_REQUIREMENTS = {
  requiredFields: [
    'Patient_ID', 'Age', 'Sex', 'Admission_Date', 'Ward_ICU', 'Outcome', 
    'Temperature_C', 'Heart_Rate_bpm', 'Respiratory_Rate', 'Systolic_BP', 
    'Diastolic_BP', 'SpO2', 'GCS', 'Oxygen_Support', 'Bleeding', 
    'State', 'LGA', 'Case_Status', 'Last_Update'
  ],
  validStates: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 
    'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 
    'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT'
  ],
  validGenders: ['Male', 'Female', 'Other'],
  validOutcomes: ['Discharged', 'Referred', 'Deceased', 'In Treatment', 'Recovered'],
  validCaseStatus: ['Confirmed', 'Probable', 'Suspected'],
  validWardICU: ['Ward', 'ICU'],
  validYesNo: ['Yes', 'No'],
  maxFileSize: 50 * 1024 * 1024, // 50MB - increased for larger datasets
  supportedFormats: ['csv', 'json', 'xlsx']
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('uploadType') as string;
    
    if (!file) {
      return NextResponse.json({ 
        error: 'No file provided',
        details: 'Please select a file to upload'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > ML_REQUIREMENTS.maxFileSize) {
      return NextResponse.json({ 
        error: 'File too large',
        details: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${ML_REQUIREMENTS.maxFileSize / 1024 / 1024}MB`
      }, { status: 400 });
    }

    // Validate file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ML_REQUIREMENTS.supportedFormats.includes(fileExtension)) {
      return NextResponse.json({ 
        error: 'Unsupported file format',
        details: `Supported formats: ${ML_REQUIREMENTS.supportedFormats.join(', ')}. Received: ${fileExtension}`
      }, { status: 400 });
    }

    // Read and validate file content
    const fileContent = await file.text();
    const validationResult = await validateFileContent(fileContent, fileExtension, uploadType);
    
    if (!validationResult.isValid) {
      return NextResponse.json({ 
        error: 'Data validation failed',
        details: validationResult.errors.slice(0, 10), // Limit errors shown
        totalErrors: validationResult.errors.length,
        requirements: ML_REQUIREMENTS
      }, { status: 400 });
    }

    // Upload to ML API for processing
    let mlUploadResult;
    try {
      mlUploadResult = await fastapiClient.uploadDataset(file, uploadType);
      console.log('ML API upload successful:', mlUploadResult);
    } catch (mlError) {
      console.error('ML API upload failed:', mlError);
      // Continue even if ML upload fails - we'll use local data
      mlUploadResult = { 
        success: false, 
        error: mlError instanceof Error ? mlError.message : 'ML API upload failed',
        fallback: true 
      };
    }

    console.log(`File upload successful: ${file.name} (${file.size} bytes) at ${new Date().toISOString()}`);
    console.log(`Upload type: ${uploadType}, Records: ${validationResult.recordCount}`);

    // Send email notifications to all subscribers (non-blocking)
    const timestamp = new Date().toISOString();
    emailService.sendBulkUpdateNotifications({
      recordCount: validationResult.recordCount,
      uploadedBy: 'Admin',
      timestamp: timestamp,
    }).catch(err => {
      console.error('Failed to send subscriber notifications:', err);
    });

    return NextResponse.json({ 
      success: true,
      message: 'File uploaded and validated successfully. Notifications sent to subscribers.',
      details: {
        filename: file.name,
        size: file.size,
        recordCount: validationResult.recordCount,
        uploadType: uploadType,
        mlApiStatus: mlUploadResult?.success ? 'connected' : 'fallback',
        processedAt: timestamp
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: 'An error occurred while processing the file'
    }, { status: 500 });
  }
}

async function validateFileContent(content: string, format: string, uploadType: string): Promise<{
  isValid: boolean;
  errors: string[];
  recordCount: number;
}> {
  const errors: string[] = [];
  let recordCount = 0;

  try {
    if (format === 'csv') {
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        errors.push('CSV file must contain at least a header row and one data row');
        return { isValid: false, errors, recordCount: 0 };
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const missingFields = ML_REQUIREMENTS.requiredFields.filter(field => 
        !headers.some(header => header.toLowerCase() === field.toLowerCase())
      );

      if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate a sample of data rows (first 100 to avoid performance issues)
      const rowsToValidate = Math.min(lines.length - 1, 100);
      let validationErrors = 0;
      const maxErrorsToShow = 20;
      
      for (let i = 1; i <= rowsToValidate && validationErrors < maxErrorsToShow; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        if (row.length !== headers.length && row.filter(cell => cell).length > 0) {
          errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${row.length})`);
          validationErrors++;
          continue;
        }

        const rowData = Object.fromEntries(headers.map((header, index) => [header, row[index]]));
        
        // Validate State
        if (rowData.State && rowData.State !== '' && !ML_REQUIREMENTS.validStates.includes(rowData.State)) {
          errors.push(`Row ${i + 1}: Invalid State '${rowData.State}'`);
          validationErrors++;
        }

        // Validate Sex
        if (rowData.Sex && rowData.Sex !== '' && !ML_REQUIREMENTS.validGenders.includes(rowData.Sex)) {
          errors.push(`Row ${i + 1}: Invalid Sex '${rowData.Sex}'. Must be Male, Female, or Other`);
          validationErrors++;
        }

        // Validate Outcome
        if (rowData.Outcome && rowData.Outcome !== '' && !ML_REQUIREMENTS.validOutcomes.includes(rowData.Outcome)) {
          errors.push(`Row ${i + 1}: Invalid Outcome '${rowData.Outcome}'`);
          validationErrors++;
        }

        // Validate Case_Status
        if (rowData.Case_Status && rowData.Case_Status !== '' && !ML_REQUIREMENTS.validCaseStatus.includes(rowData.Case_Status)) {
          errors.push(`Row ${i + 1}: Invalid Case_Status '${rowData.Case_Status}'`);
          validationErrors++;
        }

        // Validate Ward_ICU
        if (rowData.Ward_ICU && rowData.Ward_ICU !== '' && !ML_REQUIREMENTS.validWardICU.includes(rowData.Ward_ICU)) {
          errors.push(`Row ${i + 1}: Invalid Ward_ICU '${rowData.Ward_ICU}'. Must be Ward or ICU`);
          validationErrors++;
        }

        // Validate Age
        if (rowData.Age && rowData.Age !== '') {
          const age = Number(rowData.Age);
          if (isNaN(age) || age < 0 || age > 120) {
            errors.push(`Row ${i + 1}: Invalid Age '${rowData.Age}'. Must be 0-120`);
            validationErrors++;
          }
        }

        // Validate vital signs ranges
        if (rowData.Temperature_C && rowData.Temperature_C !== '') {
          const temp = Number(rowData.Temperature_C);
          if (isNaN(temp) || temp < 30 || temp > 45) {
            errors.push(`Row ${i + 1}: Invalid Temperature '${rowData.Temperature_C}'`);
            validationErrors++;
          }
        }

        recordCount++;
      }
      
      // Count all records, not just validated ones
      recordCount = lines.length - 1;

    } else if (format === 'json') {
      const data = JSON.parse(content);
      
      if (!Array.isArray(data)) {
        errors.push('JSON file must contain an array of records');
        return { isValid: false, errors, recordCount: 0 };
      }

      if (data.length === 0) {
        errors.push('JSON file must contain at least one record');
        return { isValid: false, errors, recordCount: 0 };
      }

      // Validate first record to check required fields
      const firstRecord = data[0];
      const missingFields = ML_REQUIREMENTS.requiredFields.filter(field => 
        !Object.keys(firstRecord).some(key => key.toLowerCase().includes(field.toLowerCase()))
      );

      if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate all records
      data.forEach((record, index) => {
        // Validate state
        if (record.state && !ML_REQUIREMENTS.validStates.includes(record.state)) {
          errors.push(`Record ${index + 1}: Invalid state '${record.state}'. Must be one of: ${ML_REQUIREMENTS.validStates.join(', ')}`);
        }

        // Validate gender
        if (record.gender && !ML_REQUIREMENTS.validGenders.includes(record.gender)) {
          errors.push(`Record ${index + 1}: Invalid gender '${record.gender}'. Must be one of: ${ML_REQUIREMENTS.validGenders.join(', ')}`);
        }

        // Validate outcome
        if (record.outcome && !ML_REQUIREMENTS.validOutcomes.includes(record.outcome)) {
          errors.push(`Record ${index + 1}: Invalid outcome '${record.outcome}'. Must be one of: ${ML_REQUIREMENTS.validOutcomes.join(', ')}`);
        }

        // Note: risk_level validation removed as it's not part of the current dataset structure

        // Validate age
        if (record.age && (isNaN(Number(record.age)) || Number(record.age) < 0 || Number(record.age) > 120)) {
          errors.push(`Record ${index + 1}: Invalid age '${record.age}'. Must be a number between 0 and 120`);
        }

        recordCount++;
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      recordCount
    };

  } catch (error) {
    errors.push(`File parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors, recordCount: 0 };
  }
}
