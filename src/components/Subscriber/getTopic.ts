import hash from 'object-hash';
import { Message, Ros, Topic } from 'roslib';
import { v4 as uuidv4 } from 'uuid';

export interface TopicSettings {
    topic: string;
    messageType: string;
    throttleRate?: number;
    latch?: boolean;
    queueLength?: number;
    queueSize?: number;
}

interface SharedTopicList {
    [settingsHash: string]: Topic<unknown>;
}

export type DefaultMessageType = Message;
type TopicHashObj = Pick<Ros, 'uid'> & TopicSettings;

const sharedTopics: SharedTopicList = {};
const TOPIC_REMOVE_TIMEOUT = 500;

function tryUnregister<TMessage>(topic: Topic<TMessage>) {
    setTimeout(() => {
        if (topic.settingsHash === undefined || topic.settingsHash === '') {
            return;
        }
        if (!topic.hasListeners()) {
            delete sharedTopics[topic.settingsHash];
        }
    }, TOPIC_REMOVE_TIMEOUT);
}

export function getTopic<TMessage = DefaultMessageType>(
    ros: Ros,
    partialSettings: TopicSettings,
): Topic<TMessage> {
    if (ros.uid === undefined || ros.uid === '') {
        ros.uid = uuidv4();
    }

    const settings: Required<TopicSettings> = {
        topic: partialSettings.topic,
        messageType: partialSettings.messageType,
        throttleRate: partialSettings.throttleRate ?? 10,
        latch: partialSettings.latch ?? false,
        queueLength: partialSettings.queueLength ?? 1,
        queueSize: partialSettings.queueSize ?? 10,
    };

    // Hash to tell different ros connections apart
    const hashObj: TopicHashObj = {
        uid: ros.uid,
        ...settings,
    };
    const hashStr = hash(hashObj, { respectType: false });

    if (sharedTopics[hashStr] === undefined) {
        // Create new topic
        const newTopic = new Topic<TMessage>({
            ros,
            name: settings.topic,
            messageType: settings.messageType,
            throttle_rate: settings.throttleRate,
            latch: settings.latch,
            queue_length: settings.queueLength,
            queue_size: settings.queueSize,
        });
        newTopic.settingsHash = hashStr;
        sharedTopics[hashStr] = newTopic;
    }

    /*
    If it has the correct hash, then it listens on the right topic,
    and has the correct messageType. Should be safe to cast.
     */
    return sharedTopics[hashStr] as Topic<TMessage>;
}

export function subscribe<TMessage = DefaultMessageType>(
    ros: Ros,
    settings: TopicSettings,
    callback: (message: TMessage) => void,
): Topic<TMessage> {
    const topic = getTopic<TMessage>(ros, settings);
    topic.subscribe(callback);
    return topic;
}

export function unsubscribe<TMessage = DefaultMessageType>(
    topic: Topic<TMessage>,
    callback?: (message: TMessage) => void,
): void {
    if (callback) {
        topic.unsubscribe(callback);
    } else {
        topic.unsubscribe();
    }
    tryUnregister(topic);
}
