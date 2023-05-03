import {
    callService,
    DefaultSrvReqType,
    DefaultSrvRespType,
    ServiceCallerProps,
} from './ServiceCaller';
import { useRos } from '../RosConnection';
import { useCallback } from 'react';

export type ServiceCallHookProps<
    TReq = DefaultSrvReqType,
    TResp = DefaultSrvRespType,
> = Omit<ServiceCallerProps<TReq, TResp>, 'trigger' | 'request'>;

export function useServiceCall<TReq = DefaultSrvReqType, TResp = DefaultSrvRespType>(
    props: ServiceCallHookProps<TReq, TResp>,
) {
    const ros = useRos();
    const { name, serviceType, callback, failedCallback } = props;

    const callSrv = useCallback(
        (request: TReq) => {
            callService<TReq, TResp>(
                ros,
                name,
                serviceType,
                request,
                callback,
                failedCallback,
            );
        },
        [ros, name, serviceType, callback, failedCallback],
    );

    const callSrvPromise = useCallback(
        (request: TReq) => {
            return new Promise<TResp>((resolve, reject) => {
                callService<TReq, TResp>(
                    ros,
                    name,
                    serviceType,
                    request,
                    res => resolve(res),
                    reject,
                );
            });
        },
        [ros, name, serviceType],
    );

    return { callSrv, callSrvPromise };
}
