export interface TransformedEmail {
  uid: number;
  messageId: string;
  inReplyTo: string;
  date: Date;
  from: object;
  to: object;
  cc: object;
  bcc: object;
  subject: string;
  text: string;
  flags: string[];
  labels: string[];
  threadId: string;
}
