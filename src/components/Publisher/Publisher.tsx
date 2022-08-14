import React, { useEffect, useState, Fragment } from "react";
import PropTypes from "prop-types";
import { Message } from "roslib";
import { useRos } from "../RosConnection";
import { TopicSettings, getTopic } from "../Subscriber";


export const Publisher = (props: PublisherProps) => {
    const ros = useRos();
    const [publisherTimer, setPublisherTimer] = useState(false);

    const {topic, messageType, throttleRate, latch, queueLength, queueSize, ...otherProps} = props;
    const topicSettings: TopicSettings = {
        topic,
        messageType,
        throttleRate,
        latch,
        queueLength,
        queueSize
    };

    const publisher = getTopic(ros, topicSettings);

    if (props.autoRepeat) {
        const rate = throttleRate || 1;
        const period = Math.round(1000 / rate);
        useEffect(() => {
            const timer = setTimeout(() => {
                publisher.publish(props.message);
                setPublisherTimer(!publisherTimer);
            }, period);
            return () => {clearTimeout(timer)}
        }, [publisherTimer]);
    } else {
        useEffect(() => {
            publisher.publish(props.message);
        }, [props.message]);
    }

    useEffect(() => {
        return () => {
            publisher.unadvertise();
        }
    }, []);

    return <Fragment/>
}


interface PublisherProps {
    topic: string;
    message: Message;
    messageType: string;
    throttleRate?: number;
    latch?: boolean;
    queueLength?: number;
    queueSize?: number;
    autoRepeat?: boolean;
}


Publisher.propTypes = {
    topic: PropTypes.string.isRequired,
    message: PropTypes.object,
    messageType: PropTypes.string.isRequired,
    throttleRate: PropTypes.number,
    latch: PropTypes.bool,
    queueLength: PropTypes.number,
    queueSize: PropTypes.number,
    autoRepeat: PropTypes.bool,
}