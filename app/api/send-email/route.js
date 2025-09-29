import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, text, html } = body;

    // Validate required fields
    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Send email using our utility function
    const result = await sendEmail({ to, subject, text, html });

    return new Response(
      JSON.stringify({ 
        message: 'Email sent successfully', 
        messageId: result.messageId 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send email';
    if (error.message) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        message: errorMessage
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
}