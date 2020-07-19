import { getToken, storeToken } from '../shared/AccessToken';
import { systemLog } from '../shared/Log';

export class Auth {
    private accessToken: string;

    constructor() {
        this.onInit();
    }

    private onInit(): void {
        this.accessToken = getToken();
    }
    private updateToken(): Promise<any> {
        return new Promise((resolve, reject) => {
            systemLog("Pinging...")

            const http = new XMLHttpRequest();
            const payload = {
                token: this.accessToken
            }

            http.open("POST", "/ping", true);
            http.setRequestHeader("Content-Type", "application/json");
            http.onload = () => {
                if (http.status === 200 && http.response) {
                    systemLog("Ping Completed.");
                    const freshToken = http.response;

                    resolve(freshToken);
                } else {
                    systemLog("Error During Ping.");
                    console.error(http);
                    reject();
                }
            };
            http.send(JSON.stringify(payload));
        });
    }

    public authenticate(): Promise<null> {
        return new Promise((resolve, reject) => {
            this.updateToken()
                .then((freshToken: string) => {storeToken(freshToken); resolve()})
                .catch(() => reject());
        })
    }
}
