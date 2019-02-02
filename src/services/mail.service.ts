import * as sendgrid from '@sendgrid/mail';
import { randomBytes } from 'crypto';

sendgrid.setApiKey((process.env.SENDGRID_KEY || '').trim());

export async function sendgridMail(to: string, subject: string, text: string) {
    let success = false;
    let error = null;

    const message = {
        from: 'no-reply@decentralizedcreator.com',
        to,
        subject,
        text
    };

    try {
        await sendgrid.send(message);
        success = true;
    } catch (err) {
        console.log(err);
        error = err;
    }

    return {
        success,
        error
    };
}

export function mailCode(length: number = 8): string {
    return randomBytes(length).toString('hex').slice(0, length).toUpperCase();
}

export async function verifyEmail(to: string, mailCode: string) {
    const subject = 'Verify your email for DecentralizedCreator.com';
    const text = `In order to activate your account.\n\nInput this code in the settings page: ${mailCode}\n\n-- DecentralizedCreator and Friends`;
    const result = await sendgridMail(to, subject, text);

    return result;
}
