import hash from 'object-hash';
import { Ros, Topic } from 'roslib';
import { v4 as uuidv4 } from 'uuid';

import { ManagedTopic } from './ManagedTopic';
import { DefaultMessageType, TopicSettings } from './types';

type TopicHashObj = Pick<Ros, 'uid'> & TopicSettings;

const sharedTopics = new Map<string, ManagedTopic<unknown>>();
const TOPIC_REMOVE_TIMEOUT = 500;

function tryUnregister<TMessage>(topic: Topic<TMessage>) {
    setTimeout(() => {
        if (topic.settingsHash === undefined || topic.settingsHash === '') {
            return;
        }
        const manager = sharedTopics.get(topic.settingsHash);

        if (manager !== undefined && manager.canBeRemoved()) {
            sharedTopics.delete(topic.settingsHash);
        }
    }, TOPIC_REMOVE_TIMEOUT);
}

function completeTopicSettings(partialSettings: TopicSettings): Required<TopicSettings> {
    return {
        topic: partialSettings.topic,
        messageType: partialSettings.messageType,
        throttleRate: partialSettings.throttleRate ?? 10,
        latch: partialSettings.latch ?? false,
        queueLength: partialSettings.queueLength ?? 1,
        queueSize: partialSettings.queueSize ?? 10,
    };
}

/**
 * Creates a new Topic object with RosReact enhancements.
 * This function will set a ros instance id, if not already set.
 * @param ros Ros instance
 * @param partialSettings Settings object
 * @return Topic object, with settingsHash applied
 */
export function createTopic<TMessage = DefaultMessageType>(
    ros: Ros,
    partialSettings: TopicSettings,
): Topic<TMessage> {
    if (ros.uid === undefined || ros.uid === '') {
        ros.uid = uuidv4();
    }

    const settings = completeTopicSettings(partialSettings);

    // Hash to tell different ros connections apart
    const hashObj: TopicHashObj = {
        uid: ros.uid,
        ...settings,
    };
    const hashStr = hash(hashObj, { respectType: false });

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

    return newTopic;
}

/**
 * Gets (or creates) a managed topic, and returns the topic object.
 * If the topic is created, it will be stored until removed by a helper function.
 * Topics gotten this way should always be managed with the RosReact
 * `subscribe`, `advertise`, `unsubscribe`, etc. functions to use cache functionality.
 * @param ros Ros object
 * @param partialSettings Settings object
 */
export function getCachedTopic<TMessage = DefaultMessageType>(
    ros: Ros,
    partialSettings: TopicSettings,
): Topic<TMessage> {
    if (ros.uid === undefined || ros.uid === '') {
        ros.uid = uuidv4();
    }

    const settings = completeTopicSettings(partialSettings);

    // Hash to tell different ros connections apart
    const hashObj: TopicHashObj = {
        uid: ros.uid,
        ...settings,
    };
    const hashStr = hash(hashObj, { respectType: false });

    let manager = sharedTopics.get(hashStr);

    if (manager === undefined) {
        // Create new topic
        manager = new ManagedTopic<TMessage>({
            ros,
            name: settings.topic,
            messageType: settings.messageType,
            throttle_rate: settings.throttleRate,
            latch: settings.latch,
            queue_length: settings.queueLength,
            queue_size: settings.queueSize,
        });
        manager.topic.settingsHash = hashStr;
        sharedTopics.set(hashStr, manager);
    }

    /*
    If it has the correct hash, then it listens on the right topic,
    and has the correct messageType. Should be safe to cast.
     */
    return manager.topic as Topic<TMessage>;
}

export function subscribe<TMessage = DefaultMessageType>(
    ros: Ros,
    settings: TopicSettings,
    callback: (message: TMessage) => void,
): Topic<TMessage> {
    const topic = getCachedTopic<TMessage>(ros, settings);
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
