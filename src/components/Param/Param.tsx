import React, {useEffect, useState, createContext} from 'react';
import PropTypes from 'prop-types';
import { useRos } from '../RosConnection';
import { Param as RosParam } from 'roslib';
import { useCheckedContext } from '../common';


const ParamContext = createContext(null);


export const Param = (props: ParamProps) => {
    const ros = useRos();
    const param = new RosParam({ros: ros, name: props.name});
    const [paramValue, setParamValue] = useState(null);

    useEffect(() => {
        if (!(props.setValue == null)) {
            param.set(props.setValue, props.setCallback)
        }
    }, [props.setValue]);

    useEffect(() => {
        if (props.get === true) {
            param.get((response) => {
                setParamValue(response);
            });
        }
    }, [props.get])

    useEffect(() => {
        if (props.delete === true) {
            const deleteCallback = props.deleteCallback || ((resp) => {;});
            param.delete(deleteCallback);
        }
    }, [props.delete]);

    return (
        <ParamContext.Provider value={paramValue}>
            {props.children}
        </ParamContext.Provider>
    );
};


interface ParamProps {
    children?: React.ReactNode;
    name: string;
    setValue?: any;
    get?: boolean;
    setCallback?: (response: any) => void;
    delete?: boolean;
    deleteCallback?: (response: any) => void;
};


Param.propTypes = {
    children: PropTypes.node,
    name: PropTypes.string.isRequired,
    setValue: PropTypes.any,
    delete: PropTypes.bool,
    setCallback: PropTypes.func,
    deleteCallback: PropTypes.func,
};


export function useParam() : any {
    return useCheckedContext(ParamContext);
};
