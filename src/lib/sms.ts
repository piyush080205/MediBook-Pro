'use server';

import { Twilio } from 'twilio';

export async function sendSms(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.error('Twilio environment variables are not set.');
    throw new Error('SMS service is not configured.');
  }

  const client = new Twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({ body, from, to });
    console.log(`SMS sent successfully to ${to}. Message SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error);
    // In a real app, you might want to throw a more specific error
    // or handle it in a way that doesn't expose internal details.
    throw new Error('Could not send SMS.');
  }
}
