
import { ImapFlow, ImapFlowOptions } from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';

export class EmailConnector {
  private client: ImapFlow;

  constructor(config: ImapFlowOptions) {
    this.client = new ImapFlow({
      ...config,
      tls: {
        rejectUnauthorized: false,
      },
      logger: false
    });
  }

  async connect() {
    console.log('connect')
    console.log('________________________________________')
    try {
      await this.client.connect();
    } catch (error) {
      throw new Error(`Error while connecting to email service: ${error.message}`);
    }
  }

  disconnect() {
    this.client.close();
  }

  async openMailbox(mailbox: string) {
    console.log('openMailbox')
    console.log('________________________________________')
    try {
      await this.client.getMailboxLock(mailbox);
    } catch (error) {
      console.error(error);
      throw new Error(`Error while opening mailbox: ${error.message}`);
    }
  }

  async getEmails(
    offset: number,
    limit: number
  ): Promise<ParsedMail[]> {
    console.log('getEmails')
      console.log('________________________________________')
      try {
      const rangeNumbers = this.createRangeNumbers(offset, limit);
      // console.log("rangeNumbers:", rangeNumbers);
      const messagePromises = rangeNumbers.map(
        async (number) => {
          return await this.client.fetchOne(`${number}`, { source: true });
        }
      );

      let emails = await Promise.all(messagePromises);
      emails = emails.filter(email => email);
      return await Promise.all(emails.map(
        async (email) => {

          const s = await simpleParser(email.source);
          // console.log('Obect.values(): ', Object.keys(s).map(k=> {
          //   return `key: ${k} - value: ${typeof s[k]}`
          // }))
          return s;
        }
      ));

    } catch (error) {
      throw error;
    }
  }
  

  private createRangeNumbers(offset: number, limit: number) {
    const numbers = [];
    for (var i = offset; i < offset + limit; i++) {
      numbers.push(i);
    }
    return numbers;
  }
}