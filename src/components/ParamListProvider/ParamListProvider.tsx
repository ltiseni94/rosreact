import React, {useState, useEffect, createContext} from "react";
import PropTypes from "prop-types";
import { useCheckedContext } from "../common";
import { Ros } from "roslib";
import { useRos } from "../RosConnection";


const initialParams: string[] = [];
const ParamListContext = createContext(initialParams);


export const ParamListProvider = (props: ParamListProviderProps) => {
    const ros = useRos();
    const get = props.trigger;
    const [paramList, setParamList] = useState(initialParams);
    const callback = (newParamList: string[]) => {
        setParamList(newParamList);
    };

    useEffect(() => {
        if (props.trigger || props.trigger === undefined) {
            getParamList(ros, callback, props.failedCallback)
        }
    }, [props.trigger]);

    return (
        <ParamListContext.Provider value={paramList}>
            {props.children}
        </ParamListContext.Provider>
    )
};


interface ParamListProviderProps {
    children?: React.ReactNode;
    trigger?: boolean;
    failedCallback?: (error: any) => void;
}


ParamListProvider.propTypes = {
    children: PropTypes.node,
    trigger: PropTypes.bool,
    failedCallback: PropTypes.func,
}


export function getParamList(ros: Ros, callback: (params: string[]) => void, failedCallback?: (error: any) => void) {
    ros.getParams(callback, failedCallback);
}


export function useParamList(): string[] {
    return useCheckedContext(ParamListContext);
}
