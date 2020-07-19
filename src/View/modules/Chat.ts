import { Component } from '../core/Component';
import { Message } from '../core/Message';
import { SocketIOEvents, SystemEvents } from '../shared/Events';

export class Chat extends Component {
    private chatHistory: Message[] = [];
    private chatContainerRef: HTMLElement;
    private chatInputRef: HTMLInputElement;
    private chatSendButton: HTMLButtonElement;
    private typingTimer: any;

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
        this.chatContainerRef = document.getElementById("chat-container");
        this.chatInputRef = document.getElementById("chat-input") as HTMLInputElement;
        this.chatSendButton = document.getElementById("chat-send-btn") as HTMLButtonElement;
    }
    protected setupDefaults(): void {
    }
    protected setupEvents(): void {
        this.chatSendButton.addEventListener("click", this.sendMessage.bind(this), true);
    }
    private getMessageTemplate(time: number, text: string, fromClient: boolean): string {
        return `<div class="chat__message ${fromClient ? "remote" : "local"}"><p>${text}</p></div>`;
    }
    private sendMessage(): void {
        if (this.chatInputRef.value.trim().length === 0) return;

        const message = new Message();

        message.text = this.chatInputRef.value;
        message.time = new Date().getTime();
        message.id = null;

        const event = new CustomEvent(SystemEvents.OutgoingMessage, {detail: message});

        window.dispatchEvent(event);

        this.chatInputRef.value = "";
    }

    public setMessage(message: Message, fromClient: boolean): void {
        this.chatHistory.push(message);

        const template = this.getMessageTemplate(message.time, message.text, fromClient);

        this.chatContainerRef.innerHTML += template;
        this.chatContainerRef.scrollTo(0, this.chatContainerRef.scrollHeight);
    }
}
