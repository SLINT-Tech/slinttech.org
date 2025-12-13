interface EmailSender {
  email: string;
  name: string;
}

interface EmailRecipient {
  email: string;
  name?: string;
}

interface SendEmailParams {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: EmailSender;
}

interface BrevoResponse {
  messageId?: string;
  code?: string;
  message?: string;
}

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_SENDER = {
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@slinttech.org',
  name: process.env.BREVO_SENDER_NAME || 'SlintTech'
};

export class BrevoService {
  private apiKey: string;
  private sender: EmailSender;

  constructor(apiKey?: string, sender?: EmailSender) {
    this.apiKey = apiKey || process.env.BREVO_API_KEY || '';
    this.sender = sender || DEFAULT_SENDER;

    if (!this.apiKey) {
      throw new Error('Brevo API key is not configured');
    }
  }

  async sendEmail(params: SendEmailParams): Promise<BrevoResponse> {
    try {
      const payload = {
        sender: params.sender || this.sender,
        to: params.to,
        subject: params.subject,
        htmlContent: params.htmlContent,
        textContent: params.textContent || this.stripHtml(params.htmlContent)
      };

      const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to send email via Brevo:', error);
      throw error;
    }
  }

  async sendEmailSafe(params: SendEmailParams): Promise<boolean> {
    try {
      await this.sendEmail(params);
      return true;
    } catch (error) {
      console.error('Email send failed (non-blocking):', error);
      return false;
    }
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export const createBrevoService = (apiKey?: string): BrevoService => {
  return new BrevoService(apiKey);
};
