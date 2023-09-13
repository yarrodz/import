// import { Server as IO } from 'socket.io';

// import { Transfer } from '../interfaces/transfer.interface';
// import { resolvePath } from '../../../utils/resolve-path/resolve-path';
// import { Feature } from '../../datasets/interfaces/feature.interafce';
// import { FeatureType } from '../../datasets/enums/feature-type.enum';
// import { Dataset } from '../../datasets/interfaces/dataset.interface';
// import { ImportField } from '../../imports/interfaces/import-field.interface';
// import { TransfersRepository } from '../transfers.repository';
// import { DatasetsRepository } from '../../datasets/datasets.repository';
// import { EmailImport } from '../../email/interfaces/email-import.interace';
// import { Import } from '../../imports/import.type';

// export class ImportStepHelper {
//   private io: IO;
//   private transfersRepository: TransfersRepository;
//   private datasetsRepository: DatasetsRepository;

//   constructor(
//     io: IO,
//     transfersRepository: TransfersRepository,
//     datasetsRepository: DatasetsRepository
//   ) {
//     this.io = io;
//     this.transfersRepository = transfersRepository;
//     this.datasetsRepository = datasetsRepository;
//   }

//   public async step(
//     impt: Import,
//     transfer: Transfer,
//     datasets: object[],
//     limit: number,
//     cursor?: string
//   ) {
//     const { id: transferId } = transfer;
//     const { id: unitId } = impt.__.inUnit;

//     const transormedDatasets = await this.transformDatasets(impt, datasets);

//     await this.insertDatasets(transormedDatasets);

//     const updatedTransfer = await this.transfersRepository.update({
//       id: transferId,
//       cursor,
//       offset: transfer.offset + limit,
//       transferedDatasetsCount:
//         transfer.transferedDatasetsCount + transormedDatasets.length,
//       retryAttempts: 0
//     });

//     this.io.to(String(unitId)).emit('transfer', updatedTransfer);
//   }

//   private async transformDatasets(impt: Import, datasets: object[]) {
//     const { id: importId, idKey } = impt;
//     const { fields } = impt;
//     const unit = impt.__.inUnit;
//     const { id: unitId } = unit;

//     const transformedDatasets = [];
//     datasets.forEach(async (dataset) => {
//       // const sourceId = resolvePath(dataset, idKey);
//       const sourceId = dataset[idKey];
//       if (sourceId === null) {
//         return;
//         // throw new Error('The id field contains a null value');
//       }

//       const records = this.transformRecords(dataset, fields);
//       const transformedDataset = {
//         unitId,
//         importId,
//         sourceId,
//         records
//       };

//       transformedDatasets.push(transformedDataset);
//     });

//     return transformedDatasets;
//   }

//   private transformRecords(dataset: object, fields: ImportField[]) {
//     const records = [];
//     fields.forEach(({ feature, source }) => {
//       const { id: featureId } = feature;
//       const value = resolvePath(dataset, source);
//       const parsedValue = this.parseValue(value, feature);

//       const record = {
//         value: parsedValue,
//         featureId
//       };
//       records.push(record);
//     });
//     return records;
//   }

//   private parseValue(value: any, feature: Feature) {
//     try {
//       switch (feature.type) {
//         case FeatureType.TIME:
//         case FeatureType.TEXT:
//         case FeatureType.LONG_TEXT: {
//           return String(value);
//         }
//         case FeatureType.JSON: {
//           if (typeof value === 'string') {
//             return JSON.parse(value);
//           } else if (typeof value === 'object') {
//             return value;
//           } else {
//             return null;
//           }
//         }
//         case FeatureType.DATE:
//         case FeatureType.DATETIME:
//           return new Date(value);
//         case FeatureType.BOOLEAN:
//           return Boolean(value);
//         case FeatureType.NUMBER:
//           return Number(value);
//         default: {
//           return null;
//         }
//       }
//     } catch (error) {
//       return null;
//     }
//   }

//   private async insertDatasets(datasets: Dataset[]) {
//     try {
//       await this.datasetsRepository.bulkSave(datasets);
//     } catch (error) {
//       throw new Error(`Error while insert datasets: ${error.message}.`);
//     }
//   }
// }
