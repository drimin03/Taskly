import { createTransport } from 'nodemailer';

// Email configuration that can be easily changed for different providers
const getEmailConfig = () => {
  // Use environment variables with fallbacks for Gmail configuration
  const config = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465", 10),
    secure: process.env.SMTP_SECURE === 'true' || (process.env.SMTP_PORT === "465"), // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };

  return config;
};

/**
 * Sends an email using the configured SMTP provider
 * @param options - Email options
 * @param options.to - Recipient email address
 * @param options.subject - Email subject
 * @param options.text - Plain text body
 * @param options.html - HTML body
 * @returns Transporter response
 */
export async function sendEmail({ to, subject, text, html }: { 
  to: string; 
  subject: string; 
  text?: string; 
  html?: string; 
}) {
  try {
    console.log("Attempting to send email with config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.EMAIL_USER ? "***" : "NOT SET"
    });
    
    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required. Current values - EMAIL_USER: ' + 
        (process.env.EMAIL_USER ? 'SET' : 'NOT SET') + 
        ', EMAIL_PASS: ' + (process.env.EMAIL_PASS ? 'SET' : 'NOT SET'));
    }

    // Create transporter with current configuration
    const transporter = createTransport(getEmailConfig());
    
    console.log("Transporter created successfully");

    // Verify connection configuration
    await transporter.verify();
    console.log("Transporter verified successfully");

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    
    console.log("Email sent successfully. Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Sends a password reset email
 * @param to - Recipient email address
 * @param resetUrl - Password reset URL
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = "Password Reset Request";
  const text = `You requested a password reset. Click here to reset: ${resetUrl}\n\nIf you didn't request this, please ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset.</p>
      <p>
        <a href="${resetUrl}" 
           style="background-color: #007bff; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <p><small>If you didn't request this, please ignore this email.</small></p>
    </div>
  `;

  console.log("Sending password reset email to:", to);
  return await sendEmail({ to, subject, text, html });
}