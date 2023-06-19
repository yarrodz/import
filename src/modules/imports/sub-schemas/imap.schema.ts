import { Schema } from 'mongoose';
import { Config as ImapConfig } from 'imap';

export interface IImapConnection extends ImapConfig {
  user: string;
  password: string;
  host?: string;
  port?: number;
  tls?: boolean;
}

export const ImapConnectionSchema = new Schema<IImapConnection>({
  user: { type: String, required: true },
  password: { type: String, required: true },
  host: { type: String, required: true },
  port: { type: Number, required: true },
  tls: { type: Boolean, required: true }
});

export interface IImap {
  connection: IImapConnection;
}

export const ImapSchema = new Schema<IImap>({
  connection: { type: ImapConnectionSchema, required: true }
});
