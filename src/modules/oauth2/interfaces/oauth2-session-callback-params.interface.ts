export interface OAuth2SessionCallbackParams {
  client_id: string;
  client_secret?: string;
  code_verifier?: string;
  token_uri: string;
}
