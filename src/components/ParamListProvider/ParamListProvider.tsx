import React, {useState, useEffect, createContext} from "react";
import PropTypes from "prop-types";
import { useCheckedContext } from "../common";
import { Ros } from "roslib";
import { useRos } from "../RosConnection";


const initialParams: string[] = [];
const ParamListContext = createContext(initialParams);


export const ParamListProvider = (props: ParamListProviderProps) => {
    const ros = useRos();
    const [paramList, setParamList] = useState(initialParams);
    const callback = (newParamList: string[]) => {
        setParamList(newParamList);
    };

    useEffect(() => {
        if (props.fetch || props.fetch === undefined) {
            getParamList(ros, callback, props.failedCallback)
        }
    }, [props.fetch]);

    return (
        <ParamListContext.Provider value={paramList}>
            {props.children}
        </ParamListContext.Provider>
    )
};


interface ParamListProviderProps {
    children?: React.ReactNode;
    fetch?: boolean;
    failedCallback?: (error: any) => void;
}


ParamListProvider.propTypes = {
    children: PropTypes.node,
    fetch: PropTypes.bool,
    failedCallback: PropTypes.func,
}


export function getParamList(ros: Ros, callback: (params: string[]) => void, failedCallback?: (error: any) => void) {
    ros.getParams(callback, failedCallback);
}


export function useParamList(): string[] {
    return useCheckedContext(ParamListContext);
}
