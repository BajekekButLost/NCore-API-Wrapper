import fetch from "node-fetch";
import { Cookie, CookieManager } from "./api/Cookies";
import { EventEmitter } from "events";
import nCoreAPI from "./api/API";
import * as parser from "../parsers/v1search";
import Torrent from "./Torrent";

interface ClientOptions {
    userAgent: string;
    url: string;
    cookies: CookieManager;
}

type UserInfo = {
    id: number;
    emailConfirmed: boolean;
    displayName: string;
    createdAt: string;
    downloaded: number;
    uploaded: number;
    trackerKey: string;
    avatar: string;
    permissions: { invite: boolean };
    rssKey: string;
    apiKey: string;
    gettingStarted: boolean;
    settings: {
        categories: {
            "1": {
                list: boolean;
                show: boolean;
            };
            "2": {
                list: boolean;
                show: boolean;
            };
            "3": {
                list: boolean;
                show: boolean;
            };
            "4": {
                list: boolean;
                show: boolean;
            };
            "5": {
                list: boolean;
                show: boolean;
            };
            "6": {
                list: boolean;
                show: boolean;
            };
            "7": {
                list: boolean;
                show: boolean;
            };
        };
    };
    token: string;
    role: number;
    messages: number;
    hitnrun: number;
    q: string;
    newTorrentMarkerType: number;
    lastSeenBrowse: null;
    premium: boolean;
    premiumEndingAt: string;
    points: number;
    invites: number;
};

class nCoreClient extends EventEmitter {
    #api: nCoreAPI;
    #cookies: CookieManager;
    #trackerKey: undefined | string;
    #token: undefined | string;
    #signOutKey: undefined | string;

    constructor(options?: ClientOptions) {
        super();

        // this.#username = username;
        // this.#password = password;
        this.#api = new nCoreAPI(options?.url, options?.userAgent);
        if (options?.cookies) {
            this.#api.setCookieManager(options.cookies);
        }
        this.#cookies = this.#api.getCookieManager();
        if (options?.cookies) {
            this.login();
        }

        //this.#login().then(() => this.emit("ready", this));
    }

    // async #login() {
    //     const res = await fetch(this.#url + "/login.php", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/x-www-form-urlencoded",
    //         },
    //         body: new URLSearchParams({
    //             // nev: this.#username,
    //             // pass: this.#password,
    //             set_lang: "hu",
    //             submitted: "1",
    //             ne_leptessen_ki: "1",
    //         }),
    //         redirect: "manual",
    //     });
    //     const resCookies = res.headers.raw()["set-cookie"];

    //     if (res.status !== 302 || !resCookies)
    //         throw new Error(
    //             `An error occured while logging in: ${res.status}. If this error persists, please contact the us on GitHub.`
    //         );
    //     resCookies.forEach((cookie) => {
    //         this.#cookies.addCookieFromString(cookie.split(";")[0]);
    //     });
    //     const auth = await this.getInfo();
    //     if (!auth.trackerKey || !auth.token || !auth.q)
    //         throw new Error(`An error occured while getting account info: ${auth}`);
    //     this.#trackerKey = auth.trackerKey;
    //     this.#token = auth.token;
    //     this.#signOutKey = auth.q;
    // }

    async login(un?: string, pwd?: string): Promise<nCoreClient> {
        const { nick, pass } = this.#cookies.getCookiesJson();
        if (!nick || !pass) {
            if (!un || !pwd) throw new Error("No username or password provided");
            const res = await this.#api.login(un, pwd);
            this.#cookies.addCookiesFromResponse(res);
        }
        if (!this.#signOutKey || !this.#trackerKey) {
            const res = await this.#api.sendRequest(
                "/torrents.php?action=details&id=1490740",
                "GET"
            );
            const html = await res.text();
            const { q, trackerKey } = parser.getKeys(html);
            this.#signOutKey = q;
            this.#trackerKey = trackerKey;
        }
        this.emit("ready", this);
        return this;
    }

    isLoggedIn(): boolean {
        if (
            !this.#signOutKey ||
            !this.#trackerKey ||
            !this.#cookies.getCookie("PHPSESSID") ||
            !this.#cookies.getCookie("nick") ||
            !this.#cookies.getCookie("pass")
        )
            return false;
        else return true;
    }

    get CookieManager(): CookieManager {
        return this.#cookies;
    }

    async getInfo(): Promise<UserInfo> {
        const res = await this.#api.auth();
        if (res.status !== 200)
            throw new Error(`An error occured while fetching user data: ${res.status}`);
        const json: any = await res.json();
        if (!json.user) throw new Error(`An error occured while fetching user data: ${json}`);
        return json.user;
    }

    async getTorrent(id: string | number): Promise<Torrent> {
        return new Torrent(await (await this.#api.torrent().details(id)).text(), this.#api);
    }

    // /**
    //  *
    //  * @param {string} search
    //  * @returns {Promise<Torrent[]>}
    //  */
    // async search(search) {}
}

export default nCoreClient;
