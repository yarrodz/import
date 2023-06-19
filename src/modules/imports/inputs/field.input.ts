import { IsString, Length, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { FeatureType } from '../../features/enums/feature-type.enum';
import { IField } from '../sub-schemas/field.schema';
import { IFeature } from '../../features/feature.schema';

export class FieldInput implements IField {
  @ValidateNested()
  @Type(() => FeatureInput)
  feature: FeatureInput;

  @IsString()
  @Length(1, 128)
  source: string;
}

class FeatureInput implements IFeature {
  @IsString()
  @Length(24, 24)
  _id: string;

  @IsString()
  @Length(1, 256)
  name: string;

  @IsIn(Object.values(FeatureType))
  type: FeatureType;
}
