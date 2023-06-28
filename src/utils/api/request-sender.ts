import axios, { AxiosRequestConfig } from 'axios';

export async function sendRequest(
  axiosConfig: AxiosRequestConfig,
  path: string
) {
  try {
    const data = await axios(axiosConfig);
    const response = findResponse(data, path);
    return response;
  } catch (error) {
    throw new Error(`Error while sending request: ${error.message}`);
  }
}

function findResponse(response: object, path: string): object[] {
  try {
    const props = path.split('.');
    let currentPath = response;
    for (const prop of props) {
      currentPath = currentPath[prop];
    }
    console.log(currentPath);
    return currentPath as object[];
  } catch (error) {
    throw new Error(`Error while searching for request: ${error.message}`);
  }
}
