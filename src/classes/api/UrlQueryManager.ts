class UrlQueryManager {
    #query: { [key: string]: any };
    constructor() {
        this.#query = {};
    }

    parseUrl(url: string): { [key: string]: any } {
        let [asd, ...urlParts] = url.split("?");
        const queries = urlParts.join("?").split("&");
        return queries.reduce(function (acc: { [key: string]: any }, cur, i) {
            const [key, value] = cur.split("=");
            acc[key] = value;
            return acc;
        }, {});
    }

    getQueries(): { [key: string]: any } {
        return this.#query;
    }

    getQueryValue(key: string): string {
        return this.#query[key];
    }

    getQueriesString(): string {
        let queryString = "?";
        for (let key in this.#query) {
            queryString += key + "=" + this.#query[key] + "&";
        }
        return queryString.slice(0, -1);
    }

    setQuery(query: { [key: string]: any }): UrlQueryManager {
        this.#query = query;
        return this;
    }

    setQueryValue(key: string, value: string): UrlQueryManager {
        this.#query[key] = value;
        return this;
    }

    setQueryFromUrl(url: string): UrlQueryManager {
        this.#query = this.parseUrl(url);
        return this;
    }

    addQuery(query: { [key: string]: any }): UrlQueryManager {
        this.#query = { ...this.#query, ...query };
        return this;
    }

    addQueries(queries: string[]): UrlQueryManager {
        for (let key in queries) {
            this.#query[key] = queries[key];
        }
        return this;
    }

    removeQueryValue(key: string): UrlQueryManager {
        delete this.#query[key];
        return this;
    }

    get addTo(): {
        url: (url: string) => string;
    } {
        return {
            url: (url) => {
                return url + this.getQueriesString();
            },
        };
    }
}

export default UrlQueryManager;
