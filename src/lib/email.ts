// Email service integration using Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
// Temporarily use verified sender email until domain is verified
const FROM_EMAIL = process.env.EMAIL_FROM || 'AI4Lassa <no-reply@ai4lassa.org>';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@ai4lassa.com';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export const emailService = {
  // Send a single email
  async sendEmail({ to, subject, html, text }: SendEmailOptions) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      });

      if (error) {
        console.error('Email send error:', error);
        return { success: false, error };
      }

      console.log('Email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error };
    }
  },

  // Send welcome email to new subscriber
  async sendWelcomeEmail(email: string) {
    const subject = 'Welcome to AI4Lassa Updates!';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to AI4Lassa</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #c41e3a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI4Lassa</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Lassa Fever Outbreak Intelligence System</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #c41e3a; margin-top: 0;">Welcome! 🎉</h2>
            
            <p>Thank you for subscribing to AI4Lassa updates!</p>
            
            <p>You'll now receive notifications about:</p>
            <ul style="padding-left: 20px;">
              <li>New outbreak data and trends</li>
              <li>System updates and new features</li>
              <li>Critical alerts and advisories</li>
              <li>Important health information</li>
            </ul>
            
            <div style="background-color: white; padding: 20px; border-left: 4px solid #c41e3a; margin: 20px 0;">
              <p style="margin: 0;"><strong>What is AI4Lassa?</strong></p>
              <p style="margin: 10px 0 0 0;">AI4Lassa is an advanced outbreak intelligence system that uses artificial intelligence to track, predict, and provide real-time alerts about Lassa Fever outbreaks in Nigeria.</p>
            </div>
            
            <p>We're committed to keeping you informed and helping combat Lassa Fever through data-driven insights.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/live-alerts" 
                 style="background-color: #c41e3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View Live Alerts
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              You're receiving this email because you subscribed to AI4Lassa updates.<br>
              If you didn't subscribe or want to unsubscribe, <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #c41e3a;">click here</a>.
            </p>
            
            <p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">
              © 2025 AI4Lassa Project. All rights reserved.<br>
              <a href="mailto:${SUPPORT_EMAIL}" style="color: #c41e3a; text-decoration: none;">${SUPPORT_EMAIL}</a>
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  },

  // Send data update notification to all subscribers
  async sendUpdateNotification(email: string, updateDetails: {
    recordCount: number;
    uploadedBy: string;
    timestamp: string;
    states?: number;
    lgas?: number;
  }) {
    const subject = '📊 New Data Update Available - AI4Lassa';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Data Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #c41e3a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI4Lassa</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">New Data Update Available</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #c41e3a; margin-top: 0;">📊 Fresh Outbreak Data</h2>
            
            <p>New outbreak data has been uploaded to the AI4Lassa system!</p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #c41e3a; margin-top: 0; font-size: 16px;">Update Summary:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Records Added:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${updateDetails.recordCount.toLocaleString()}</td>
                </tr>
                ${updateDetails.states ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>States Affected:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${updateDetails.states}</td>
                </tr>
                ` : ''}
                ${updateDetails.lgas ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>LGAs Affected:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${updateDetails.lgas}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0;"><strong>Updated:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${new Date(updateDetails.timestamp).toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>⚠️ Important:</strong> This update may include new outbreak trends. Please review the latest data and alerts.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/database" 
                 style="background-color: #c41e3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-right: 10px;">
                View Database
              </a>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/live-alerts" 
                 style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                View Alerts
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666; text-align: center;">
              You're receiving this email because you subscribed to AI4Lassa updates.<br>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #c41e3a;">Unsubscribe</a>
            </p>
            
            <p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">
              © 2025 AI4Lassa Project. All rights reserved.<br>
              <a href="mailto:${SUPPORT_EMAIL}" style="color: #c41e3a; text-decoration: none;">${SUPPORT_EMAIL}</a>
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  },

  // Send bulk emails to all active subscribers
  async sendBulkUpdateNotifications(updateDetails: {
    recordCount: number;
    uploadedBy: string;
    timestamp: string;
    states?: number;
    lgas?: number;
  }) {
    try {
      // Import Supabase here to avoid circular dependencies
      const { supabaseAdmin } = await import('@/lib/supabase');
      
      // Get all active subscribers
      const { data: subscribers, error } = await (supabaseAdmin() as any)
        .from('email_subscriptions')
        .select('email')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching subscribers:', error);
        return { success: false, error, sent: 0, failed: 0 };
      }

      if (!subscribers || subscribers.length === 0) {
        console.log('No active subscribers to notify');
        return { success: true, sent: 0, failed: 0, message: 'No subscribers' };
      }

      console.log(`Sending update notifications to ${subscribers.length} subscribers...`);

      // Send emails in batches to avoid rate limits
      const batchSize = 10;
      let sent = 0;
      let failed = 0;

      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        
        const results = await Promise.allSettled(
          batch.map((sub: any) => this.sendUpdateNotification(sub.email, updateDetails))
        );

        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success) {
            sent++;
          } else {
            failed++;
            console.error(`Failed to send to ${batch[index].email}:`, 
              result.status === 'rejected' ? result.reason : result.value.error);
          }
        });

        // Add delay between batches to respect rate limits
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Email notification complete: ${sent} sent, ${failed} failed`);
      return { success: true, sent, failed };

    } catch (error) {
      console.error('Bulk email error:', error);
      return { success: false, error, sent: 0, failed: 0 };
    }
  }
};

