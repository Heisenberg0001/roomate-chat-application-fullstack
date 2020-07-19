import {Component} from '../core/Component';
import {MediaCommunicator} from './MediaCommunicator';
import {Auth} from './Auth';
import {SocketCommunicator} from './SocketCommunicator';
import {socketIOLog} from '../shared/Log';
import {DeviceDebug} from '../shared/DeviceDebug';
import {SocketIOEvents, SystemEvents} from '../shared/Events';
import {Message} from '../core/Message';
import {Chat} from './Chat';

export class Main extends Component {
  private contentScreenRef: HTMLElement;
  private loaderScreenRef: HTMLElement;
  private startupScreenRef: HTMLElement;
  private findButtonRef: HTMLButtonElement;
  private debugButtonRef: HTMLElement;
  private debugRef: HTMLElement;
  private mediaCommunicator: MediaCommunicator;
  private socketCommunicator: SocketCommunicator;
  private auth: Auth;
  private chat: Chat
  private appLoaded: boolean;
  private micState: boolean;
  private state: string = "0";

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
    this.mediaCommunicator = new MediaCommunicator();
    this.socketCommunicator = new SocketCommunicator();
    this.auth = new Auth();
    this.chat = new Chat();
    this.contentScreenRef = document.getElementById("content-screen");
    this.loaderScreenRef = document.getElementById("loader-screen");
    this.startupScreenRef = document.getElementById("startup-screen");
    this.findButtonRef = document.getElementById("find-roomate__btn") as HTMLButtonElement;
    this.debugButtonRef = document.getElementById("debug-btn");
    this.debugRef = document.getElementById("debug");
  }

  protected setupDefaults(): void {
    this.appLoaded = false;
    this.findButtonRef.disabled = true;
    this.micState = true;

    if (localStorage.getItem("state") && localStorage.getItem("state") === "1") {
      this.state = "1";
      this.loaderScreenRef.classList.remove("d-none");
      this.startupScreenRef.classList.add("d-none");
      localStorage.setItem("state", "0");
    }

    if (this.getMobileOperatingSystem()) {
      document.getElementsByClassName("application")[0].classList.add("mobile");
      document.getElementsByClassName("chat")[0].classList.add("d-none");
    }
  }

  protected setupEvents(): void {
    this.findButtonRef.addEventListener("click", this.onConnect.bind(this), true);
    this.debugButtonRef.addEventListener("click", () => {
      this.debugRef.classList.remove("d-none");
      this.debugRef.innerHTML = DeviceDebug.EXTRACT_HISTORY();
      this.debugRef.innerHTML += '<button type="button" class="debug-btn" id="debug-close-btn"><span class="material-icons">close</span></button>';
      document.getElementById("debug-close-btn").addEventListener("click", () => {
        this.debugRef.classList.add("d-none");
      });
    }, true);

    window.addEventListener(SystemEvents.AppLoaded, this.onApplicationLoad.bind(this), true);
    window.addEventListener(SocketIOEvents.Meet, this.onMeet.bind(this), true);
    window.addEventListener(SocketIOEvents.Parting, this.onParting.bind(this), true);
    window.addEventListener(SocketIOEvents.TypeStart, this.onType.bind(this, true), true);
    window.addEventListener(SocketIOEvents.TypeEnd, this.onType.bind(this, false), true);
    window.addEventListener(SocketIOEvents.Message, this.onMessageCome.bind(this), true);
    window.addEventListener(SystemEvents.OutgoingMessage, this.onMessageSend.bind(this), true);

    document.addEventListener("fullscreenchange", this.detectFullscreen, true);
    document.addEventListener("mozfullscreenchange", this.detectFullscreen, true);
    document.addEventListener("webkitfullscreenchange", this.detectFullscreen, true);
    document.addEventListener("msfullscreenchange", this.detectFullscreen, true);
    document.getElementById("header__fullscreen-btn").addEventListener("click", this.toggleFullscreen, true);
    document.getElementById("microphone").addEventListener("click", this.toggleMic.bind(this), true);
    document.getElementById("disconnect").addEventListener("click", this.disconnect.bind(this), true);

    document.getElementById("chat-btn").addEventListener("click", () => {
      if (document.getElementsByClassName("chat")[0].className.search("d-none") > -1) {
        document.getElementsByClassName("chat")[0].classList.remove("d-none");
        document.getElementById("chat-btn").children[0].innerHTML = "close";
      } else {
        document.getElementsByClassName("chat")[0].classList.add("d-none");
        document.getElementById("chat-btn").children[0].innerHTML = "chat";
      }
    }, true);
  }

  private onApplicationLoad(e: CustomEvent): void {
    this.findButtonRef.disabled = false;
    this.appLoaded = true;

    if (this.state === "1") {
      setTimeout(() => {
        this.onConnect();
      }, 1000);
    }
  }

  private async onConnect(): Promise<any> {
    if (!this.appLoaded) return;

    this.startupScreenRef.classList.add("d-none");
    this.loaderScreenRef.classList.remove("d-none");

    await this.auth.authenticate();
    await this.socketCommunicator.connect();
  }

  private disconnect(): void {
    localStorage.setItem("state", "1");
    location.reload();
  }

  private onMeet(e: CustomEvent): void {
    const remoteIdentifier = e.detail;

    socketIOLog("Mate Found.");

    this.loaderScreenRef.classList.add("d-none");
    this.contentScreenRef.classList.remove("d-none");

    if (remoteIdentifier) this.mediaCommunicator.connect(remoteIdentifier);
  }

  private onParting(): void {
    socketIOLog("Mate Left.")
    this.mediaCommunicator.disconnect();

    this.contentScreenRef.classList.add("d-none");
    this.loaderScreenRef.classList.remove("d-none");
  }

  private onType(start: boolean): void {
    if (start) {
      console.log("Mate Typing")
    } else {
      console.log("Mate Ends Typing")
    }
  }

  private onMessageCome(e: CustomEvent): void {
    const message: Message = e.detail;

    this.chat.setMessage(message, true);
  }

  private onMessageSend(e: CustomEvent): void {
    this.socketCommunicator.sendMessage(e.detail);

    this.chat.setMessage(e.detail, false);
  }

  private detectFullscreen(): void {

  }

  private toggleFullscreen(): void {
    if ((window["fullscreen"]) || (window.innerWidth === screen.width && window.innerHeight === screen.height)) {
      document.exitFullscreen().catch(() => document.documentElement.requestFullscreen());
    } else {
      document.documentElement.requestFullscreen().catch(() => document.exitFullscreen());
    }
  }

  private toggleMic(): void {
    this.micState = !this.micState;

    this.mediaCommunicator.toggleMic(this.micState);

    if (this.micState) {
      document.getElementById("microphone").classList.remove("disabled");
    } else {
      document.getElementById("microphone").classList.add("disabled");
    }
  }

  private getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
      return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return "iOS";
    }

    return undefined;
  }
}
