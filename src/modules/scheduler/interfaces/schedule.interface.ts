import { Import } from '../../imports/import.type';
import { SchedulerPeriod } from '../enum/scheduler-period.enum';
import { SchedulerType } from '../enum/scheduler-type.enum';
import { Weekday } from '../enum/weekday.enum';
import { SchedulerReference } from './scheduler-reference.interface';

export interface Scheduler {
  id: number;

  name: string;

  type: SchedulerType;

  active: boolean;

  period: SchedulerPeriod;

  // js date
  minutes: number;
  hours: number;
  day: Weekday;
  date: number;

  process: Import;
  unit: any;

  __: SchedulerReference;
}
