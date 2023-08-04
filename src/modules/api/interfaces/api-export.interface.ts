import Request from './request.interface';

export default interface ApiExport {
  id: string;
  request: Request;
  limit: number;
}
