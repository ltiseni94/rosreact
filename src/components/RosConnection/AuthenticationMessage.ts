import { sha512 } from 'js-sha512';

export class AuthenticationMessage {
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
