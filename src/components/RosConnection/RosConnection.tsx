import React, {createContext, useContext, useEffect} from 'react';
import PropTypes from 'prop-types';
import { Ros } from 'roslib';
import { sha512 } from "js-sha512";

const RosHandle = new Ros({});
const RosContext = createContext(RosHandle);

interface RosProviderProps {
    children: React.ReactNode;
    url: string;
    autoConnect?: boolean;
    autoConnectTimeout?: number;
    authenticate?: boolean;
    user?: string;
    password?: string;
}

export const RosConnection = (props : RosProviderProps) => {
    
    useEffect(() => {
        setupConnectionCallbacks(RosHandle, props.url, props.autoConnect, props.autoConnectTimeout, props.authenticate, props.user, props.password);
        connect(RosHandle, props.url, props.authenticate, props.user, props.password)
        return () => {
            closeConnection(RosHandle);
        }
    }, []);

    return (
        <RosContext.Provider value={RosHandle}>
            {props.children}
        </RosContext.Provider>
    );
}

RosConnection.propTypes = {
    children: PropTypes.node.isRequired,
    url: PropTypes.string.isRequired,
    autoConnect: PropTypes.bool,
    autoConnectTimeout: PropTypes.number,
    authenticate: PropTypes.bool,
    user: PropTypes.string,
    password: PropTypes.string,
};

export function useRos() : Ros {
    const ros = useContext(RosContext);
    if (ros === undefined) {
        throw new Error('useRos must be used in a component wrapped by a RosProvider')
    }
    return ros;
}


export function setupConnectionCallbacks (ros: Ros, url: string = "ws://127.0.0.1:9090", autoConnect: boolean = true, autoConnectTimeout: number = 1, authenticate: boolean = false, user: string = '', password: string = '') : void {
    ros.on('connection', () => {
        console.log("Connected")
    });
    ros.on('close', () => {
        console.log("Disconnected");
    });
    ros.on('error', () => {
        console.log("Connection error");
        if (autoConnect) {
            setTimeout(() => {
                connect(ros, url, authenticate, user, password);
            }, autoConnectTimeout);
        }
    })
}

export function connect (ros: Ros, url: string, authenticate: boolean = false, user: string = '', password: string = '') : void {
    ros.connect(url);
    if (authenticate) {

        const authMessage = new AuthenticationMessage(url, user, password);
        
        ros.authenticate(authMessage.getMac(), authMessage.client, authMessage.dest, authMessage.rand, authMessage.time, authMessage.level, authMessage.timeEnd);
    }
}

export function closeConnection (ros: Ros) : void {
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
        this.rand = "randomstring";
        this.time = new Date().getTime();
        this.level = "user";
        this.timeEnd = this.time;
    }

    getMac() {
        return sha512(this.secret + this.client + this.dest + this.rand + this.time.toString() + this.level + this.timeEnd.toString());
    }
}