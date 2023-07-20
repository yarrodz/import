import ImportProcessesRepository from './import-processes.repository';
import ImportsRepository from '../imports/imports.repository';
import SqlTransferHelper from '../sql/sql-transfer.helper';
import ApiTransferHelper from '../api/api-transfer.helper';
import { ImportSource } from '../imports/enums/import-source.enum';

export default function createPendingImportProcessesReloaderFunction(
  importProcessesRepository: ImportProcessesRepository,
  importsRepository: ImportsRepository,
  sqlTransferHelper: SqlTransferHelper,
  apiTransferHelper: ApiTransferHelper
): Function {
  const reloadPendingImportProcesses = async function () {
    const pendingProcesses = await importProcessesRepository.findPending();

    await Promise.all(
      pendingProcesses.map(async (process) => {
        const { import: importId } = process;

        const impt = await importsRepository.findById(importId);
        const { source } = impt;

        switch (source) {
          case ImportSource.SQL: {
            await sqlTransferHelper.transfer(impt, process);
            break;
          }
          case ImportSource.API: {
            await apiTransferHelper.transfer(impt, process);
            break;
          }
        }
      })
    );
  };

  return reloadPendingImportProcesses;
}
