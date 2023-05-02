import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRos } from '../RosConnection';
import { Ros, Service, ServiceRequest, ServiceResponse } from 'roslib';

export const ServiceCaller = (props: ServiceCallerProps) => {
    const { name, serviceType, trigger, request, callback, failedCallback } = props;
    const ros = useRos();
    useEffect(() => {
        if (trigger) {
            callService(ros, name, serviceType, request, callback, failedCallback);
        }
    }, [trigger]);

    return <Fragment />;
};

export type DefaultSrvReqType = object;
export type DefaultSrvRespType = ServiceResponse;

export interface ServiceCallerProps<
    TReq = DefaultSrvReqType,
    TResp = DefaultSrvRespType,
> {
    name: string;
    serviceType: string;
    trigger?: boolean;
    request?: TReq;
    callback?: (resp: TResp) => void;
    failedCallback?: (error: any) => void;
}

export type ServiceCB<
    TReq = DefaultSrvReqType,
    TResp = DefaultSrvRespType,
> = ServiceCallerProps<TReq, TResp>['callback'];

ServiceCaller.propTypes = {
    name: PropTypes.string.isRequired,
    serviceType: PropTypes.string,
    trigger: PropTypes.bool,
    request: PropTypes.object,
    callback: PropTypes.func,
    failedCallback: PropTypes.func,
};

function respCb<TResp = DefaultSrvRespType>(resp: TResp) {}

export function callService<TReq = DefaultSrvReqType, TResp = DefaultSrvRespType>(
    ros: Ros,
    name: string,
    serviceType: string,
    request?: TReq,
    callback: ServiceCB<unknown, TResp> = respCb<TResp>,
    failedCallback?: (error: any) => void,
) {
    // ServiceRequest just runs Object.assign under the hood, no reason to template as TReq
    // Just need to take in TReq and pass to ServiceRequest
    const service = new Service<ServiceRequest, TResp>({ ros, name, serviceType });
    const serviceRequest = new ServiceRequest(request);
    service.callService(serviceRequest, callback, failedCallback);
}
