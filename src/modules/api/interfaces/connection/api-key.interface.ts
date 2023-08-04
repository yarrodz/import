import { ApiKeyPlacement } from '../../enums/api-key-placement.enum';

export default interface ApiKey {
  placement: ApiKeyPlacement;
  key: string;
  value: string;
}
