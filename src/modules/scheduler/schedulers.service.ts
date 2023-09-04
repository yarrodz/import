import ResponseHandler from '../../utils/response-handler/response-handler';
import SchedulersRepository from './schedulers.repository';
import { CreateSchedulerValidator } from './validators/create-scheduler.validator';
import { UpdateSchedulerValidator } from './validators/update-scheduler.validator';

class SchedulersService {
  private schedulersRepository: SchedulersRepository;

  constructor(schedulersRepository: SchedulersRepository) {
    this.schedulersRepository = schedulersRepository;
  }

  async getAll(select: any, sortings: any): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const connections = await this.schedulersRepository.query(
        select,
        sortings,
        false
      );
      return responseHandler.setSuccess(200, connections);
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }

  async get(id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const scheduler = await this.schedulersRepository.load(id);
      return responseHandler.setSuccess(200, scheduler);
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }

  async create(input: any): Promise<ResponseHandler> {
    let responseHandler = new ResponseHandler();
    try {
      const { error } = CreateSchedulerValidator.validate(input);
      if (error) {
        return responseHandler.setError(400, error);
      }

      const scheduler = await this.schedulersRepository.create(input);
      return responseHandler.setSuccess(200, scheduler);
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }

  async update(input: any): Promise<ResponseHandler> {
    let responseHandler = new ResponseHandler();
    try {
      const { error } = UpdateSchedulerValidator.validate(input);
      if (error) {
        return responseHandler.setError(400, error);
      }

      const { id } = input;
      const scheduler = await this.schedulersRepository.load(id);
      if (!scheduler) {
        return responseHandler.setError(404, 'Scheduler not found');
      }

      const updatedConnection = await this.schedulersRepository.update(input);
      return responseHandler.setSuccess(200, updatedConnection);
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }

  async delete(id: number): Promise<ResponseHandler> {
    const responseHandler = new ResponseHandler();
    try {
      const scheduler = await this.schedulersRepository.load(id);
      if (!scheduler) {
        return responseHandler.setError(404, 'Connection not found');
      }
      await this.schedulersRepository.delete(id);
      return responseHandler.setSuccess(200, true);
    } catch (error) {
      return responseHandler.setError(500, error.message);
    }
  }
}

export default SchedulersService;
