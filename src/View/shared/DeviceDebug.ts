export class DeviceDebug {
    private static LOG_HISTORY: string = "";

    public static EXTRACT_HISTORY(): string {
        return this.LOG_HISTORY;
    }
    public static PUSH_EVENT(event: string): void {
        this.LOG_HISTORY += `<p class="debug-p">${event}</p>`;
    }
}
