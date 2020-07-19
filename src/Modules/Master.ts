import * as io from "socket.io";
import { BaseComponent } from '../Core/BaseComponent';
import { SystemEvents } from '../Events/System';
import { encode } from '../Core/JWT';
import { Room } from '../Models/Room';
import { Client } from '../Models/Client';
import { SocketEvents } from '../Events/Socket';
import { Event } from '../Core/EventEmitter';

export class Master extends BaseComponent {
    private clients: Map<string, Client>;
    private rooms: Map<string, Room>;

    constructor(protected readonly io: io.Server) {
        super();

        this.onInit();
    }

    protected onInit(): void {
        this.implementMembers();
        this.setupEventListeners();

        this.generateRoom();
        this.invokeSocketConnection();
    }
    protected implementMembers(): void {
        this.clients = new Map<string, Client>();
        this.rooms = new Map<string, Room>();
    }
    protected setupEventListeners(): void {
        Event.on(SystemEvents.DestroyRoom, (payload: {roomId: string, disconnectedClientId: string}) => {
            console.log("Size Of Rooms: ", this.rooms.size);
            console.log("Payload: ", payload)
            const room = this.rooms.get(payload.roomId);
            console.log("Room ID: ", room.id);
            const abandonedClient = room.clients[0]


            this.rooms.delete(payload.roomId);
            console.log("====ROOMS====")
            console.log(this.rooms);
            console.log("====ROOMS====")
            this.clients.delete(payload.disconnectedClientId);

            if (abandonedClient) {
                this.distributeClient(abandonedClient);
            } else {
                console.error("Abandoned Client Not Found")
            }
        });
        Event.on(SystemEvents.Next, (payload: any[]) => {
            if (payload[1]) {
                this.rooms.delete(payload[1]);
            }

            const client = this.clients.get(payload[0]);

            this.distributeClient(client);
        })
    }
    // Connections & Pairing Methods
    protected invokeSocketConnection(): void {
        this.io.on(SocketEvents.Connection, this.onSocketConnect.bind(this));
    }
    protected onSocketConnect(socket: io.Socket): void {
        socket.on(SocketEvents.Verify, this.onSocketVerify.bind(this, socket));
    }
    protected onSocketVerify(socket: io.Socket, payload: {id: string, mid: string}): void {
        const id = payload.id;
        const mid = payload.mid;

        if(id && !this.clients.has(id)) {
            const newClient = this.generateClient(id, mid, socket);

            this.distributeClient(newClient);
        } else {
            console.error("Error Client Already Exists");
        }
    }
    private generateRoom(): Room {
        const newRoom = new Room();

        this.rooms.set(newRoom.getId(), newRoom);


        return newRoom;
    }
    private generateClient(id: string, mid: string, socket: io.Socket): Client {
        const newClient = new Client();

        newClient.id = id;
        newClient.mid = mid;
        newClient.pairedTo = null;
        newClient.socket = socket;
        newClient.status = true;
        newClient.roomId = null;

        this.clients.set(id, newClient);

        return newClient;
    }
    private distributeClient(client: Client): void {
        let availableRoom: Room = null;

        this.rooms.forEach((value) => {
            if (!value.isFull()) availableRoom = value;
        });

        if (availableRoom) {
            availableRoom.join(client);
        } else {
            const newRoom = this.generateRoom();

            newRoom.join(client);
        }
    }

    public getClientToken(_id: string): string {
        const id = _id ? _id : "";
        const client = this.clients.get(id);

        if (client) {
            return client.id;
        } else {
            return encode();
        }
    }
}
