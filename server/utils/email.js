import { Resend } from 'resend';
import { env } from '../config/env.js';

let resend;
if (env.resendApiKey) {
  resend = new Resend(env.resendApiKey);
}

export const sendEmail = async (options) => {
  if (!env.resendApiKey) {
    console.warn('RESEND_API_KEY is missing. Email will not be sent.');
    console.log('Would have sent email to:', options.to);
    console.log('Subject:', options.subject);
    console.log('HTML:', options.html);
    return;
  }

  try {
    const data = await resend.emails.send({
      from: env.emailFrom || 'PromptVault <noreply@promptvault.app>', // Use your verified domain
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
