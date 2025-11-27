import { NextRequest, NextResponse } from 'next/server';
import { fastapiClient, mlUtils } from '@/lib/fastapi';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await (supabaseAdmin() as any).auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { spm } = body;

    // Get outbreak summary from ML engineer's API
    const summaryData = await fastapiClient.getOutbreakSummaryWithParams({ spm });
    
    // Format the data for frontend consumption
    const formattedData = mlUtils.formatOutbreakSummary(summaryData);
    
    // Store the summary data in database for historical tracking
    const { data: storedSummary, error: storeError } = await (supabaseAdmin() as any)
      .from('outbreak_summaries')
      .insert({
        summary_data: summaryData,
        generated_at: summaryData.metadata.generated_at,
        total_records: summaryData.metadata.total_records,
        user_id: user.id,
      })
      .select()
      .single();

    if (storeError) {
      console.error('Failed to store summary:', storeError);
    }

    // Return formatted response
    const response = {
      ...formattedData,
      summary_id: storedSummary?.id,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('ML summary error:', error);
    return NextResponse.json(
      { error: 'Failed to get outbreak summary' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spm = searchParams.get('spm');

    // Get outbreak summary from ML engineer's API
    const summaryData = await fastapiClient.getOutbreakSummaryWithParams({ spm: spm || undefined });
    
    // Format the data for frontend consumption
    const formattedData = mlUtils.formatOutbreakSummary(summaryData);
    
    return NextResponse.json({
      ...formattedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ML API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outbreak summary' },
      { status: 500 }
    );
  }
}
