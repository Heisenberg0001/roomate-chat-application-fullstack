import { Component } from '../core/Component';
import { SocketIOEvents } from '../shared/Events';
import * as io from "socket.io-client";
import { getToken, storeToken } from '../shared/AccessToken';
import { Message } from '../core/Message';

export class SocketCommunicator extends Component {
    private io: any;

    constructor() {
        super();
        this.onInit();
    }

    protected onInit(): void {
        this.implementMembers();
        this.setupDefaults();
        this.setupEvents();
    }
    protected implementMembers(): void {
        this.io = io("belfort.ge");
        // this.io = io("localhost:3000");
    }
    protected setupDefaults(): void {}
    protected setupEvents(): void {
        this.io.on(SocketIOEvents.Meet, (message: string) => {
            const event = new CustomEvent(SocketIOEvents.Meet, {detail: message});

            window.dispatchEvent(event);
        });
        this.io.on(SocketIOEvents.Parting, () => {
            const event = new CustomEvent(SocketIOEvents.Parting);

            window.dispatchEvent(event);
        });
        this.io.on(SocketIOEvents.TypeStart, () => {
            const event = new CustomEvent(SocketIOEvents.TypeStart);

            window.dispatchEvent(event);
        });
        this.io.on(SocketIOEvents.TypeEnd, () => {
            const event = new CustomEvent(SocketIOEvents.TypeEnd);

            window.dispatchEvent(event);
        });
        this.io.on(SocketIOEvents.Message, (message: Message) => {
            const event = new CustomEvent(SocketIOEvents.Message, {detail: message});

            window.dispatchEvent(event);
        });
    }

    public connect(): void {
        const token = getToken();
        const payload = {
            id: token,
            mid: window["mid"]
        }

        this.io.emit("verify", payload);
    }
    public disconnect(): void {
        this.io.emit(SocketIOEvents.Next);
    }
    public sendMessage(message: Message): void {
        this.io.emit(SocketIOEvents.Message, message);
    }
}
