export interface OAuth2 {
  id: string;
  client_id: string;
  client_secret?: string;
  auth_uri: string;
  token_uri: string;
  scope?: string;
  use_code_verifier: boolean;
  access_token?: string;
  refresh_token?: string;
}
