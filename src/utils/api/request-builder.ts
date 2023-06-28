import { AxiosRequestConfig } from 'axios';

import {
  IApi,
  IApiTransferOptions
} from '../../modules/imports/sub-schemas/api.schema';
import { ApiPaginationPlacement } from '../../modules/imports/enums/api-paginanation-placement';

export function buildRequest(api: IApi): AxiosRequestConfig {
  const { requestConfig } = api;
  const { method, url, headers, params, body, responseType } = requestConfig;
  const axiosConfig: AxiosRequestConfig = {
    method,
    url,
    headers,
    params,
    data: body,
    responseType
  };

  return axiosConfig;
}

export function buildPaginationRequest(
  api: IApi,
  offset: number,
  limit: number
): AxiosRequestConfig {
  const { requestConfig, transferOptions } = api;
  const { method, url, headers, params, body, responseType } = requestConfig;
  const axiosConfig: AxiosRequestConfig = {
    method,
    url,
    headers,
    params,
    data: body,
    responseType
  };

  addPaginationParametres(axiosConfig, transferOptions, offset, limit);
  return axiosConfig;
}

function addPaginationParametres(
  axiosConfig: AxiosRequestConfig,
  transferOptions: IApiTransferOptions,
  offset: number,
  limit: number
) {
  const { offsetParameter, limitParameter, paginationPlacement } =
    transferOptions;
  switch (paginationPlacement) {
    case ApiPaginationPlacement.BODY:
      axiosConfig.data[offsetParameter] = offset;
      axiosConfig.data[limitParameter] = limit;
      break;
    case ApiPaginationPlacement.QUERY_PARAMETERS:
      axiosConfig.url += `?${offsetParameter}=${offset}??${limitParameter}=${limit}`;
    default:
      break;
  }
}
