import UrlQueryManager from "./UrlQueryManager";

export type v2SearchCategories =
    | "Movies"
    | "Series"
    | "Music"
    | "Games"
    | "Ebooks"
    | "Apps"
    | "Adult";

export type v2SearchOptions = {
    categories: v2SearchCategories[];
    query: string;
    page: number;
};

type Path = { url: string; method: string };

class ApiPaths {
    rss(key: string): Path {
        return {
            url: new UrlQueryManager().addQuery({ key }).addTo.url("https://ncore.pro/rss.php"),
            method: "GET",
        };
    }
    login(): Path {
        return { url: "https://ncore.pro/login.php", method: "POST" };
    }
    logout(q: string): Path {
        return {
            url: new UrlQueryManager().addQuery({ q }).addTo.url("https://ncore.pro/exit.php"),
            method: "GET",
        };
    }
    auth(): Path {
        return { url: "https://ncore.pro/api/v2/auth", method: "GET" };
    }

    torrents(options: v2SearchOptions): Path {
        const categories = options.categories.map((c) => {
            if (c.toLowerCase() === "movies") return 1;
            if (c.toLowerCase() === "series") return 2;
            if (c.toLowerCase() === "music") return 3;
            if (c.toLowerCase() === "games") return 4;
            if (c.toLowerCase() === "ebooks") return 5;
            if (c.toLowerCase() === "apps") return 6;
            if (c.toLowerCase() === "adult") return 7;
        });
        const querymanager = new UrlQueryManager().addQuery({ q: options.query });

        if (categories.length > 0) querymanager.addQuery({ categories: categories.join(",") });
        if (!options.page) querymanager.addQuery({ pi: 0 });
        else querymanager.addQuery({ pi: options.page });
        return {
            url: querymanager.addTo.url("https://ncore.pro/api/v2/torrents"),
            method: "GET",
        };
    }

    invites(): Path {
        return { url: "https://ncore.pro/api/v2/invites", method: "GET" };
    }
    invitedUsers(): Path {
        return { url: "https://ncore.pro/api/v2/invites/users", method: "GET" };
    }

    get torrent() {
        return {
            details: (id: string | number): Path => ({
                url: new UrlQueryManager()
                    .addQuery({ action: "details" })
                    .addQuery({ id })
                    .addTo.url("https://ncore.pro/torrents.php"),
                method: "GET",
            }),
            download: (id: string | number, key: string): Path => ({
                url: new UrlQueryManager()
                    .addQuery({ action: "download" })
                    .addQuery({ id })
                    .addQuery({ key })
                    .addTo.url("https://ncore.pro/torrents.php"),
                method: "GET",
            }),
        };
    }

    get ajax() {
        const ajaxPath = "https://ncore.pro/ajax.php";
        return {
            getNfo: (id: string | number): Path => {
                return {
                    url: new UrlQueryManager()
                        .addQuery({ action: "nfo" })
                        .addQuery({ id })
                        .addQuery({ details: 1 })
                        .addTo.url(ajaxPath),
                    method: "GET",
                };
            },
            thank: (id: string | number): Path => {
                return {
                    url: new UrlQueryManager()
                        .addQuery({ action: "thanks" })
                        .addQuery({ id })
                        .addTo.url(ajaxPath),
                    method: "GET",
                };
            },
            getFiles: (id: string | number): Path => {
                return {
                    url: new UrlQueryManager()
                        .addQuery({ action: "files" })
                        .addQuery({ id })
                        .addQuery({ details: 1 })
                        .addTo.url(ajaxPath),
                    method: "GET",
                };
            },
            getOtherVersions: (fid: string | number, id: string | number): Path => {
                return {
                    url: new UrlQueryManager()
                        .addQuery({ action: "other_versions" })
                        .addQuery({ id })
                        .addQuery({ fid })
                        .addQuery({ details: 1 })
                        .addTo.url(ajaxPath),
                    method: "GET",
                };
            },
            getPeers: (id: string | number): Path => {
                return {
                    url: new UrlQueryManager()
                        .addQuery({ action: "peers" })
                        .addQuery({ id })
                        .addQuery({ details: 1 })
                        .addTo.url(ajaxPath),
                    method: "GET",
                };
            },
        };
    }
}

// const q = new ApiPaths();
// console.log(q.torrents({ categories: ["Games"], query: "spider-man", page: 1 }));

export default ApiPaths;
