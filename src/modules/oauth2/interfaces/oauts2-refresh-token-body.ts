export default interface OAuth2RefreshTokenBody {
  grant_type: string;
  refresh_token?: string;
  client_id: string;
  client_secret?: string;
  scope?: string;
}
