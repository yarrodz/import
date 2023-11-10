import { FetchMessageObject } from "imapflow";
import { simpleParser } from "mailparser";
import { TransformedEmail } from "../interfaces/transformed-email.interface";

export class TransformEmailHelper {
  public static async transformArray(
    messages: FetchMessageObject[]
  ): Promise<TransformedEmail[]> {
    return await Promise.all(
      messages.map(async (message) =>
        await TransformEmailHelper.transform(message)
      )
    )
  }

  public static async transform(
    message: FetchMessageObject
  ): Promise<TransformedEmail> {
    const {
      source,
      uid,
      threadId,
      flags,
      labels
    } = message;

    const parsedMessage = await simpleParser(source);

    const {
      messageId,
      inReplyTo,
      from,
      to,
      cc,
      bcc,
      date,
      subject,
      text
    } = parsedMessage;

    return {
      messageId,
      uid,
      threadId,
      inReplyTo,
      from,
      to,
      cc,
      bcc,
      date,
      subject,
      text,
      flags: Array.from(flags),
      labels: Array.from(labels),
    }
  }
}
