import { corsHeaders } from '../_shared/cors.ts';

interface EmailRequest {
  email: string;
  fullName: string;
  role: string;
  membershipCategory: string;
  careerPath: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, fullName, role, membershipCategory, careerPath }: EmailRequest = await req.json();

    // Validate required fields
    if (!email || !fullName || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create email content based on role
    const isAdmin = role === 'Admin';
    const isMentor = role === 'Mentor';
    const isMentee = role === 'Mentee';

    const subject = `Welcome to SlintTech - Account Under Review`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SlintTech</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #008080; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px 20px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
          .status-card { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .checklist { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .checklist ul { margin: 0; padding-left: 20px; }
          .checklist li { margin: 8px 0; }
          .button { display: inline-block; background: #008080; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
          .highlight { color: #008080; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SlintTech!</h1>
            <p>Your journey to excellence begins here</p>
          </div>
          
          <div class="content">
            <h2>Hello ${fullName}!</h2>
            
            <p>Thank you for joining SlintTech as a <strong>${role}</strong>. We're excited to have you in our community!</p>
            
            <div class="status-card">
              <h3>🔍 Account Under Review</h3>
              <p>Your account is currently being reviewed by our admin team. This process typically takes 1-2 business days.</p>
            </div>
            
            <h3>📋 Your Application Details:</h3>
            <ul>
              <li><strong>Role:</strong> ${role}</li>
              <li><strong>Membership Category:</strong> ${membershipCategory}</li>
              ${careerPath ? `<li><strong>${isMentor ? 'Specialization' : 'Career Path'}:</strong> ${careerPath}</li>` : ''}
              <li><strong>Email:</strong> ${email}</li>
            </ul>
            
            <div class="checklist">
              <h3>✅ What happens next?</h3>
              <ul>
                <li>Our admin team will review your application and signed contract</li>
                <li>You'll receive an email notification with the approval status</li>
                <li>${isMentor 
                  ? 'Once approved, you can access your mentor dashboard and start teaching' 
                  : 'Once approved, you can access your dashboard and start learning'
                }</li>
                ${isMentor || isMentee ? '<li>You may be required to complete a one-time membership payment</li>' : ''}
              </ul>
            </div>
            
            <h3>🎯 ${isMentor ? 'What you can do as a mentor:' : isMentee ? 'What you get with membership:' : 'Admin privileges:'}</h3>
            <ul>
              ${isMentor ? `
                <li>Create and manage courses for your specialization</li>
                <li>Guide and mentor students in their learning journey</li>
                <li>Assign tasks and provide feedback on submissions</li>
                <li>Access to mentor community and resources</li>
                <li>Track mentee progress and engagement</li>
              ` : isMentee ? `
                <li>Access to all courses and learning materials</li>
                <li>Personal mentorship and guidance from experts</li>
                <li>Community Discord access for peer learning</li>
                <li>Project assignments with detailed feedback</li>
                <li>Certificate upon successful completion</li>
              ` : `
                <li>Full user management and approval system</li>
                <li>Mentor and mentee assignment capabilities</li>
                <li>Course and content oversight</li>
                <li>Payment and membership management</li>
                <li>Community moderation tools</li>
              `}
            </ul>
            
            <p>If you have any questions about your application status, feel free to contact our support team at <a href="mailto:contact@slinttech.org" class="highlight">contact@slinttech.org</a>.</p>
            
            <p>Welcome to the SlintTech family!</p>
            
            <p>Best regards,<br>
            <strong>The SlintTech Team</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 SlintTech. All rights reserved.</p>
            <p>Building the next generation of tech leaders</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // In a real implementation, you would use a service like:
    // - Resend (recommended for Supabase)
    // - SendGrid
    // - Mailgun
    // - AWS SES
    
    // For now, we'll simulate the email sending
    console.log('Email would be sent to:', email);
    console.log('Subject:', subject);
    console.log('HTML Content:', htmlContent);

    // Simulate email service response
    const emailResponse = {
      success: true,
      messageId: `msg_${Date.now()}`,
      recipient: email
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Signup notification email sent successfully',
        data: emailResponse
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error sending signup notification:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to send signup notification email'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});