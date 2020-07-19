import { Component } from "../core/Component";
import { ENABLE_AUDIO, ENABLE_VIDEO } from "../shared/Config";
import { peerJSLog, systemLog } from "../shared/Log";
import { PeerJSEvents, SystemEvents } from "../shared/Events";
import { DeviceDebug } from '../shared/DeviceDebug';
// TODO Fix Problem Dependency
// @ts-ignore
import PeerJS from "peerjs";

export class MediaCommunicator extends Component {
    private localMediaReference: HTMLVideoElement;
    private remoteMediaReference: HTMLVideoElement;
    private localIdentifier: string;
    private remoteIdentifier: string;
    private peerJS: PeerJS;
    private peerJSCall: any;

    constructor() {
        super();
        this.onInit();
    }

    protected onInit(): void {
        this.implementMembers();
        this.setupDefaults();
        this.setupEvents();

        this.getUserMediaPermission();
    }
    protected implementMembers(): void {
        this.localMediaReference = document.getElementById("local-media") as HTMLVideoElement;
        this.remoteMediaReference = document.getElementById("remote-media") as HTMLVideoElement;
        // this.peerJS = new PeerJS();
        this.peerJS = new PeerJS({
            // host: "localhost",
            // port: 3001,
            host: "belfort.ge",
            port: 443,
            path: "peerjs",
            key: "peerjs"
        });
    }
    protected setupDefaults(): void {}
    protected setupEvents(): void {
        this.peerJS.on(PeerJSEvents.Open, this.onPeerInitialization.bind(this));
        this.peerJS.on(PeerJSEvents.Connect, this.onPeerConnection.bind(this));
        this.peerJS.on(PeerJSEvents.Call, this.onPeerCalling.bind(this));
        this.peerJS.on(PeerJSEvents.Stream, this.onPeerStream.bind(this));
        this.peerJS.on(PeerJSEvents.Close, this.onPeerClose.bind(this));
        this.peerJS.on(PeerJSEvents.Disconnect, this.onPeerClose.bind(this));
        this.peerJS.on(PeerJSEvents.Error, this.onPeerJSError.bind(this));
    }
    private getUserMediaPermission(): void {
        const constraints: object = {
            audio: ENABLE_AUDIO,
            video: ENABLE_VIDEO
        }

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        navigator.getUserMedia(constraints, (stream: MediaStream) => {
            this.streamLocalVideo(stream);
        }, () => {
            systemLog("Permission Denied, Can't Access To Camera.");
            // TODO Implement Error Notification
        });
    }
    private streamLocalVideo(stream: MediaStream): void {
        this.localMediaReference.srcObject = stream;
        window.localStream = stream;
    }
    private streamRemoteVideo(stream: MediaStream): void {
        this.remoteMediaReference.srcObject = stream;
        window.remoteStream = stream;
    }
    private onPeerInitialization(localIdentifier: string): void {
        peerJSLog("Initialization...");

        if (localIdentifier && localIdentifier.length > 0) {
            peerJSLog("Initialization Completed.");
            peerJSLog("Local Identifier: " + localIdentifier);
            this.localIdentifier = localIdentifier;

            const event = new CustomEvent(SystemEvents.AppLoaded);

            window.mid = localIdentifier;
            window.dispatchEvent(event);
        } else {
            peerJSLog("Initialization Failed.");
            // TODO Implement PeerJS Initialization Error Notification;
        }
    }
    private onPeerConnection(connection: any): void {
        peerJSLog("Connection Attempt.");
        peerJSLog("Connected To Peer: " + connection.peer);
        this.remoteIdentifier = connection.peer;

        peerJSLog("Outgoing Call...");
        this.peerJSCall = this.peerJS.call(this.remoteIdentifier, window.localStream);
        peerJSLog("Outgoing Call Answered.");
        this.peerJSCall.on("stream", this.onPeerStream.bind(this));
    }
    private onPeerJSError(error: any): void {
        peerJSLog("An Error Occurred.");
        DeviceDebug.PUSH_EVENT(JSON.stringify(error));
        console.error(error);
    }
    private onPeerCalling(call: any): void {
        peerJSLog("Incoming Call...");
        peerJSLog("Incoming Call Answered.");

        this.peerJSCall = call;

        this.peerJSCall.answer(window.localStream);
        peerJSLog("Streaming...");
        this.peerJSCall.on("stream", this.onPeerStream.bind(this));
    }
    private onPeerStream(stream: any): void {
        peerJSLog("Streaming...");
        this.streamRemoteVideo(stream);
    }
    private onPeerClose(): void {
        peerJSLog("Call Ended.");
    }

    public connect(remotePeerIdentifier: string): void {
        this.remoteIdentifier = remotePeerIdentifier;
        this.peerJS.connect(this.remoteIdentifier);
    }
    public disconnect(): void {
        if (this.peerJSCall) {
            this.peerJSCall.close();
        }
    }

    public toggleMic(state: boolean): void {
        window.localStream.getAudioTracks()[0].enabled = state;
    }
}

