import { sha512 } from "js-sha512";
import { Ros } from 'roslib';

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

export function connect (ros: Ros, url: string, authenticate: boolean = false, user: string = '', password: string = '') : void {
    ros.connect(url);
    if (authenticate) {

        const authMessage = new AuthenticationMessage(url, user, password);
        
        ros.authenticate(authMessage.getMac(), authMessage.client, authMessage.dest, authMessage.rand, authMessage.time, authMessage.level, authMessage.timeEnd);
    }
}

export function closeConnection (ros: Ros) : void {
    ros.close();
};

