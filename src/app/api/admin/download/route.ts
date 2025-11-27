import { NextRequest, NextResponse } from 'next/server';
import { fastapiClient } from '@/lib/fastapi';

export async function POST(request: NextRequest) {
  try {
    // Get the download type from request body
    const { downloadType, filters } = await request.json();
    
    // TODO: Add authentication and authorization checks
    // 1. Verify user authentication and authorization
    // 2. Check if user has permission to download this type of data
    
    // Fetch real data from ML API
    const mlData = await fastapiClient.getOutbreakSummary();
    
    let realData;
    let filename;
    let contentType;
    
    switch (downloadType) {
      case 'full_dataset':
        realData = generateFullDataset(mlData);
        filename = 'ai4lassa_full_dataset.csv';
        contentType = 'text/csv';
        break;
      case 'filtered_data':
        realData = generateFilteredData(mlData, filters);
        filename = 'ai4lassa_filtered_data.json';
        contentType = 'application/json';
        break;
      case 'research_data':
        realData = generateResearchData(mlData);
        filename = 'ai4lassa_research_data.csv';
        contentType = 'text/csv';
        break;
      case 'public_reports':
        realData = generatePublicReports(mlData);
        filename = 'ai4lassa_public_reports.txt';
        contentType = 'text/plain';
        break;
      default:
        return NextResponse.json({ error: 'Invalid download type' }, { status: 400 });
    }
    
    // Log the download for audit purposes
    console.log(`Dataset download requested: ${downloadType} at ${new Date().toISOString()}`);
    console.log(`Data source: ${mlData.metadata.data_file} (${mlData.metadata.total_records} records)`);
    
    // Return the file for download
    return new NextResponse(realData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}

// Real data generation functions using ML API data
function generateFullDataset(mlData: any): string {
  const headers = 'LGA,State,Cases,Deaths,Recovery_Rate,Last_Update,Age_Groups,Gender_Distribution\n';
  
  const rows = mlData.lga_breakdown.map((lga: any) => {
    const ageGroups = mlData.demographics.age_groups.map((ag: any) => `${ag.category}:${ag.count}`).join(';');
    const genderDist = mlData.demographics.gender.map((g: any) => `${g.category}:${g.count}`).join(';');
    
    return `"${lga.lga}","${lga.state}",${lga.cases},${lga.deaths},${lga.recovery_rate_percent}%,"${lga.last_update}","${ageGroups}","${genderDist}"`;
  });
  
  return headers + rows.join('\n');
}

function generateFilteredData(mlData: any, filters: Record<string, unknown>): string {
  const data = {
    filters: filters,
    metadata: {
      generated_at: mlData.metadata.generated_at,
      data_file: mlData.metadata.data_file,
      total_records: mlData.metadata.total_records
    },
    kpi: mlData.kpi,
    demographics: mlData.demographics,
    lga_breakdown: mlData.lga_breakdown,
    filtered_summary: {
      total_cases: mlData.kpi.confirmed_cases,
      total_deaths: mlData.kpi.deaths,
      total_recoveries: mlData.kpi.recoveries,
      states_affected: mlData.kpi.states_affected,
      lgas_affected: mlData.kpi.lgas_affected
    }
  };
  
  return JSON.stringify(data, null, 2);
}

function generateResearchData(mlData: any): string {
  const headers = 'Anonymized_ID,Age_Group,Gender,Count,Percentage,Location_Type,Outcome\n';
  
  const rows: string[] = [];
  let idCounter = 1;
  
  // Generate anonymized age group data
  mlData.demographics.age_groups.forEach((group: any) => {
    rows.push(`A${idCounter.toString().padStart(3, '0')},${group.category},N/A,${group.count},${group.percentage}%,Research,Anonymized`);
    idCounter++;
  });
  
  // Generate anonymized gender data
  mlData.demographics.gender.forEach((gender: any) => {
    rows.push(`A${idCounter.toString().padStart(3, '0')},N/A,${gender.category},${gender.count},${gender.percentage}%,Research,Anonymized`);
    idCounter++;
  });
  
  return headers + rows.join('\n');
}

function generatePublicReports(mlData: any): string {
  return `AI4Lassa Public Health Report
Generated: ${mlData.metadata.generated_at}
Data Source: ${mlData.metadata.data_file}
Total Records: ${mlData.metadata.total_records.toLocaleString()}

Summary:
- Total Cases: ${mlData.kpi.confirmed_cases.toLocaleString()}
- Total Recoveries: ${mlData.kpi.recoveries.toLocaleString()}
- Total Deaths: ${mlData.kpi.deaths.toLocaleString()}
- States Affected: ${mlData.kpi.states_affected}
- LGAs Affected: ${mlData.kpi.lgas_affected}
- Recovery Rate: ${mlData.kpi.recovery_rate_percent}%
- Fatality Rate: ${mlData.kpi.fatality_rate_percent}%

Demographics:
${mlData.demographics.age_groups.map((group: any) => `- ${group.category}: ${group.count.toLocaleString()} (${group.percentage}%)`).join('\n')}

Gender Distribution:
${mlData.demographics.gender.map((gender: any) => `- ${gender.category}: ${gender.count.toLocaleString()} (${gender.percentage}%)`).join('\n')}

Top Affected Areas:
${mlData.lga_breakdown.slice(0, 10).map((lga: any) => `- ${lga.lga}, ${lga.state}: ${lga.cases} cases, ${lga.deaths} deaths`).join('\n')}

This report is for public health information purposes only.
For detailed data access, contact the AI4Lassa team.`;
}
