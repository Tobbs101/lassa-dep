import { NextRequest, NextResponse } from 'next/server';
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const relatedTable = formData.get('related_table') as string;
    const relatedId = formData.get('related_id') as string;
    const isPublic = formData.get('is_public') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${relatedTable || 'general'}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await (supabaseAdmin() as any).storage
      .from('ai4lassa-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL if file is public
    let publicUrl = null;
    if (isPublic) {
      const { data: urlData } = (supabaseAdmin() as any).storage
        .from('ai4lassa-documents')
        .getPublicUrl(filePath);
      publicUrl = urlData.publicUrl;
    }

    // Store file metadata in database
    const { data: document, error: dbError } = await (supabaseAdmin() as any)
      .from('documents')
      .insert({
        filename: fileName,
        original_filename: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
        related_table: relatedTable,
        related_id: relatedId,
        is_public: isPublic,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await (supabaseAdmin() as any).storage
        .from('ai4lassa-documents')
        .remove([filePath]);
      
      return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 });
    }

    return NextResponse.json({
      document: {
        ...document,
        public_url: publicUrl,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const relatedTable = searchParams.get('related_table');
    const relatedId = searchParams.get('related_id');

    let query = (supabaseAdmin() as any)
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (relatedTable) {
      query = query.eq('related_table', relatedTable);
    }
    if (relatedId) {
      query = query.eq('related_id', relatedId);
    }

    const { data: documents, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
