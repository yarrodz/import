import { IsString, Length, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { FeatureType } from '../../features/enums/feature-type.enum';

export class FieldInput {
  @ValidateNested()
  @Type(() => FeatureInput)
  feature: FeatureInput;

  @IsString()
  @Length(1, 128)
  source: string;
}

class FeatureInput {
  @IsString()
  @Length(24, 24)
  _id: string;

  @IsString()
  @Length(1, 256)
  name: string;

  @IsIn(Object.values(FeatureType))
  type: FeatureType;
}
