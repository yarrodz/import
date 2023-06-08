import { ParsedMail, simpleParser } from 'mailparser';

export async function parseEmails(emails: string[]): Promise<ParsedMail[]> {
  return await Promise.all(
    emails.map(async (email) => {
      return await simpleParser(email);
    })
  );
}
