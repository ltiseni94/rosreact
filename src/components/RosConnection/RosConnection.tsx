import PropTypes from 'prop-types';
import React, { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import { Ros } from 'roslib';

import type { VoidFunc } from '../../declarations/types';
import { AuthenticationMessage } from './AuthenticationMessage';
import { getRosObject } from './RosInstanceManager';

/**** Types ****/
interface RosConnectionProps {
    url?: string;
    autoConnect?: boolean;
    autoConnectTimeout?: number;
    authenticate?: boolean;
    user?: string;
    password?: string;
}

/**** Component Definition ****/

const DefaultRosProps: Required<RosConnectionProps> = {
    url: 'ws://127.0.0.1:9090',
    autoConnect: false,
    autoConnectTimeout: 1000,
    authenticate: false,
    user: '',
    password: '',
};

const RosContext = createContext<Ros>(getRosObject(DefaultRosProps.url));

export const RosConnection = ({
    children,
    ...userProps
}: PropsWithChildren<Partial<RosConnectionProps>>) => {
    const props = { ...DefaultRosProps, ...userProps };

    useEffect(() => {
        const curRos = getRosObject(props.url);

        setupConnectionCallbacks(
            curRos,
            props.url,
            props.autoConnect,
            props.autoConnectTimeout,
            props.authenticate,
            props.user,
            props.password,
        );
        connect(curRos, props.url, props.authenticate, props.user, props.password);
        return () => {
            closeConnection(curRos);
        };
    }, [
        props.authenticate,
        props.autoConnect,
        props.autoConnectTimeout,
        props.password,
        props.url,
        props.user,
    ]);

    return (
        <RosContext.Provider value={getRosObject(props.url)}>
            {children}
        </RosContext.Provider>
    );
};

RosConnection.propTypes = {
    children: PropTypes.node.isRequired,
    url: PropTypes.string,
    autoConnect: PropTypes.bool,
    autoConnectTimeout: PropTypes.number,
    authenticate: PropTypes.bool,
    user: PropTypes.string,
    password: PropTypes.string,
};

/**** Utility Functions ****/

export function connect(
    ros: Ros,
    url = DefaultRosProps.url,
    authenticate = DefaultRosProps.authenticate,
    user = DefaultRosProps.user,
    password = DefaultRosProps.password,
): void {
    ros.connect(url);
    if (authenticate) {
        const authMessage = new AuthenticationMessage(url, user, password);

        ros.authenticate(
            authMessage.getMac(),
            authMessage.client,
            authMessage.dest,
            authMessage.rand,
            authMessage.time,
            authMessage.level,
            authMessage.timeEnd,
        );
    }
}

export function closeConnection(ros: Ros): void {
    ros.close();

    // Unregister callbacks so they don't compound when remounting
    ros.connectorCallbacks.forEach((callbacks, event) => {
        callbacks.forEach(cb => {
            ros.off(event, cb);
        });
    });
    ros.connectorCallbacks.clear();
}

export function setupConnectionCallbacks(
    ros: Ros,
    url = DefaultRosProps.url,
    autoConnect = DefaultRosProps.autoConnect,
    autoConnectTimeout = DefaultRosProps.autoConnectTimeout,
    authenticate = DefaultRosProps.authenticate,
    user = DefaultRosProps.user,
    password = DefaultRosProps.password,
): void {
    const connectCB = () => {
        console.log(`Connected to instance ${ros.uid}`);
    };

    const closeCB = () => {
        console.log('Disconnected');
    };

    const errorCB = () => {
        console.log('Connection error');

        // Attempt to reconnect
        if (autoConnect) {
            setTimeout(() => {
                if (ros.connectorCallbacks.size === 0) {
                    // This ros instance is dormant
                    return;
                }
                connect(ros, url, authenticate, user, password);
            }, autoConnectTimeout);
        }
    };

    addCallback(ros, 'connection', connectCB);
    addCallback(ros, 'close', closeCB);
    addCallback(ros, 'error', errorCB);
}

/**
 * Attempts to add a callback to the ros instance, and register it in the set for
 * when we disconnect.
 * Fails silent if the callback already exists in the set.
 * @param ros Ros instance
 * @param event The event name (e.g. 'connect')
 * @param cb Callback function
 */
function addCallback(ros: Ros, event: string, cb: () => void) {
    // Get our callbacks for this event, create if not exists
    let cbSet = ros.connectorCallbacks.get(event);
    if (cbSet === undefined) {
        cbSet = new Set<VoidFunc>();
        ros.connectorCallbacks.set(event, cbSet);
    }

    // If the function we're trying to add already exists, return
    if (cbSet.has(cb)) {
        return;
    }

    // Add it to the event set, and turn on for this instance
    cbSet.add(cb);
    ros.on(event, cb);
}

export function useRos(): Ros {
    const ros = useContext(RosContext);
    if (ros === undefined) {
        throw new Error('rosreact components must be wrapped by a RosProvider');
    }
    return ros;
}
