import { Types } from 'mongoose';

export default interface IOAuth2Token {
  importId: Types.ObjectId;
  access: string;
  refresh: string;
}
