import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { useRos } from "../RosConnection";
import { Ros, Service, ServiceRequest, ServiceResponse } from "roslib";


export const ServiceCaller = (props: ServiceCallerProps) => {
    const {name, serviceType, trigger, request, callback, failedCallback} = props;
    const ros = useRos();
    useEffect(() => {
        if (trigger) {
            callService(ros, name, serviceType, request, callback, failedCallback);
        }
    }, [trigger])

    return <Fragment/>
}


interface ServiceCallerProps {
    name: string;
    serviceType: string;
    trigger?: boolean;
    request?: object;
    callback?: (resp: ServiceResponse) => void;
    failedCallback?: (error: any) => void;
}


ServiceCaller.propTypes = {
    name: PropTypes.string.isRequired,
    serviceType: PropTypes.string,
    trigger: PropTypes.bool,
    request: PropTypes.object,
    callback: PropTypes.func,
    failedCallback: PropTypes.func,
}


export function callService(ros: Ros, name: string, serviceType: string, request?: object, callback: ((resp: ServiceResponse) => void) = (resp) => {;}, failedCallback?: ((error: any) => void)) {
    const service = new Service({ros, name, serviceType});
    const serviceRequest = new ServiceRequest(request);
    service.callService(serviceRequest, callback, failedCallback);
}
