import React, {createContext, useContext, Fragment, useEffect} from 'react';
import PropTypes from 'prop-types';
import { Ros } from 'roslib';
import { connect, setupConnectionCallbacks, closeConnection } from "./utils";

const RosContext = createContext(new Ros({}));
const RosHandle = new Ros({});

interface RosProviderProps {
    children: React.ReactNode;
}

const RosProvider = (props : RosProviderProps) => {
    return (
        <RosContext.Provider value={RosHandle}>
            {props.children}
        </RosContext.Provider>
    );
}

RosProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export function useRos() : Ros {
    const ros = useContext(RosContext);
    if (ros === undefined) {
        throw new Error('useRos must be used in a component wrapped by a RosProvider')
    }
    return ros;
}

interface ConnectionProps {
    url: string;
    autoConnect?: boolean;
    autoConnectTimeout?: number;
    authenticate?: boolean;
    user?: string;
    password?: string;
}

const Connection = (props : ConnectionProps) => {
    const ros = useRos();

    useEffect(() => {
        setupConnectionCallbacks(ros, props.url, props.autoConnect, props.autoConnectTimeout, props.authenticate, props.user, props.password);
        connect(ros, props.url, props.authenticate, props.user, props.password)
        return () => {
            closeConnection(ros);
        }
    }, []);

    return (
        <Fragment/>
    )
}

Connection.propTypes = {
    url: PropTypes.string.isRequired,
    autoConnect: PropTypes.bool,
    autoConnectTimeout: PropTypes.number,
    authenticate: PropTypes.bool,
    user: PropTypes.string,
    password: PropTypes.string,
}

interface RosConnectionProps {
    children: React.ReactNode;
    url: string;
    autoConnect: boolean;
    autoConnectTimeout: number;
    authenticate?: boolean;
    user?: string;
    password?: string;
}

export const RosConnection = (props: RosConnectionProps) => {
    const autoConnectTimeout = props.autoConnectTimeout || 1000;
    const autoConnect = props.autoConnect || false;
    const authenticate = props.authenticate || false;
    const url = props.url || "ws://127.0.0.1:9090";
    const user = props.user || "";
    const password = props.password || "";

    return (
        <RosProvider>
            <Connection url={url} autoConnect={autoConnect} autoConnectTimeout={autoConnectTimeout} authenticate={authenticate} user={user} password={password}/>
            {props.children}
        </RosProvider>
    )
}

RosConnection.propTypes = {
    children: PropTypes.node,
    url: PropTypes.string.isRequired,
    autoConnect: PropTypes.bool,
    autoConnectTimeout: PropTypes.number,
    authenticate: PropTypes.bool,
    user: PropTypes.string,
    password: PropTypes.string,
}
