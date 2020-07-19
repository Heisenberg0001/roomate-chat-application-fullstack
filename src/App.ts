import * as express from "express";
import * as io from "socket.io";
import * as http from "http";
import * as path from 'path';
import * as bodyParser from 'body-parser';
import { Master } from './Modules/Master';
import { Request, Response } from 'express';
const PeerServer = require("peer").PeerServer;

export class App {
    private express: express.Application;
    private http: http.Server;
    private io: io.Server;
    private peer: any;
    private masterComponent: Master;

    constructor() {
        this.onInit();
    }

    protected onInit(): void {
        this.implementMembers();
        this.config();
        this.setupDefaultRoutes();
        this.setupMaster();
    }
    protected implementMembers(): void {
        this.express = express();
        this.http = new http.Server(this.express);
        this.io = io(this.http);
        this.peer = PeerServer({
            port: 3001,
            path: "/peerjs",
            key: "peerjs"
        });
    }
    protected config(): void {
        this.express.use(express.static(path.join(__dirname, "../public")));
        this.express.use(bodyParser.urlencoded({extended: true}));
        this.express.use(bodyParser.json());
    }
    protected setupDefaultRoutes(): void {
        this.express.get("/", (req, res) => {
            res.sendFile("./index.html");
        });
        this.express.post("/ping", (req: Request, res: Response) => {
            let token = this.masterComponent.getClientToken(req.body.token);

            res.status(200).send(token);
        });
    }
    protected setupMaster(): void {
        this.masterComponent = new Master(this.io);
    }

    public invokeServer(): void {
        this.http.listen(3000, () => {
            // @ts-ignore
            console.log("Server is running...");
        });
    }
}
