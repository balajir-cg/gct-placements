import nodemailer from 'nodemailer';

export interface EmailData {
  to: string;
  subject: string;
  jobTitle: string;
  companyName: string;
  jobId: string;
  deadline: string;
  type: 'new_job' | 'deadline_reminder';
}

// Create transporter using environment variables or Appwrite SMTP config
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    // Use SMTP credentials from environment
    const smtpHost = process.env.SMTP_HOST || process.env._APP_SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || process.env._APP_SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || process.env._APP_SMTP_USERNAME || '';
    const smtpPass = process.env.SMTP_PASSWORD || process.env._APP_SMTP_PASSWORD || '';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env._APP_SYSTEM_EMAIL_ADDRESS || smtpUser;
    const fromName = process.env.SMTP_FROM_NAME || process.env._APP_SYSTEM_EMAIL_NAME || 'GCT Placement Portal';

    if (!smtpUser || !smtpPass) {
      console.warn('⚠️  SMTP credentials not configured. Emails will not be sent.');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    console.log(`✅ Email transporter configured: ${smtpHost}:${smtpPort}`);
  }
  return transporter;
}

export class EmailService {
  /**
   * Send email notification
   */
  static async sendEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const transport = getTransporter();
      
      if (!transport) {
        console.log('📧 Email skipped (SMTP not configured):', data.to);
        return { success: false, error: 'SMTP not configured' };
      }

      const html = data.type === 'new_job' 
        ? this.generateNewJobEmail(data.jobTitle, data.companyName, data.jobId, data.deadline)
        : this.generateDeadlineReminderEmail(data.jobTitle, data.companyName, data.jobId, data.deadline);

      const text = this.htmlToText(html);

      await transport.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'GCT Placement Portal'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: data.to,
        subject: data.subject,
        text: text,
        html: html,
      });

      console.log(`✅ Email sent to: ${data.to}`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Email sending error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Alias for backward compatibility
   */
  static async logEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail(data);
  }

  /**
   * Generate HTML for new job notification
   */
  static generateNewJobEmail(jobTitle: string, companyName: string, jobId: string, deadline: string): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const jobUrl = `${appUrl}/jobs/${jobId}`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Job Posting</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">🎉 New Job Opportunity!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                Great news! A new job opportunity has been posted on the GCT Placement Portal.
              </p>
              
              <!-- Job Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 10px; color: #667eea; font-size: 22px;">${jobTitle}</h2>
                    <p style="margin: 0 0 15px; font-size: 18px; color: #764ba2; font-weight: bold;">${companyName}</p>
                    <p style="margin: 0; font-size: 14px; color: #666666;">
                      <strong>Application Deadline:</strong> ${new Date(deadline).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                Don't miss this opportunity! Review the job details and submit your application before the deadline.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${jobUrl}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      View Job Details & Apply
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                Best wishes,<br>
                <strong>GCT Placement Cell</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This is an automated notification from GCT Placement Portal.<br>
                Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Generate HTML for deadline reminder
   */
  static generateDeadlineReminderEmail(jobTitle: string, companyName: string, jobId: string, deadline: string): string {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const jobUrl = `${appUrl}/jobs/${jobId}`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Deadline Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px;">⏰ Deadline Tomorrow!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                This is a friendly reminder that the application deadline for the following job opportunity is <strong>tomorrow</strong>!
              </p>
              
              <!-- Job Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff5f5; border: 2px solid #f5576c; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 10px; color: #f5576c; font-size: 22px;">${jobTitle}</h2>
                    <p style="margin: 0 0 15px; font-size: 18px; color: #f093fb; font-weight: bold;">${companyName}</p>
                    <p style="margin: 0; font-size: 14px; color: #666666;">
                      <strong style="color: #f5576c;">⚠️ Application Closes:</strong> ${new Date(deadline).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                <strong>Act now!</strong> Don't let this opportunity slip away. Submit your application before it's too late.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${jobUrl}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      Apply Now
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                Best wishes,<br>
                <strong>GCT Placement Cell</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This is an automated reminder from GCT Placement Portal.<br>
                You're receiving this because you haven't applied yet. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text version from HTML
   */
  static htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
