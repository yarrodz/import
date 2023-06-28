import ImportsRepository from '../imports/imports.repository';
import TransferService from '../transfer/transfer.service';
import ImportProcessesRepository from './import-processes.repository';

export default function createReloadPendingImportProcessesFunction(
  importProcessesRepository: ImportProcessesRepository,
  importsRepository: ImportsRepository,
  transferService: TransferService
): Function {
  const reloadPendingImportProcesses = async function () {
    const pendingProcesses = await importProcessesRepository.findPending();
    await Promise.all(
      pendingProcesses.map(async (process) => {
        const impt = await importsRepository.findById(
          process.import.toString()
        );
        if (!impt) {
          return;
        }
        await transferService.transfer(impt, process);
      })
    );
  };

  return reloadPendingImportProcesses;
}
