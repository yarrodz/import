import { RequestResponseType } from '../enums/request-response-type.enum';

class ParseResponseHelper {
  public parse(data: any, responseType: RequestResponseType) {
    try {
      switch (responseType) {
        case RequestResponseType.JSON: {
          return data;
        }
        case RequestResponseType.CSV_JSON: {
          return this.parseCsvFormattedJson(data);
        }
      }
    } catch (error) {
      throw new Error(`Error while parsing response: ${error.message}`);
    }
  }

  private parseCsvFormattedJson(data: object[]) {
    const keys = data[0] as string[];
    const values = data.slice(1) as string[][];

    return values.map((value) => {
      const object = {};
      for (let i = 0; i < keys.length; i++) {
        object[keys[i]] = value[i];
      }
      return object;
    });
  }
}

export default ParseResponseHelper;
