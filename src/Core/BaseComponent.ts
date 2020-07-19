import { Event } from './EventEmitter';
import { EventEmitter } from "events";

export abstract class BaseComponent {
    protected eventListener: EventEmitter;

    protected constructor() {
        this.eventListener = Event;
    }

    protected abstract onInit(): void;
    protected abstract implementMembers(): void;
    protected abstract setupEventListeners(): void;
}
