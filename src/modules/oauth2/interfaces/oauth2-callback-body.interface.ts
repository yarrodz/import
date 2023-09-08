export interface OAuth2CallbackBody {
  grant_type: string;
  code: string;
  client_id: string;
  client_secret?: string;
  code_verifier?: string;
  redirect_uri: string;
}
