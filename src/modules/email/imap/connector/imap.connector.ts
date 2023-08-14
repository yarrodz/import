import { ImapFlow, ImapFlowOptions } from 'imapflow';

export class ImapConnection {
  private client: ImapFlow;

  constructor(config: ImapFlowOptions) {
    this.client = new ImapFlow(config);
  }

  async connect() {
    try {
        await this.client.connect()
    } catch (error) {
        throw new Error(`Error while connecting to imap: ${error.message}`);
    }
  }

  disconnect() {
    this.client.close();
  }

//   async getEmails(): Promise<string[]> {
//     const emails: string[] = [];
//     try {
//         await this.client.getMailboxLock('INBOX');
//         const messages = await this.client.search({ all: true });
    
//         const fetchPromises = messages.map(async (message) => {
//           const fetchedMessage = await this.client.fetchOne(message.uid, { parts: 'BODY[]' });
//           const email = fetchedMessage.content.toString('utf8');
//           emails.push(email);
//         });
    
//         await Promise.all(fetchPromises);
//         return emails;
//       } catch (error) {
//         throw error;
//       }
//     }


    
  async getEmails(): Promise<string[]> {
    const emails: string[] = [];
    try {
        await this.client.getMailboxLock('INBOX');
    
        for await (let msg of this.client.fetch('1:*', {envelope: true})){

        }
        return emails;
      } catch (error) {
        throw error;
      }
    }
}
