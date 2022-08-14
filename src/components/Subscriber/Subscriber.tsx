import { Topic, Ros, Message } from "roslib";
import React, {useState, useEffect, createContext} from "react";
import PropTypes from "prop-types";
import { useRos } from "../RosConnection";
import { useCheckedContext } from "../common";


const MessageContext = createContext(new Message({}));

export const Subscriber = (props: SubscriberProps) => {
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


interface SubscriberProps {
    children?: React.ReactNode;
    topic: string;
    messageType: string;
    throttleRate?: number;
    latch?: boolean;
    queueLength?: number;
    queueSize?: number;
    customCallback?: (msg: Message) => void;
    messageInitialValue?: object;
}


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


export function subscribe(ros: Ros, settings: TopicSettings, callback: (message: Message) => void): Topic {
    const topic = getTopic(ros, settings);
    topic.subscribe(callback);
    return topic;
}


export function getTopic(ros: Ros, settings: TopicSettings) : Topic {
    const options = {
        ros: ros,
        name: settings.topic,
        messageType: settings.messageType,
        throttle_rate: settings.throttleRate || 10,
        latch: settings.latch || false,
        queue_length: settings.queueLength || 1,
        queue_size: settings.queueSize || 10,
    }
    return new Topic(options);
}


export interface TopicSettings {
    topic: string;
    messageType: string;
    throttleRate?: number;
    latch?: boolean;
    queueLength?: number;
    queueSize?: number;
}


export function unsubscribe(topic: Topic, callback?: (message: Message) => void): void {
    if (callback) {
        topic.unsubscribe(callback);
    } else {
        topic.unsubscribe();
    }
}


export function useMsg(): Message {
    return useCheckedContext(MessageContext);
}
