import type { Context } from '@netlify/functions';
import { createBrevoService } from './utils/brevo-service';

export default async (req: Request, context: Context) => {
  try {
    console.log('Test email background function invoked');

    const brevoService = createBrevoService();

    const testEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                      SlintTech Test Email
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                      Background Function Test
                    </h2>
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      This is a test email from the Netlify background function.
                    </p>
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      <strong>Timestamp:</strong> ${new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                    <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px;">
                      <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                        If you received this email, the background function is working correctly!
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px; background-color: #f8f9fa; text-align: center;">
                    <p style="margin: 0; color: #999999; font-size: 14px;">
                      © ${new Date().getFullYear()} SlintTech. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await brevoService.sendEmail({
      to: [{ email: 'sadosap473@roastic.com', name: 'Test User' }],
      subject: 'SlintTech Background Function Test',
      htmlContent: testEmailHtml
    });

    console.log('Test email sent successfully to sadosap473@roastic.com');

    return new Response(JSON.stringify({
      success: true,
      message: 'Test email sent successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('Test email background function error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to send test email',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
