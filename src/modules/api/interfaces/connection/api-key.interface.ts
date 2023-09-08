import { ApiKeyPlacement } from '../../enums/api-key-placement.enum';

export interface ApiKey {
  placement: ApiKeyPlacement;
  key: string;
  value: string;
}
