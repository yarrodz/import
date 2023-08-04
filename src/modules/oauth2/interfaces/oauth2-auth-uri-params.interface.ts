export default interface OAuth2AuthUriParams {
  client_id: string;
  client_secret?: string;
  code_challenge_method?: string;
  code_challenge?: string;
  code_verifier?: string;
  scope?: string;
  state: string;
  prompt: string;
  access_type: string;
  response_type: string;
  redirect_uri: string;
}
