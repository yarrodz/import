import { CronJob } from 'cron';

import { SqlImportHelper } from '../sql/helpers/sql-import.helper';
import { ApiImportHelper } from '../api/helpers/api-import.helper';
import { EmailImportHelper } from '../email/helpers/email-import.helper';
import { SchedulersRepository } from './schedulers.repository';
import { TransfersRepository } from '../transfers/transfers.repository';
import { Scheduler } from './interfaces/schedule.interface';
import { SchedulerPeriod } from './enum/scheduler-period.enum';
import { Source } from '../imports/enums/source.enum';
import { TransferState } from '../transfers/enums/transfer-state.enum';
import { WeekdayNumberMapping } from './enum/weekday.enum';
import { ProcessesRepository } from '../processes/process.repository';

export class SchedulersCron {
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
      const {
        period,
        minutes,
        hours,
        day: scheduledWeekday,
        date: scheduledDate
      } = scheduler;
      const scheduledMinutesPeriod = hours * 60 + minutes;
      const scheduledMinutesTime = hours * 60 + minutes;

      switch (period) {
        case SchedulerPeriod.TIME: {
          if (nowMinutes % scheduledMinutesPeriod === 0) {
            readyImports.push(scheduler.process?.id);
          }
        }
        case SchedulerPeriod.DAY: {
          if (nowMinutes === scheduledMinutesTime) {
            readyImports.push(scheduler.process?.id);
          }
          break;
        }
        case SchedulerPeriod.WEEK: {
          if (
            WeekdayNumberMapping[scheduledWeekday] === nowday &&
            nowMinutes === scheduledMinutesTime
          ) {
            readyImports.push(scheduler.process?.id);
          }
          break;
        }
        case SchedulerPeriod.MONTH: {
          if (
            scheduledDate === nowDate &&
            nowMinutes === scheduledMinutesTime
          ) {
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
      if (impt.fields === undefined) {
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
            value: TransferState.PENDING
          },
          {
            type: 'hasEdge',
            direction: 'in',
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
