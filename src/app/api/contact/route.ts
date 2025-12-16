import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be less than 100 characters' },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { error: 'Subject must be less than 200 characters' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message must be less than 2000 characters' },
        { status: 400 }
      );
    }

    // Prepare contact data
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    };

    console.log('Processing contact form:', {
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject,
      timestamp: new Date().toISOString()
    });

    // Send email notification to AI4Lassa team (primary action)
    const emailResult = await emailService.sendContactMessage(contactData);

    if (!emailResult.success) {
      console.error('Failed to send contact email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again or contact us directly at ai4lassa@gmail.com' },
        { status: 500 }
      );
    }

    console.log('Contact email sent successfully');

    // Optionally save to database if Supabase is configured
    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      const { error: dbError } = await (supabaseAdmin() as any)
        .from('contact_submissions')
        .insert({
          ...contactData,
          status: 'new',
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.warn('Database save failed (non-critical):', dbError);
      } else {
        console.log('Contact form also saved to database');
      }
    } catch (dbError) {
      console.warn('Database not available (non-critical):', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
