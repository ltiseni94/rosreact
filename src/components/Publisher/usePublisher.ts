import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
    advertise,
    DefaultMessageType,
    getCachedTopic,
    TopicSettings,
    unadvertise,
} from '../../helpers/TopicHelpers';
import { useRos } from '../RosConnection';

export type PublisherHook<T> = {
    publish: (msg: T) => void;
};

export interface PublisherProps<TMessage = DefaultMessageType> extends TopicSettings {
    message?: TMessage;
    autoRepeat?: boolean;
}

export function usePublisher<TMessage = DefaultMessageType>(
    props: PublisherProps<TMessage>,
): PublisherHook<TMessage> {
    const hookId = useRef(uuidv4());
    const ros = useRos();

    const { message, autoRepeat, ...topicSettings } = props;

    const publisher = getCachedTopic<TMessage>(ros, topicSettings);

    useEffect(() => {
        let intervalId: number | undefined = undefined;
        let intervalStarted = false;

        if (!message) {
            return;
        }

        if (autoRepeat) {
            const rate = topicSettings.throttleRate ?? 1;
            const period = Math.round(1000 / rate);
            intervalId = window.setInterval(() => {
                publisher.publish(message);
                intervalStarted = true;
            }, period);
        } else {
            publisher.publish(message);
        }

        return () => {
            clearInterval(intervalId);
            if (
                autoRepeat &&
                !intervalStarted &&
                message !== undefined &&
                publisher.isAdvertised
            ) {
                publisher.publish(message);
            }
        };
    }, [autoRepeat, message, publisher, topicSettings.throttleRate]);

    useEffect(() => {
        const id = hookId.current;
        advertise(publisher, id);
        return () => {
            unadvertise(publisher, id);
        };
    }, [publisher]);

    return {
        publish: msg => {
            publisher.publish(msg);
        },
    };
}
