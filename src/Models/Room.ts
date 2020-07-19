import { BaseComponent } from '../Core/BaseComponent';
import { Client } from './Client';
import { encode } from '../Core/JWT';
import { SocketEvents } from '../Events/Socket';
import { SystemEvents } from '../Events/System';
import { Event } from '../Core/EventEmitter';
import { Message } from './Message';
import * as webpack from "webpack";
import numberToIdentifer = webpack.Template.numberToIdentifer;

export class Room extends BaseComponent {
    public id: string;
    private clientsLength: number;
    public clients: Client[] = [];

    constructor() {
        super();
        this.onInit();
    }

    protected onInit(): void {
        this.generateId();
        this.implementMembers();
        this.setupDefaults();
        this.setupEventListeners();
    }
    protected implementMembers(): void {
    }
    protected setupEventListeners(): void {
    }
    protected setupDefaults(): void {
        this.clientsLength = 0;
    }
    protected generateId(): void {
        this.id = encode();
    }
    private meet(): void {
        const leftClient = this.clients[0];
        const rightClient = this.clients[1];

        leftClient.pairedTo = rightClient;
        rightClient.pairedTo = leftClient;

        leftClient.socket.emit(SocketEvents.Meet, rightClient.mid);
        rightClient.socket.emit(SocketEvents.Meet, null);

        this.setupChat();
    }
    private next(client: Client): void {
        if (!this.id) return;

        for (const _client of this.clients) {
            _client.pairedTo = null;

            if (_client !== client) {
                _client.socket.emit(SocketEvents.Parting);
            }

            Event.emit(SystemEvents.Next, [client.id, this.id]);
        }

        this.id = null;
    }
    private kick(client: Client): void {
        if (!this.id) return;

        let abandonedClientId: string;

        for (const _client of this.clients) {
            if (_client !== client) {
                _client.pairedTo = null;
                abandonedClientId = _client.id;
                _client.socket.emit(SocketEvents.Parting);
            }
        }

        this.clients.splice(this.clients.indexOf(client), 1);
        this.clientsLength--;

        const payload = {roomId: this.id, disconnectedClientId: client.id}

        Event.emit(SystemEvents.DestroyRoom, payload);

        this.id = null;
    }
    private setupChat(): void {
        const leftClient = this.clients[0];
        const rightClient = this.clients[1];

        leftClient.socket.on(SocketEvents.TypeStart, () => {
            rightClient.socket.emit(SocketEvents.TypeStart);
        });
        leftClient.socket.on(SocketEvents.TypeEnd, () => {
            rightClient.socket.emit(SocketEvents.TypeEnd);
        });
        leftClient.socket.on(SocketEvents.Message, (msg: Message) => {
            rightClient.socket.emit(SocketEvents.Message, msg);
        });
        rightClient.socket.on(SocketEvents.TypeStart, () => {
            leftClient.socket.emit(SocketEvents.TypeStart);
        });
        rightClient.socket.on(SocketEvents.TypeEnd, () => {
            leftClient.socket.emit(SocketEvents.TypeEnd);
        });
        rightClient.socket.on(SocketEvents.Message, (msg: Message) => {
            leftClient.socket.emit(SocketEvents.Message, msg);
        });
    }

    public getId(): string {
        return this.id;
    }
    public isFull(): boolean {
        return this.clientsLength === 2;
    }
    public join(client: Client): void {
        if (this.clientsLength < 2) {
            this.clients.push(client);
            this.clientsLength = this.clients.length;
        } else {
            console.log("Strange Error");
            throw new Error();
        }

        if (this.clientsLength === 2) {

            this.meet();
        }

        client.socket.on(SocketEvents.Disconnect, () => this.kick(client));
        client.socket.on(SocketEvents.Next, () => this.next(client));
    }
}
