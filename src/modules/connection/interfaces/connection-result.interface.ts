import { ConnectionState } from '../enums/connection-state.enum';

export default interface IConnectionResult {
  state: ConnectionState;
  oAuth2AuthUri?: string;
}
