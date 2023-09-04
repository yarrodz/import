import { CronJob } from 'cron';

import SqlImportHelper from '../sql/helpers/sql-import.helper';
import ApiImportHelper from '../api/helpers/api-import.helper';
import EmailImportHelper from '../email/helpers/email-import.helper';
import SchedulersRepository from './schedulers.repository';
import TransfersRepository from '../transfers/transfers.repository';
import Scheduler from './interfaces/schedule.interface';
import { SchedulerPeriod } from './enum/scheduler-period.enum';
import Import from '../imports/import.type';
import { Source } from '../imports/enums/source.enum';
import { TransferStatus } from '../transfers/enums/transfer-status.enum';
import { WeekdayNumberMapping } from './enum/weekday.enum';
import ProcessesRepository from '../processes/process.repository';

class SchedulersCron {
  private sqlImportHelper: SqlImportHelper;
  private apiImportHelper: ApiImportHelper;
  private emailImportHelper: EmailImportHelper;
  private schedulersRepository: SchedulersRepository;
  private transfersRepository: TransfersRepository;
  private processesRepository: ProcessesRepository;
  private job: CronJob;

  constructor(
    sqlImportHelper: SqlImportHelper,
    apiImportHelper: ApiImportHelper,
    emailImportHelper: EmailImportHelper,
    schedulersRepository: SchedulersRepository,
    transfersRepository: TransfersRepository,
    processesRepository: ProcessesRepository
  ) {
    this.sqlImportHelper = sqlImportHelper;
    this.apiImportHelper = apiImportHelper;
    this.emailImportHelper = emailImportHelper;
    this.schedulersRepository = schedulersRepository;
    this.transfersRepository = transfersRepository;
    this.processesRepository = processesRepository;
    this.initializeJob();
  }

  initializeJob() {
    this.job = new CronJob('*/1 * * * *', async () => {
      try {
        const activeSchedulers = await this.getActiveSchedulers();
        const readyImports = this.getReadyImports(activeSchedulers);
        this.startImports(readyImports);
      } catch (error) {
        console.log(`Error while cron: ${error}`);
      }
    });
  }

  private async getActiveSchedulers() {
    return await this.schedulersRepository.query(
      {
        type: 'equals',
        property: 'active',
        value: true
      },
      {},
      false
    );
  }

  private getReadyImports(activeSchedulers: Scheduler[]) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nowday = now.getDay();
    const nowDate = now.getDate();

    const readyImports = [];
    activeSchedulers.forEach((scheduler: Scheduler) => {
      const { period, minutes, hours, day, date } = scheduler;
      const scheduledMinutesPeriod = hours * 60 + minutes;
      const scheduledTime = hours * 60 + minutes;

      switch (period) {
        case SchedulerPeriod.TIME: {
          if (nowMinutes % scheduledMinutesPeriod === 0) {
            readyImports.push(scheduler.process?.id);
          }
        }
        case SchedulerPeriod.DAY: {
          if (nowMinutes === scheduledTime) {
            readyImports.push(scheduler.process?.id);
          }
          break;
        }
        case SchedulerPeriod.WEEK: {
          if (
            WeekdayNumberMapping[day] === nowday &&
            nowMinutes === scheduledTime
          ) {
            readyImports.push(scheduler.process?.id);
          }
          break;
        }
        case SchedulerPeriod.MONTH: {
          if (date === nowDate && nowMinutes === scheduledTime) {
            readyImports.push(scheduler.process?.id);
          }
          break;
        }
        default: {
          break;
        }
      }
    });

    return readyImports.filter((item) => item);
  }

  private async startImports(importIds: number[]) {
    importIds.forEach(async (id) => {
      const impt = await this.processesRepository.load(id);
      if (!impt) {
        return;
      }
      const { inUnit: unit } = impt.__;

      const pendingUnitTransfer = await this.findUnitPendingTransfer(unit.id);
      if (pendingUnitTransfer === undefined) {
        return;
      }

      const { source } = impt;

      switch (source) {
        case Source.SQL: {
          return await this.sqlImportHelper.import({ import: impt });
        }
        case Source.API: {
          return await this.apiImportHelper.import({ import: impt });
        }
        case Source.EMAIL: {
          return await this.emailImportHelper.import({ import: impt });
        }
        default: {
          console.error(
            `Error while starting import. Unknown import source '${source}'.`
          );
        }
      }
    });
  }

  private async findUnitPendingTransfer(unitId: number) {
    return await this.transfersRepository.query(
      {
        operator: 'and',
        conditions: [
          {
            type: 'equals',
            property: 'status',
            value: TransferStatus.PENDING
          },
          {
            type: 'hasEdge',
            direction: 'out',
            label: 'inUnit',
            value: unitId
          }
        ]
      },
      {},
      true
    );
  }

  start() {
    this.job.start();
  }

  stop() {
    this.job.stop();
  }
}

export default SchedulersCron;
