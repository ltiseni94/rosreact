import { sha512 } from 'js-sha512';
import PropTypes from 'prop-types';
import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { Ros } from 'roslib';

import { getRosObject } from './RosInstanceManager';

const RosContext = createContext<Ros>(new Ros({}));

interface RosConnectionProps {
    url?: string;
    autoConnect?: boolean;
    autoConnectTimeout?: number;
    authenticate?: boolean;
    user?: string;
    password?: string;
}

const DefaultRosProps: Required<RosConnectionProps> = {
    url: 'ws://127.0.0.1:9090',
    autoConnect: false,
    autoConnectTimeout: 1000,
    authenticate: false,
    user: '',
    password: '',
};

export const RosConnection = ({
    children,
    ...userProps
}: PropsWithChildren<Partial<RosConnectionProps>>) => {
    const props = { ...DefaultRosProps, ...userProps };
    const [url, setUrl] = useState(props.url);
    const rosRef = useRef<Ros>(new Ros({}));

    // Trigger update if URL changes
    useEffect(() => {
        setUrl(props.url);
    }, [props.url]);

    useEffect(() => {
        rosRef.current = getRosObject(url);

        setupConnectionCallbacks(
            rosRef.current,
            url,
            props.autoConnect,
            props.autoConnectTimeout,
            props.authenticate,
            props.user,
            props.password,
        );
        connect(rosRef.current, url, props.authenticate, props.user, props.password);
        return () => {
            closeConnection(rosRef.current);
        };
    }, [
        url,
        props.authenticate,
        props.autoConnect,
        props.autoConnectTimeout,
        props.password,
        props.user,
    ]);

    return <RosContext.Provider value={rosRef.current}>{children}</RosContext.Provider>;
};

RosConnection.propTypes = {
    children: PropTypes.node.isRequired,
    url: PropTypes.string.isRequired,
    autoConnect: PropTypes.bool,
    autoConnectTimeout: PropTypes.number,
    authenticate: PropTypes.bool,
    user: PropTypes.string,
    password: PropTypes.string,
};

export function setupConnectionCallbacks(
    ros: Ros,
    url = DefaultRosProps.url,
    autoConnect = DefaultRosProps.autoConnect,
    autoConnectTimeout = DefaultRosProps.autoConnectTimeout,
    authenticate = DefaultRosProps.authenticate,
    user = DefaultRosProps.user,
    password = DefaultRosProps.password,
): void {
    ros.on('connection', () => {
        console.log('Connected');
    });
    ros.on('close', () => {
        console.log('Disconnected');
    });
    ros.on('error', () => {
        console.log('Connection error');

        // Attempt to reconnect
        if (autoConnect) {
            setTimeout(() => {
                connect(ros, url, authenticate, user, password);
            }, autoConnectTimeout);
        }
    });
}

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
}

class AuthenticationMessage {
    secret: string;
    client: string;
    dest: string;
    rand: string;
    time: number;
    timeEnd: number;
    level: string;

    constructor(url: string, user: string, password: string) {
        this.dest = url;
        this.client = user;
        this.secret = password;
        this.rand = 'randomstring';
        this.time = new Date().getTime();
        this.level = 'user';
        this.timeEnd = this.time;
    }

    getMac() {
        return sha512(
            this.secret +
                this.client +
                this.dest +
                this.rand +
                this.time.toString() +
                this.level +
                this.timeEnd.toString(),
        );
    }
}

export function useRos(): Ros {
    const ros = useContext(RosContext);
    if (ros === undefined) {
        throw new Error('rosreact components must be wrapped by a RosProvider');
    }
    return ros;
}
