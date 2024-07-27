import { createWriteStream, readFileSync } from "fs";
import { parseFiles, parseNfo, parseOtherVersions } from "../parsers/ajax";
import {
    ParseBoxTorrent,
    ParsedBoxTorrent,
    ParsedMiniBoxTorrent,
    ParseMiniBoxTorrent,
    default as parser,
    ParsedTorrent,
} from "../parsers/torrent";
import API from "./api/API";

export type Category = {
    Film?: "SD/HU" | "SD/EN" | "DVDR/HU" | "DVDR/EN" | "DVD9/HU" | "DVD9/EN" | "HD/HU" | "HD/EN";
    Sorozat?: "SD/HU" | "SD/EN" | "DVDR/HU" | "DVDR/EN" | "HD/HU" | "HD/EN";
    Zene?: "MP3/HU" | "MP3/EN" | "Lossless/HU" | "Lossless/EN" | "Klip";
    XXX?: "SD" | "DVDR" | "Imageset" | "HD";
    Játék?: "PC/ISO" | "PC/RIP" | "Konzol";
    Program?: "Prog/ISO" | "Prog/RIP" | "Prog/Mobil";
    Könyv?: "eBook/HU" | "eBook/EN";
};

class Description extends String {
    #spoilers?: string[];
    constructor(str: string, spoilers?: string[]) {
        super(str);
        this.#spoilers = spoilers;
    }

    get spoilers(): string[] | undefined {
        return this.#spoilers;
    }
}

export default class Torrent {
    #parsed: ParsedTorrent;
    #api: API;

    id: number;
    title: string;
    images: { src: string; aspectRatio: string; width: number; height: number }[];
    properties: {
        category: Category;
        uploadTime: string;
        uploader: "Anonymous" | string;
        comments: number;
        requestId?: number;
        seeders: number;
        leechers: number;
        downloaded: number;
        downloadSpeed: string;
        size: string;
        files: number;
        getNfo(): Promise<string>;
        getFiles(): Promise<{ name: string; size: string }[]>;
        getOtherVersions(imdbId?: string | number): Promise<MiniBoxTorrent[]>;
    };
    product: {
        thumbnail?: string;
        title?: string;
        fields: { [key: string]: string };
    };
    description: Description;
    thanks: string[];
    constructor(html: string, api: API) {
        this.#parsed = parser(html);
        this.#api = api;

        this.id = this.#parsed.id;
        this.title = this.#parsed.title;
        this.images = this.#parsed.images;
        this.properties = {
            category: this.#parsed.properties.category,
            uploadTime: this.#parsed.properties.uploadTime,
            uploader: this.#parsed.properties.uploader,
            comments: this.#parsed.properties.comments,
            requestId: this.#parsed.properties.requestId,
            seeders: this.#parsed.properties.seeders,
            leechers: this.#parsed.properties.leechers,
            downloaded: this.#parsed.properties.downloaded,
            downloadSpeed: this.#parsed.properties.downloadSpeed,
            size: this.#parsed.properties.size,
            files: this.#parsed.properties.files,
            getNfo: async () => {
                const res = await this.#api.ajax().getNfo(this.id);
                const txt = await res.text();
                return parseNfo(txt);
            },
            getFiles: async () => {
                const res = await this.#api.ajax().getFiles(this.id);
                const txt = await res.text();
                return parseFiles(txt);
            },
            getOtherVersions: async (imdbId?: string | number) => {
                if (imdbId) {
                    const res = await this.#api.ajax().getOtherVersions(this.id, imdbId);
                    const txt = await res.text();
                    return parseOtherVersions(txt, this.#api);
                } else {
                    console.log(this.title);
                    if (!this.product?.fields["IMDb link"]) throw new Error("No IMDb link found");
                    const fid = this.product.fields["IMDb link"].split("/")[4].replace("tt", "");
                    const res = await this.#api.ajax().getOtherVersions(this.id, fid);
                    const txt = await res.text();
                    return parseOtherVersions(txt, this.#api);
                }
            },
        };
        this.product = this.#parsed.product;
        this.description = new Description(this.#parsed.description);
        this.thanks = this.#parsed.thanks;
    }

    async download(path: string = "ncore.torrent"): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const res = await this.#api.torrent().download(this.id, this.#parsed.trackerKey);
            const file = createWriteStream(path);
            if (res.status !== 200) reject(res.statusText);
            res.body.pipe(file).on("finish", () => resolve(readFileSync(path)));
            file.on("error", (err) => reject(err));
        });
    }

    async thank(): Promise<boolean> {
        const res = await this.#api.ajax().thank(this.id);
        return res.status === 200;
    }

    toJSON(): ParsedTorrent {
        return this.#parsed;
    }
}

export class BoxTorrent {
    #parsed: ParsedBoxTorrent;
    #api: API;
    constructor(html: string, api: API) {
        this.#parsed = ParseBoxTorrent(html);
        this.#api = api;
    }
}

export class MiniBoxTorrent {
    #parsed: ParsedMiniBoxTorrent;
    #api: API;
    id: number;
    title: string;
    category: Category;
    uploadTime: string;
    size: string;
    downloaded: number;
    seeders: number;
    leechers: number;
    constructor(html: string, api: API) {
        this.#parsed = ParseMiniBoxTorrent(html);
        this.#api = api;

        this.id = this.#parsed.id;
        this.title = this.#parsed.title;
        this.category = this.#parsed.category;
        this.uploadTime = this.#parsed.uploadTime;
        this.size = this.#parsed.size;
        this.downloaded = this.#parsed.downloaded;
        this.seeders = this.#parsed.seeders;
        this.leechers = this.#parsed.leechers;
    }

    async getTorrent(): Promise<Torrent> {
        return new Torrent(await (await this.#api.torrent().details(this.id)).text(), this.#api);
    }
}
