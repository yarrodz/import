export interface FetchedMessage {
  messageId: string;
  inReplyTo: string;
  date: Date;
  from: object;
  to: object;
  cc: object;
  bcc: object;
  subject: string;
  text: string;
  html: string;
  flags: string[];
  labels: string[];
  threadId: string;
}
