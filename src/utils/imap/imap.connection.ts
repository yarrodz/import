import Imap from 'imap';
import { Config as ImapConfig } from 'imap';

export class ImapConnection {
  private imap: Imap;

  constructor(config: ImapConfig) {
    this.imap = new Imap(config);
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.imap.connect();
      this.imap.once('ready', resolve);
      this.imap.once('error', reject);
    });
  }

  disconnect() {
    this.imap.end();
  }

  async receiveEmails(): Promise<string[]> {
    const emails: string[] = [];
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', true, (err) => {
        if (err) reject(err);
        const fetch = this.imap.seq.fetch('1:*', { bodies: '' });

        fetch.on('message', async (msg) => {
          let email = '';
          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              email += chunk.toString('utf8');
            });
          });

          msg.on('end', async () => {
            emails.push(email);
          });
        });

        fetch.once('end', async () => {
          resolve(emails);
        });
      });
    });
  }
}
