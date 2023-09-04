import { ImapFlow, ImapFlowOptions } from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';

export class ImapConnector {
  private client: ImapFlow;

  constructor(config: ImapFlowOptions) {
    this.client = new ImapFlow({
      ...config,
      tls: {
        rejectUnauthorized: false
      },
      logger: false
    });
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error(error);
      throw new Error(
        `Error while connecting to email service: ${error.message}`
      );
    }
  }

  disconnect() {
    this.client.close();
  }

  async openMailbox(mailbox: string) {
    // console.log('openMailbox')
    try {
      await this.client.getMailboxLock(mailbox);
    } catch (error) {
      console.error(error);
      throw new Error(`Error while opening mailbox: ${error.message}`);
    }
  }

  async getThreadIds() {
    // console.log('getThreadIds');
    try {
      const threadIds = [];
      for await (const message of this.client.fetch('1:*', {
        threadId: true
      })) {
        const threadId = message.threadId;
        if (threadIds.indexOf(threadId) === -1) {
          threadIds.push(threadId);
        }
      }
      return threadIds;
    } catch (error) {
      throw error;
    }
  }

  async getEmailsByThredId(threadId: string): Promise<ParsedMail[]> {
    try {
      const messages = [];
      for await (const message of this.client.fetch(
        { threadId },
        { source: true }
      )) {
        const parsedMessage = await simpleParser(message.source);
        messages.push(parsedMessage);
      }
      return messages;
    } catch (error) {
      throw error;
    }
  }

  async getEmails(offset: number, limit: number): Promise<ParsedMail[]> {
    try {
      const messages = [];
      const range = this.createRange(offset, limit);

      for await (let message of this.client.fetch(range, {
        source: true,
        threadId: true
      })) {
        const parsedMessage = await simpleParser(message.source);
        messages.push({ ...parsedMessage, threadId: message.threadId });
      }
      return messages;
    } catch (error) {
      throw error;
    }
  }

  private createRange(offset: number, limit: number) {
    return `${offset}:${offset + limit - 1}`;
  }
}
