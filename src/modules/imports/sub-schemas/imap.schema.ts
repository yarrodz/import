import mongoose, { Document, Schema } from 'mongoose';

import { Config as ImapConfig } from 'imap';

interface IImap {
  config: ImapConfig;
}

export interface IImapModel extends IImap, Document {}

export const ImapSchema = new Schema({
  config: {
    type: {
      user: { type: String, required: true },
      password: { type: String, required: true },
      host: { type: String, required: true },
      port: { type: Number, required: true },
      tls: { type: Boolean, required: true }
    },
    required: true
  }
});

export default mongoose.model<IImap>('Imap', ImapSchema);
