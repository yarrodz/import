import { Schema } from 'mongoose';

export interface IOAuth2 {
  client_id: string;
  client_secret?: string;
  auth_uri: string;
  token_uri: string;
  scope?: string;
  use_code_verifier: boolean;
  access_token?: string;
  refresh_token?: string;
}

export const OAuth2Schema = new Schema<IOAuth2>({
  client_id: { type: String, required: true },
  client_secret: { type: String, required: false },
  auth_uri: { type: String, required: true },
  token_uri: { type: String, required: true },
  scope: { type: String, required: false },
  use_code_verifier: { type: Boolean, required: true },
  access_token: { type: String, required: false },
  refresh_token: { type: String, required: false }
},
{
  _id: false
});
