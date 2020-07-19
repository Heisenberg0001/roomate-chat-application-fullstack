export abstract class Component {
    protected abstract onInit(): void;
    protected abstract implementMembers(): void;
    protected abstract setupDefaults(): void;
    protected abstract setupEvents(): void;
}
