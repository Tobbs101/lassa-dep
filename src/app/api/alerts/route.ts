import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lgaId = searchParams.get('lga_id');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = (supabaseAdmin() as any)
      .from('outbreak_alerts')
      .select(`
        *,
        lga:lgas(name, state:states(name, code)),
        health_facility:health_facilities(name, type)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (lgaId) {
      query = query.eq('lga_id', lgaId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data: alerts, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }

    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin().auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user has permission to create alerts
    const { data: profile } = await (supabaseAdmin() as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !(profile as any).role || !['public_health_official', 'admin'].includes((profile as any).role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      severity,
      lga_id,
      health_facility_id,
      case_count,
      suspected_cases,
      confirmed_cases,
      deaths,
      ai_confidence_score,
      ml_model_version,
      data_sources,
      coordinates,
      radius_km
    } = body;

    const { data: alert, error } = await (supabaseAdmin() as any)
      .from('outbreak_alerts')
      .insert({
        title,
        description,
        severity,
        lga_id,
        health_facility_id,
        case_count,
        suspected_cases,
        confirmed_cases,
        deaths,
        ai_confidence_score,
        ml_model_version,
        data_sources,
        coordinates,
        radius_km,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
    }

    // Log the action
    await (supabaseAdmin() as any)
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'create_alert',
        resource_type: 'outbreak_alerts',
        resource_id: alert.id,
        new_values: alert,
      });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
