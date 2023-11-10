import { TransferProcessesRepository } from "../../transfer-processes/transfer-processes.repository";
import { TransferProcess } from "../../transfer-processes/interfaces/transfer-process.interface";
import { SqlIframeTransfer } from "../interfaces/sql-iframe-transfer.interface";
import { TransferStatus } from "../../transfer-processes/enums/transfer-status.enum";
import { SqlImportTarget } from "../enums/sql-import-target.enum";
import { SqlConnector } from "../connectors/sql.connector";
import { TableQueryHelper } from "./table-query.helper";
import { SelectQueryHelper } from "./select-query.helper";

export class SqlBaseTransferProcessHelper {
  constructor(
    private processsRepository: TransferProcessesRepository
  ) {}

  public async baseProcess(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector
  ): Promise<TransferProcess> {
    const {
      minIdValue,
      maxIdValue,
      total,
    } = await this.fetchParams(transfer, sqlConnector);

    const relations = this.createProcessRelations(transfer);

    return await this.processsRepository.create({
      status: TransferStatus.PENDING,
      log: 'Transfer was started.',
      offset: minIdValue,
      transfered: 0,
      total,
      helper: { maxIdValue },
      retryAttempts: 0,
      __: relations
    });
  }

  private async fetchParams(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector
  ) {
    const cases = {
      [SqlImportTarget.TABLE]: this.fetchTableParams,
      [SqlImportTarget.SELECT]: this.fetchSelectParams
    }
    const { target } = transfer;
    return await cases[target](transfer, sqlConnector);
  }

  private async fetchTableParams(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector,
  ) {
    const minIdValue = await this.fetchTableMinId(transfer, sqlConnector);
    const maxIdValue = await this.fetchTableMaxId(transfer, sqlConnector);
    const total = await this.fetchTableCount(transfer, sqlConnector);
    return { minIdValue, maxIdValue, total };
  }

  private async fetchSelectParams(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector,
  ) {
    const minIdValue = await this.fetchSelectMinId(transfer, sqlConnector);
    const maxIdValue = await this.fetchSelectMaxId(transfer, sqlConnector);
    const total = await this.fetchSelectCount(transfer, sqlConnector);
    return { minIdValue, maxIdValue, total };
  }

  private async fetchTableMinId(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector,
  ) {
    const { table, idKey } = transfer;
    const minIdQuery = TableQueryHelper.createMinIdQuery(table, idKey);
    return await sqlConnector.queryResult(minIdQuery);
  }

  private async fetchTableMaxId(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector,
  ) {
    const { table, idKey } = transfer;
    const minIdQuery = TableQueryHelper.createMaxIdQuery(table, idKey);
    return await sqlConnector.queryResult(minIdQuery);
  }

  private async fetchTableCount(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector,
  ) {
    const { table } = transfer;
    const countQuery = TableQueryHelper.createCountQuery(table);
    return await sqlConnector.queryResult(countQuery);
  }

  private async fetchSelectMinId(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector,
  ) {
    const { table, idKey } = transfer;
    const minIdQuery = SelectQueryHelper.createMinIdQuery(table, idKey);
    return await sqlConnector.queryResult(minIdQuery);
  }

  private async fetchSelectMaxId(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector,
  ) {
    const { table, idKey } = transfer;
    const minIdQuery = SelectQueryHelper.createMaxIdQuery(table, idKey);
    return await sqlConnector.queryResult(minIdQuery);
  }

  private async fetchSelectCount(
    transfer: SqlIframeTransfer,
    sqlConnector: SqlConnector,
  ) {
    const { table } = transfer;
    const countQuery = SelectQueryHelper.createCountQuery(table);
    return await sqlConnector.queryResult(countQuery);
  }

  private createProcessRelations(
    transfer: SqlIframeTransfer,
  ) {
    const { id: transferId, __: relations } = transfer;
    const { id: unitId } = relations.unit;
    return {
      transfer: {
        id: transferId,
        _d: 'out'
      },
      unit: {
        id: unitId,
        _d: 'out'
      }
    }
  }
}
