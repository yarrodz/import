import OffsetPaginationTransferHelper from "../../transfers/helpers/offset-pagination-transfer.helper";
import TransferFailureHandler from "../../transfers/helpers/transfer-failure.handler";
import OffsetPaginationFunction from "../../transfers/interfaces/offset-pagination-function.interface";
import OffsetPaginationTransferParams from "../../transfers/interfaces/offset-pagination-transfer-params.interface";
import OffsetPagination from "../../transfers/interfaces/offset-pagination.interface";
import OuterTransferFunction, { OuterTransferFunctionParams } from "../../transfers/interfaces/outer-transfer-function.interface";
import Transfer from "../../transfers/interfaces/transfer.interface";
import { EmailConnector } from "../connector/email.connector";
import EmailConnection from "../interfaces/email-connection.interface";
import EmailImport from "../interfaces/email-import.interace";

class EmailImportHelper {
  private transferFailureHandler: TransferFailureHandler;
  private offsetPaginationTransferHelper: OffsetPaginationTransferHelper;

  constructor(
    transferFailureHandler: TransferFailureHandler,
    offsetPaginationTransferHelper: OffsetPaginationTransferHelper,
  ) {
    this.transferFailureHandler = transferFailureHandler;
    this.offsetPaginationTransferHelper = offsetPaginationTransferHelper;
  }

  public import: OuterTransferFunction = async (
    params: OuterTransferFunctionParams
  ): Promise<void> => {
    let emailConnector: EmailConnector;
    const impt = params.import as EmailImport;
    const { transfer } = params;
    const connection = impt.__.hasConnection as EmailConnection;
    const { mailbox } = impt; 
    const { config } = connection;
    try {
      emailConnector = new EmailConnector(config);
      await emailConnector.connect();
      await emailConnector.openMailbox(mailbox);
      await this.emailImport(impt, transfer, emailConnector);
      emailConnector.disconnect();
      //   return parsed  ;
      // emailConnector = new EmailConnector({
      //   auth: {
      //     user: 'synchronizationtask@gmail.com',
      //     pass: 'cnapoojyxzzivsjm',
      //   },
      //   host: "imap.gmail.com",
      //   port: 993
      // });
      // await emailConnector.connect();
      // await emailConnector.openMailbox(mailbox);
      //   let emails =  await emailConnector.getEmails(1,3);
      //   // let parsed =  await emailConnector.parseEmails(emails) as unknown as undefined;
      //   emailConnector.disconnect();
      //   return emails[0]  as unknown as undefined;
        

    } catch (error) {
      // console.log(error);
        emailConnector && emailConnector.disconnect();
      this.transferFailureHandler.handle({
        error,
        outerTransferFunction: this.import,
        import: impt,
        transfer
      });
    }
  };

  private async emailImport(
    impt: EmailImport,
    transfer: Transfer,
    emailConnector: EmailConnector
  ) {
    const { limit } = impt;

    const offsetPaginationTransferParams: OffsetPaginationTransferParams = {
      import: impt,
      transfer,
      limitPerStep: limit,
      paginationFunction: {
        fn: this.paginationFunction,
        params: [emailConnector]
      }
    };

    await this.offsetPaginationTransferHelper.transfer(
      offsetPaginationTransferParams
    );
  }

  private paginationFunction: OffsetPaginationFunction = async (
    offsetPagination: OffsetPagination,
    emailConnector: EmailConnector,
  ) => {
    const { offset, limit } = offsetPagination;
    return await emailConnector.getEmails(offset, limit);
  };
}

export default EmailImportHelper;