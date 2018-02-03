import { SNSEvent, SNSEventRecord, SNSMessage, SNSMessageAttributes } from 'aws-lambda';
import * as faker from 'faker';

export function snsMessage<T>({
  SignatureVersion = '3',
  Timestamp = new Date().toISOString(),
  Signature = faker.random.alphaNumeric(50),
  SigningCertUrl = faker.internet.url(),
  MessageId = faker.random.alphaNumeric(16),
  Message = <T> {},
  MessageAttributes = <SNSMessageAttributes> {},
  Type = 'sns',
  UnsubscribeUrl = faker.internet.url(),
  TopicArn = 'arn:sns:' + faker.internet.domainName(),
  Subject = faker.lorem.lines(1),
} = {}): SNSMessage {
  return {
    Message: JSON.stringify(Message),
    MessageAttributes,
    MessageId,
    Signature,
    SignatureVersion,
    SigningCertUrl,
    Subject,
    Timestamp,
    TopicArn,
    Type,
    UnsubscribeUrl,
  };
}

export function snsEventRecord({
  EventVersion = '1',
  EventSubscriptionArn = 'arn:sns:' + faker.internet.domainName(),
  EventSource = 'lambda',
  Sns = snsMessage(),
} = {}): SNSEventRecord {
  return {
    EventSource,
    EventSubscriptionArn,
    EventVersion,
    Sns,
  };
}

export function snsEvent({
  Records = [snsEventRecord()],
} = {}): SNSEvent {
  return {
    Records,
  };
}

export function snsEventForMessages<T>(...messages: T[]): SNSEvent {
  return snsEvent({
    Records: messages.map((m) => snsEventRecord({
      Sns: snsMessage({
        Message: m,
      }),
    })),
  });
}
