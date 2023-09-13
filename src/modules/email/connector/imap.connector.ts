import {
  FetchMessageObject,
  ImapFlow,
  ImapFlowOptions,
  SearchObject
} from 'imapflow';
import { ParsedMail, simpleParser } from 'mailparser';
import { FetchedMessage } from '../interfaces/fetched-message.interface';
import { EmailSeenOption } from '../enums/filter-options/email-seen-option.enum';

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
      // console.error(error);
      throw new Error(
        `Error while connecting to email service: ${error.message}`
      );
    }
  }

  disconnect() {
    this.client.close();
  }

  async openMailbox(mailbox: string) {
    try {
      await this.client.getMailboxLock(mailbox);
    } catch (error) {
      // console.error(error);
      throw new Error(`Error while opening mailbox: ${error.message}`);
    }
  }

  async getUids(searchObject: SearchObject) {
    try {
      const uids = [];

      // console.log('{ uid: 1:*, ...searchObject }: ', { uid: '1:*', ...searchObject });
      for await (const message of this.client.fetch(
        { uid: '1:*', ...searchObject },
        {
          uid: true
        }
      )) {
        const { uid } = message;
        // console.log('uid: ', uid)
        uids.push(uid);
      }
      return uids;
    } catch (error) {
      throw error;
    }
  }

  async getThreadIds(searchObject: SearchObject) {
    try {
      const uniqueThreadIds = [];

      for await (const message of this.client.fetch(
        { uid: '1:*', ...searchObject },
        {
          threadId: true
        }
      )) {
        const threadId = message.threadId;
        if (uniqueThreadIds.indexOf(threadId) === -1) {
          uniqueThreadIds.push(threadId);
        }
      }
      return uniqueThreadIds;
    } catch (error) {
      throw error;
    }
  }

  async getEmails(
    range: string,
    searchObject: SearchObject
  ): Promise<FetchedMessage[]> {
    try {
      const messages: FetchedMessage[] = [];

      // console.log('{ uid: range, ...searchObject }: ', { uid: range, ...searchObject });

      for await (let message of this.client.fetch(
        { uid: range, ...searchObject },
        {
          uid: true,
          source: true,
          envelope: true,
          threadId: true,
          flags: true,
          labels: true
        }
      )) {
        const { uid, source, envelope, threadId, flags, labels } = message;
        const parsedMessage = await simpleParser(source);
        const { messageId, text } = parsedMessage;
        const { inReplyTo, date, subject, from, to, cc, bcc } = envelope;
        messages.push({
          uid,
          messageId,
          inReplyTo,
          date,
          from,
          to,
          cc,
          bcc,
          subject,
          text,
          flags: Array.from(flags),
          labels: Array.from(labels),
          threadId
        });
      }

      return messages;
    } catch (error) {
      throw error;
    }
  }

  async setSeen(range: string) {
    try {
      await this.client.messageFlagsAdd(range, ['\\Seen'], { uid: true });
    } catch (error) {
      throw error;
    }
  }
}
