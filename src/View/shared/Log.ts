import { DeviceDebug } from './DeviceDebug';

const peerJSLogStyle: string = "color: #f8f8f8";
const socketIOLogStyle: string = "color: #f8f8f8";
const systemLogStyle: string = "color: #f8f8f8";

export function peerJSLog(actionName: string): void {
    console.log("%c[PeerJS] " + actionName, peerJSLogStyle);
    DeviceDebug.PUSH_EVENT("[PeerJS] " + actionName);
}
export function socketIOLog(actionName: string): void {
    console.log("%c[SocketIO] " + actionName, socketIOLogStyle);
    DeviceDebug.PUSH_EVENT("[SocketIO] " + actionName);
}
export function systemLog(actionName: string): void {
    console.log("%c[System] " + actionName, peerJSLogStyle);
    DeviceDebug.PUSH_EVENT("[System] " + actionName);
}
