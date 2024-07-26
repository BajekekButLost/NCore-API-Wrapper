import { Response } from "node-fetch";

export class CookieManager {
    cookies: { [key: string]: any };
    constructor() {
        this.cookies = {};
    }

    cookieToJson(cookie: Cookie): { name: string; value: string } {
        return { name: cookie.name, value: cookie.value };
    }

    getCookiesJson(): { [key: string]: any } {
        return this.cookies;
    }

    getCookies(): Cookie[] {
        const cookieArray: Cookie[] = [];
        Object.keys(this.cookies).forEach((key) =>
            cookieArray.push(new Cookie(key, this.cookies[key]))
        );
        return cookieArray;
    }

    getCookiesString(): string {
        return Object.keys(this.cookies)
            .map((key) => `${key}=${this.cookies[key]}`)
            .join("; ");
    }

    getCookie(name: string): Cookie | undefined {
        if (!this.cookies[name]) return undefined;
        return new Cookie(name, this.cookies[name]);
    }

    setCookiesFromString(cookies: string): CookieManager {
        this.deleteAll();
        this.addCookiesFromString(cookies);
        return this;
    }

    setCookies(cookies: Cookie[]): CookieManager {
        this.deleteAll();
        cookies.forEach((cookie) => this.addCookie(this.cookieToJson(cookie)));
        return this;
    }

    addCookie(cookie: Cookie): CookieManager {
        this.cookies[cookie.name] = cookie.value;
        return this;
    }

    addCookieFromString(cookieString: string): CookieManager {
        if (!cookieString.includes("=")) throw new SyntaxError("Invalid cookie string");
        if (cookieString.split(";").length > 1)
            throw new SyntaxError("Cookie string contains more than one cookie");
        const [name, value] = cookieString.split("=");
        this.cookies[name] = value;
        return this;
    }

    addCookiesFromString(cookieString: string): CookieManager {
        if (!cookieString.includes("=")) throw new SyntaxError("Invalid cookie string");
        cookieString.split(";").forEach((cookie) => this.addCookieFromString(cookie));
        return this;
    }

    addCookiesFromResponse(response: Response): CookieManager {
        const resCookies = response.headers.raw()["set-cookie"];
        if (!resCookies) return this;
        resCookies.forEach((cookie) => this.addCookieFromString(cookie.split(";")[0]));
        return this;
    }

    deleteCookie(name: string): CookieManager {
        delete this.cookies[name];
        return this;
    }

    deleteAll(): CookieManager {
        this.cookies = {};
        return this;
    }
}

export class Cookie {
    name: string;
    value: string;
    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }
}
