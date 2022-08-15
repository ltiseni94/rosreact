import { Ros } from "roslib";
import React, { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useRos } from "../RosConnection";
import { useCheckedContext } from "../common";


const initialTopics: string[] = [];
const initialTypes: string[] = [];

const TopicListContext = createContext({topics: initialTopics, types: initialTypes});


export const TopicListProvider = (props: TopicListProviderProps) => {
    const ros = useRos();
    const [topicList, setTopicList] = useState({topics: initialTopics, types: initialTypes});
    const callback = (newTopicList: {topics: string[], types: string[]}) => {
        setTopicList(newTopicList);
    };

    useEffect(() => {
        if (props.trigger || props.trigger === undefined) {
            getTopicList(ros, callback, props.failedCallback)
        }
    }, [props.trigger]);

    return (
        <TopicListContext.Provider value={topicList}>
            {props.children}
        </TopicListContext.Provider>
    )
}


interface TopicListProviderProps {
    children?: React.ReactNode;
    trigger?: boolean;
    failedCallback?: (error: any) => void;
}


TopicListProvider.propTypes = {
    children: PropTypes.node,
    trigger: PropTypes.bool,
    failedCallback: PropTypes.func,
}


export function getTopicList(ros: Ros, callback: (topics: {topics: string[], types: string[]}) => void, failedCallback?: (error: any) => void){
    ros.getTopics(callback, failedCallback);
}


export function useTopicList(): {topics: string[], types: string[]} {
    return useCheckedContext(TopicListContext);
}