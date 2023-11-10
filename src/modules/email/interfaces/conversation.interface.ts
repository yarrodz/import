import { TransformedEmail } from "./transformed-email.interface";

export interface Conversation {
  threadId: string;
  date: Date;
  emails: TransformedEmail[];
}