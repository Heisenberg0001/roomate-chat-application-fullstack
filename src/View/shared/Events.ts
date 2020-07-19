export enum PeerJSEvents {
    Open = "open",
    Connect = "connection",
    Disconnect = "disconnected",
    Close = "close",
    Call = "call",
    Stream = "stream",
    Error = "error"
}
export enum SocketIOEvents {
    Connect = "connection",
    Next = "next",
    Meet = "meet",
    Parting = "parting",
    TypeStart = "typeStart",
    TypeEnd = "typeEnd",
    Message = "_message",
}
export enum SystemEvents {
    AppLoaded= "appLoaded",
    OutgoingMessage = "outgoingMessage"
}
