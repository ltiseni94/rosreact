import { useEffect, useRef, useState } from 'react';

import { DefaultMessageType, subscribe, unsubscribe } from '../../helpers/TopicHelpers';
import { useRos } from '../RosConnection';
import { SubscriberProps } from './Subscriber';

export type UseSubscriptionProps<TMessage = DefaultMessageType> =
    SubscriberProps<TMessage> & {
        /**
         * Function to determine if messages are the same to cut down on renders. Do not set if you want every message.
         * @param o1 The existing message
         * @param o2 The new incoming message
         * @return Standard comparison result, `true` or `0` if equal, `false` or non-zero otherwise.
         */
        compareFunc?: (
            o1: TMessage | null | undefined,
            o2: TMessage | null | undefined,
        ) => boolean | number;
    };

export function useSubscription<TMessage = DefaultMessageType>(
    props: UseSubscriptionProps<TMessage>,
): TMessage | null {
    const ros = useRos();

    const {
        topic,
        messageType,
        throttleRate,
        latch,
        queueLength,
        queueSize,
        customCallback,
        compareFunc,
    } = props;

    const [message, setMessage] = useState<TMessage | null>(
        props.messageInitialValue ?? null,
    );
    const messageRef = useRef(message);

    useEffect(() => {
        const updateMessage = (msg: TMessage) => {
            setMessage(msg);
            messageRef.current = msg;
        };

        const messageCallback = (newMsg: TMessage) => {
            if (compareFunc) {
                const compareRes = compareFunc(messageRef.current, newMsg);
                // The values are the same, return.
                if (compareRes === true || compareRes === 0) {
                    return;
                }
            }

            if (customCallback) {
                customCallback(newMsg);
            }

            updateMessage(newMsg);
        };

        const subscription = subscribe(
            ros,
            {
                topic,
                messageType,
                throttleRate,
                latch,
                queueLength,
                queueSize,
            },
            messageCallback,
        );

        return () => {
            unsubscribe(subscription, messageCallback);
        };
    }, [
        ros,
        topic,
        messageType,
        throttleRate,
        latch,
        queueLength,
        queueSize,
        customCallback,
        compareFunc,
    ]);

    return message;
}
