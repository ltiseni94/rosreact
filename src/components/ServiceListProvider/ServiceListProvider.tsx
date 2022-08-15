import React, {createContext, useState, useEffect} from "react";
import PropTypes from "prop-types";
import { Ros } from "roslib";
import { useRos } from "../RosConnection";
import { useCheckedContext } from "../common";


const initialServices: string[] = [];
const ServiceListContext = createContext(initialServices);


export const ServiceListProvider = (props: ServiceListProviderProps) => {
    const ros = useRos();
    const [serviceList, setServiceList] = useState(initialServices);
    const callback = (newServiceList: string[]) => {
        setServiceList(newServiceList);
    };

    useEffect(() => {
        if (props.trigger || props.trigger === undefined) {
            getServiceList(ros, callback, props.failedCallback)
        }
    }, [props.trigger]);

    return (
        <ServiceListContext.Provider value={serviceList}>
            {props.children}
        </ServiceListContext.Provider>
    )
}


interface ServiceListProviderProps {
    children?: React.ReactNode;
    trigger?: boolean;
    failedCallback?: (error: any) => void;
}


ServiceListProvider.propTypes = {
    children: PropTypes.node,
    trigger: PropTypes.bool,
    failedCallback: PropTypes.func,
}


export function getServiceList(ros: Ros, callback: (services: string[]) => void, failedCallback?: (error: any) => void) {
    ros.getServices(callback, failedCallback);
}


export function useServiceList(): string[] {
    return useCheckedContext(ServiceListContext);
}