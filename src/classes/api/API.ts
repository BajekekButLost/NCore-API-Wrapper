import fetch, { Response } from "node-fetch";
import { CookieManager } from "./Cookies";
import ApiPaths from "./APIPaths";
import { version } from "../../../package.json";
import { v2SearchCategories } from "../search/v2Search";

type ApiResponse = Promise<Response>;

class API {
    #cookies: CookieManager;
    #UA: string;
    #base: string;
    paths: ApiPaths;
    constructor(url: string | undefined, ua: string | undefined) {
        this.#cookies = new CookieManager();
        this.#UA =
            ua || `ncore-api-wrapper/${version} (https://npmjs.com/package/ncore-api-wrapper)`;
        this.#base = url || "https://ncore.pro";
        this.paths = new ApiPaths();
    }

    getCookieManager() {
        return this.#cookies;
    }

    setCookieManager(cookies: CookieManager) {
        this.#cookies = cookies;
    }

    getBaseURL() {
        return this.#base;
    }

    sendRequest(path: string, method: string, body?: URLSearchParams): ApiResponse {
        return fetch(this.#base + path, {
            method,
            headers: {
                Cookie: this.#cookies.getCookiesString(),
                "User-Agent": this.#UA,
            },
            body,
        });
    }

    getRssFeed(key: string): ApiResponse {
        return fetch(this.paths.rss(key).url, {
            method: this.paths.rss(key).method,
            headers: {
                Cookie: this.#cookies.getCookiesString(),
                "User-Agent": this.#UA,
            },
        });
    }

    login(username: string, password: string): ApiResponse {
        return fetch(this.paths.login().url, {
            method: this.paths.login().method,
            headers: {
                Cookie: this.#cookies.getCookiesString(),
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": this.#UA,
            },
            body: new URLSearchParams({
                nev: username,
                pass: password,
                set_lang: "hu",
                submitted: "1",
                ne_leptessen_ki: "1",
            }),
            redirect: "manual",
        });
    }

    logout(q: string): ApiResponse {
        return fetch(this.paths.logout(q).url, {
            method: this.paths.logout(q).method,
            headers: {
                "User-Agent": this.#UA,
            },
        });
    }

    auth(): ApiResponse {
        return fetch(this.paths.auth().url, {
            method: this.paths.auth().method,
            headers: {
                Cookie: this.#cookies.getCookiesString(),
                "User-Agent": this.#UA,
            },
        });
    }

    get search() {
        return {
            v1: () => {},
            v2: (query: string, categories: v2SearchCategories[], page?: number): ApiResponse => {
                return fetch(
                    this.paths.torrents({ query, categories, page: page ? page : 0 }).url,
                    {
                        method: this.paths.torrents({ query, categories, page: page ? page : 0 })
                            .method,
                        headers: {
                            Cookie: this.#cookies.getCookiesString(),
                            "User-Agent": this.#UA,
                        },
                    }
                );
            },
        };
    }

    invites(): ApiResponse {
        return fetch(this.paths.invites().url, {
            method: this.paths.invites().method,
            headers: {
                Cookie: this.#cookies.getCookiesString(),
                "User-Agent": this.#UA,
            },
        });
    }

    invitedUsers(): ApiResponse {
        return fetch(this.paths.invitedUsers().url, {
            method: this.paths.invitedUsers().method,
            headers: {
                Cookie: this.#cookies.getCookiesString(),
                "User-Agent": this.#UA,
            },
        });
    }

    torrent() {
        return {
            details: (id: string | number): ApiResponse => {
                return fetch(this.paths.torrent.details(id).url, {
                    method: this.paths.torrent.details(id).method,
                    headers: {
                        Cookie: this.#cookies.getCookiesString(),
                        "User-Agent": this.#UA,
                    },
                });
            },
            download: (id: string | number, key: string): ApiResponse => {
                return fetch(this.paths.torrent.download(id, key).url, {
                    method: this.paths.torrent.download(id, key).method,
                    headers: {
                        Cookie: this.#cookies.getCookiesString(),
                        "User-Agent": this.#UA,
                    },
                });
            },
        };
    }

    ajax() {
        return {
            getNfo: (id: string | number): ApiResponse => {
                return fetch(this.paths.ajax.getNfo(id).url, {
                    method: this.paths.ajax.getNfo(id).method,
                    headers: {
                        Cookie: this.#cookies.getCookiesString(),
                        "User-Agent": this.#UA,
                    },
                });
            },
            thank: (id: string | number): ApiResponse => {
                return fetch(this.paths.ajax.thank(id).url, {
                    method: this.paths.ajax.thank(id).method,
                    headers: {
                        Cookie: this.#cookies.getCookiesString(),
                        "User-Agent": this.#UA,
                    },
                });
            },
            getFiles: (id: string | number): ApiResponse => {
                return fetch(this.paths.ajax.getFiles(id).url, {
                    method: this.paths.ajax.getFiles(id).method,
                    headers: {
                        Cookie: this.#cookies.getCookiesString(),
                        "User-Agent": this.#UA,
                    },
                });
            },
            getOtherVersions: (fid: string | number, id: string | number): ApiResponse => {
                return fetch(this.paths.ajax.getOtherVersions(fid, id).url, {
                    method: this.paths.ajax.getOtherVersions(fid, id).method,
                    headers: {
                        Cookie: this.#cookies.getCookiesString(),
                        "User-Agent": this.#UA,
                    },
                });
            },
            getPeers: (id: string | number): ApiResponse => {
                return fetch(this.paths.ajax.getPeers(id).url, {
                    method: this.paths.ajax.getPeers(id).method,
                    headers: {
                        Cookie: this.#cookies.getCookiesString(),
                        "User-Agent": this.#UA,
                    },
                });
            },
        };
    }
}

export default API;
