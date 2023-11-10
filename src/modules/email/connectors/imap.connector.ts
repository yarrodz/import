import {
  FetchMessageObject,
  ImapFlow,
  ImapFlowOptions,
  SearchObject
} from 'imapflow';

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
      throw new Error(`Error while opening mailbox: ${error.message}`);
    }
  }

  async fetchUids(searchObject: SearchObject) {
    try {
      return await this.client.search(searchObject, { uid: true });
    } catch (error) {
      throw new Error(`Error while getting uids: ${error}`);
    }
  }

  async fetchThreadIds(searchObject: SearchObject) {
    try {
      const threadIds = [];
      for await (const message of this.client.fetch(
        searchObject,
        { threadId: true }
      )) {
        const { threadId } = message;
        
        if (threadIds.indexOf(threadId) === -1) {
          threadIds.push(threadId);
        }
      }
      return threadIds;
    } catch (error) {
      throw new Error(`Error while getting thread ids: ${error}`);
    }
  }

  async testFetch(): Promise<void> {
    try {
      await this.client.fetchOne('*', { uid: true });
    } catch (error) {
      throw error;
    }
  }

  async fetchEmails(range: string[]): Promise<FetchMessageObject[]> {
    try {
      const promises = range.map(async (uid) => 
        await this.client.fetchOne(
          uid.toString(),
          {
            source: true,
            uid: true,
            threadId: true,
            flags: true,
            labels: true
          },
          { uid: true }
        )
      );
      return await Promise.all(promises);
    } catch (error) {
      throw error;
    }
  }

  async fetchEmailsAsync(searchObject: SearchObject): Promise<FetchMessageObject[]> {
    try {
      const messages: FetchMessageObject[] = [];
      
      for await (const message of this.client.fetch(
        searchObject,
        {
          source: true,
          uid: true,
          threadId: true,
          flags: true,
          labels: true
        }
      )) {
        messages.push(message);
      }

      return messages;
    } catch (error) {
      throw error;
    }
  }
}



  // async setSeen(range: string) { // uid range
  //   try {
  //     await this.client.messageFlagsAdd(
  //       range,
  //       ['\\Seen'],
  //       { uid: true }
  //     );
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // fetchUids using fetch
  // async fetchUids(searchObject: SearchObject) {
  //   try {
  //     const uids = [];
  //     for await (const message of this.client.fetch(
  //       { seq: '1:*', ...searchObject },
  //       { uid: true }
  //     )) {
  //       const { uid } = message;
  //       uids.push(uid);
  //     }
  //     return uids;
  //   } catch (error) {
  //     throw new Error(`Error while getting uids: ${error}`);
  //   }
  // }


  