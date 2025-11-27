import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { emailService } from '@/lib/email';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  console.log('Subscription request received');
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingSubscription, error: checkError } = await (supabaseAdmin() as any)
      .from('email_subscriptions')
      .select('id, email, is_active')
      .eq('email', trimmedEmail)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking subscription:', checkError);
      throw new Error('Failed to check subscription status');
    }

    // If email exists and is active
    if (existingSubscription && existingSubscription.is_active) {
      return NextResponse.json(
        { 
          message: 'You are already subscribed to updates!',
          alreadySubscribed: true 
        },
        { status: 200 }
      );
    }

    // If email exists but was unsubscribed, reactivate it
    if (existingSubscription && !existingSubscription.is_active) {
      const { error: updateError } = await (supabaseAdmin() as any)
        .from('email_subscriptions')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', trimmedEmail);

      if (updateError) {
        console.error('Error reactivating subscription:', updateError);
        throw new Error('Failed to reactivate subscription');
      }

      return NextResponse.json({
        success: true,
        message: 'Welcome back! Your subscription has been reactivated.',
        reactivated: true
      });
    }

    // Create new subscription
    const subscriptionData = {
      email: trimmedEmail,
      is_active: true,
      metadata: {
        source: 'homepage',
        user_agent: request.headers.get('user-agent') || 'unknown',
        subscribed_from_ip: request.headers.get('x-forwarded-for') || 
                           request.headers.get('x-real-ip') || 
                           'unknown'
      }
    };

    console.log('Inserting subscription data:', subscriptionData);
    const { data, error: insertError } = await (supabaseAdmin() as any)
      .from('email_subscriptions')
      .insert(subscriptionData as any)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating subscription:', insertError);
      throw new Error('Failed to create subscription');
    }

    console.log(`New subscription: ${trimmedEmail} at ${new Date().toISOString()}`);

    // Return success response first
    const response = NextResponse.json({
      success: true,
      message: 'Successfully subscribed! Check your email for a welcome message.',
      subscriptionId: data?.id
    });

    // Send welcome email asynchronously (truly non-blocking)
    setImmediate(() => {
      console.log(`Attempting to send welcome email to: ${trimmedEmail}`);
      emailService.sendWelcomeEmail(trimmedEmail).catch(err => {
        console.error('Failed to send welcome email:', err);
        console.error('Email service error details:', {
          message: err.message,
          stack: err.stack,
          resendApiKey: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
          emailFrom: process.env.EMAIL_FROM || 'Not set'
        });
      });
    });

    return response;

  } catch (error) {
    console.error('Subscription error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set'
    });
    return NextResponse.json(
      { 
        error: 'Failed to subscribe. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    const { data, error } = await (supabaseAdmin() as any)
      .from('email_subscriptions')
      .select('id, email, is_active, subscribed_at')
      .eq('email', trimmedEmail)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking subscription:', error);
      throw new Error('Failed to check subscription');
    }

    if (!data) {
      return NextResponse.json({
        subscribed: false,
        message: 'Email not found in subscription list'
      });
    }

    return NextResponse.json({
      subscribed: data.is_active,
      subscribedAt: data.subscribed_at,
      message: data.is_active ? 'Active subscription' : 'Subscription inactive'
    });

  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}

