/**
 * Test script to verify email sending functionality
 * Run with: node scripts/test-email-sending.js
 */

require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function testEmailConnection() {
  console.log('🔍 Testing SMTP configuration...\n');
  
  // Read SMTP settings from environment
  const config = {
    host: process.env.SMTP_HOST || process.env._APP_SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || process.env._APP_SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || process.env._APP_SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD || process.env._APP_SMTP_PASSWORD,
    },
  };

  console.log('📧 SMTP Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Secure: ${config.secure}`);
  console.log(`   User: ${config.auth.user}`);
  console.log(`   Password: ${'*'.repeat(config.auth.pass.length)}\n`);

  try {
    // Create transporter
    const transporter = nodemailer.createTransport(config);

    // Verify connection
    console.log('🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Send test email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'GCT Placement Portal'}" <${process.env.SMTP_FROM_EMAIL || config.auth.user}>`,
      to: config.auth.user, // Send to yourself for testing
      subject: 'Test Email - GCT Placement Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Email Test Successful!</h2>
          <p>This is a test email from the GCT Placement Portal notification system.</p>
          <p>If you're seeing this, your SMTP configuration is working correctly! 🎉</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Configuration Details:</strong><br>
            Host: ${config.host}<br>
            Port: ${config.port}<br>
            Secure: ${config.secure}<br>
          </p>
        </div>
      `,
      text: 'Email Test Successful! This is a test email from the GCT Placement Portal notification system.',
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Recipient: ${config.auth.user}`);
    console.log('\n✨ Your email system is ready to use!\n');
    
    return true;
  } catch (error) {
    console.error('❌ Error testing email:', error.message);
    console.error('\n📋 Troubleshooting tips:');
    console.error('   1. Check your SMTP credentials in .env.local');
    console.error('   2. Verify your Gmail App Password is correct');
    console.error('   3. Ensure "Less secure app access" is enabled (if using Gmail)');
    console.error('   4. Check your internet connection\n');
    return false;
  }
}

// Run the test
testEmailConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
