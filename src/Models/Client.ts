import * as io from "socket.io";

export class Client {
    public id: string;
    public mid: string;
    public status: boolean;
    public roomId: string;
    public pairedTo: Client;
    public socket: io.Socket;
}
