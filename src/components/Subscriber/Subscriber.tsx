import PropTypes from 'prop-types';
import React, { createContext, useEffect, useState } from 'react';
import { Message } from 'roslib';

import { useCheckedContext } from '../common';
import { useRos } from '../RosConnection';
import { DefaultMessageType, subscribe, TopicSettings, unsubscribe } from '../../helpers/TopicHelpers';

const MessageContext = createContext(new Message({}));

export const Subscriber = (props: SubscriberComponentProps) => {
    const ros = useRos();

    const [message, setMessage] = useState(new Message(props.messageInitialValue));

    const {topic, messageType, throttleRate, latch, queueLength, queueSize, customCallback, ...other} = props;

    const topicSettings: TopicSettings = {
        topic,
        messageType,
        throttleRate,
        latch,
        queueLength,
        queueSize
    };

    const callback = customCallback || ((newMessage: Message) => {setMessage(newMessage)});

    useEffect(() => {
        const topic = subscribe(
            ros,
            topicSettings,
            callback,
        );
        return () => {
            unsubscribe(topic, callback);
        }
    }, []);

    return (
        <MessageContext.Provider value={message}>
            {props.children}
        </MessageContext.Provider>
    );
}

export interface SubscriberProps<TMessage = DefaultMessageType> extends TopicSettings {
    customCallback?: (msg: TMessage) => void;
    messageInitialValue?: TMessage;
}

type SubscriberComponentProps<TMessage = DefaultMessageType> = React.PropsWithChildren<SubscriberProps<TMessage>>;

Subscriber.propTypes = {
    children: PropTypes.node,
    topic: PropTypes.string.isRequired,
    messageType: PropTypes.string.isRequired,
    throttleRate: PropTypes.number,
    latch: PropTypes.bool,
    queueLength: PropTypes.number,
    queueSize: PropTypes.number,
    messageInitialValue: PropTypes.object,
}

export function useMsg(): Message {
    return useCheckedContext(MessageContext);
}
