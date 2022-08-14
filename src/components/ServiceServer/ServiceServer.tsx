import React, {useEffect, Fragment} from "react";
import PropTypes from "prop-types";
import { useRos } from "../RosConnection";
import { Service, ServiceRequest, ServiceResponse } from "roslib";


export const ServiceServer = (props: ServiceServerProps) => {
    const {name, serviceType, callback} = props;
    const ros = useRos();

    useEffect(() => {
        const service = new Service({ros, name, serviceType});
        service.advertise(wrapServerCallback(callback));
        return () => {
            service.unadvertise();
        }
    }, []);

    return <Fragment/>
}


interface ServiceServerProps {
    name: string;
    serviceType: string;
    callback: (req: ServiceRequest, resp: ServiceResponse) => void;
};


ServiceServer.propTypes = {
    name: PropTypes.string.isRequired,
    serviceType: PropTypes.string.isRequired,
    callback: PropTypes.func.isRequired,
}


export function wrapServerCallback(callback: (req: ServiceRequest, resp: ServiceResponse) => void) : (req: ServiceRequest, resp: ServiceResponse) => boolean {
    return (request: ServiceRequest, response: ServiceResponse) => {
        callback(request, response);
        return true;
    }
}