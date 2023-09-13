import { SearchObject as EmailSearchObject } from 'imapflow';

import { EmailFilter } from '../interfaces/email-filter.interface';
import { EmailFilterKey } from '../enums/email-filter-key.enum';
import { EmailSeenOption } from '../enums/filter-options/email-seen-option.enum';
import { EmailNewOption } from '../enums/filter-options/email-new-option.enum';
import { EmailAnsweredOption } from '../enums/filter-options/email-answered-option.enum';
import { EmailDeletedOption } from '../enums/filter-options/email-deleted-option.enum';
import { EmailDraftOption } from '../enums/filter-options/email-draft-option.enum';

export class EmailSearchObjectHelper {
  static fromFilter(emailFilter: Partial<EmailFilter>): EmailSearchObject {
    const searchObject: EmailSearchObject = {};

    for (const [key, value] of Object.entries(emailFilter)) {
      switch (key) {
        case EmailFilterKey.SEEN: {
          this.addSeenOption(value, searchObject);
          break;
        }
        case EmailFilterKey.NEW: {
          this.addNewOption(value, searchObject);
          break;
        }
        case EmailFilterKey.SUBJECT: {
          this.addSubjectOption(value, searchObject);
          break;
        }
        case EmailFilterKey.BEFORE: {
          this.addBeforeOption(value, searchObject);
          break;
        }
        case EmailFilterKey.SINCE: {
          this.addSinceOption(value, searchObject);
          break;
        }
        case EmailFilterKey.FROM: {
          this.addFromOption(value, searchObject);
          break;
        }
        case EmailFilterKey.TO: {
          this.addToOption(value, searchObject);
          break;
        }
        case EmailFilterKey.BCC: {
          this.addBccOption(value, searchObject);
          break;
        }
        case EmailFilterKey.CC: {
          this.addCcOption(value, searchObject);
          break;
        }
        case EmailFilterKey.ANSWERED: {
          this.addAnsweredOption(value, searchObject);
          break;
        }
        case EmailFilterKey.DELETED: {
          this.addDeletedOption(value, searchObject);
          break;
        }
        case EmailFilterKey.DRAFT: {
          this.addDraftOption(value, searchObject);
          break;
        }
        case EmailFilterKey.WITH_FLAG: {
          this.addWithFlagOption(value, searchObject);
          break;
        }
        case EmailFilterKey.WITHOUT_FLAG: {
          this.addWithoutFlagOption(value, searchObject);
          break;
        }
        case EmailFilterKey.THREAD_ID: {
          this.addThreadOption(value, searchObject);
          break;
        }
        default: {
          break;
        }
      }
    }

    return searchObject;
  }

  private static addSeenOption(value: any, searchObject: EmailSearchObject) {
    switch (value) {
      case EmailSeenOption.UNSEEN: {
        searchObject.seen = false;
        break;
      }
      case EmailSeenOption.SEEN: {
        searchObject.seen = true;
        break;
      }
      default: {
        break;
      }
    }
  }

  private static addNewOption(value: any, searchObject: EmailSearchObject) {
    switch (value) {
      case EmailNewOption.NEW: {
        searchObject.new = true;
        break;
      }
      case EmailNewOption.OLD: {
        searchObject.old = true;
        break;
      }
      default: {
        break;
      }
    }
  }

  private static addSubjectOption(value: any, searchObject: EmailSearchObject) {
    if (typeof value === 'string') {
      searchObject.subject = value;
    }
  }

  private static addSinceOption(value: any, searchObject: EmailSearchObject) {
    searchObject.sentSince = value;
  }

  private static addBeforeOption(value: any, searchObject: EmailSearchObject) {
    searchObject.sentBefore = value;
  }

  private static addFromOption(value: any, searchObject: EmailSearchObject) {
    if (typeof value === 'string') {
      searchObject.from = value;
    }
  }

  private static addToOption(value: any, searchObject: EmailSearchObject) {
    if (typeof value === 'string') {
      searchObject.to = value;
    }
  }

  private static addCcOption(value: any, searchObject: EmailSearchObject) {
    if (typeof value === 'string') {
      searchObject.cc = value;
    }
  }

  private static addBccOption(value: any, searchObject: EmailSearchObject) {
    if (typeof value === 'string') {
      searchObject.bcc = value;
    }
  }

  private static addAnsweredOption(
    value: any,
    searchObject: EmailSearchObject
  ) {
    switch (value) {
      case EmailAnsweredOption.ANSWERED: {
        searchObject.answered = true;
        break;
      }
      case EmailAnsweredOption.UNANSWERED: {
        searchObject.answered = false;
        break;
      }
      default: {
        break;
      }
    }
  }

  private static addDeletedOption(value: any, searchObject: EmailSearchObject) {
    switch (value) {
      case EmailDeletedOption.DELETED: {
        searchObject.deleted = true;
        break;
      }
      case EmailDeletedOption.NOT_DELETED: {
        searchObject.deleted = false;
        break;
      }
      default: {
        break;
      }
    }
  }

  private static addDraftOption(value: any, searchObject: EmailSearchObject) {
    switch (value) {
      case EmailDraftOption.DRAFT: {
        searchObject.draft = true;
        break;
      }
      case EmailDraftOption.NOT_DRAFT: {
        searchObject.draft = false;
        break;
      }
      default: {
        break;
      }
    }
  }

  private static addWithFlagOption(
    value: any,
    searchObject: EmailSearchObject
  ) {
    if (typeof value === 'string') {
      searchObject.keyword = value;
    }
  }

  private static addWithoutFlagOption(
    value: any,
    searchObject: EmailSearchObject
  ) {
    if (typeof value === 'string') {
      searchObject.unKeyword = value;
    }
  }

  private static addThreadOption(value: any, searchObject: EmailSearchObject) {
    if (typeof value === 'string') {
      searchObject.threadId = value;
    }
  }
}
