export const ENABLE_AUDIO: boolean = true;
export const ENABLE_VIDEO: boolean = true;

declare global {
    interface Window { localStream: MediaStream; }
    interface Window { remoteStream: MediaStream; }
    interface Window { mid: string; }
}
