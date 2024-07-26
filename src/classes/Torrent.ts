//const parser = require("../parsers/torrent");
import { parseFiles, parseNfo } from "../parsers/ajax";
import { ParsedTorrent, default as parser } from "../parsers/torrent";
import API from "./api/API";

export default class Torrent {
    #parsed: ParsedTorrent;
    #api: API;
    constructor(html: string, api: API) {
        this.#parsed = parser(html);
        this.#api = api;
    }

    get id(): number {
        return this.#parsed.id;
    }

    get title(): string {
        return this.#parsed.title;
    }

    get images(): { src: string; aspectRatio: string; width: number; height: number }[] {
        return this.#parsed.images;
    }

    get properties(): {
        category: {
            Film?:
                | "SD/HU"
                | "SD/EN"
                | "DVDR/HU"
                | "DVDR/EN"
                | "DVD9/HU"
                | "DVD9/EN"
                | "HD/HU"
                | "HD/EN";
            Sorozat?: "SD/HU" | "SD/EN" | "DVDR/HU" | "DVDR/EN" | "HD/HU" | "HD/EN";
            Zene?: "MP3/HU" | "MP3/EN" | "Lossless/HU" | "Lossless/EN" | "Klip";
            XXX?: "SD" | "DVDR" | "Imageset" | "HD";
            Játék?: "PC/ISO" | "PC/RIP" | "Konzol";
            Program?: "Prog/ISO" | "Prog/RIP" | "Prog/Mobil";
            Könyv?: "eBook/HU" | "eBook/EN";
        };
        uploadTime: string;
        uploader: "Anonymous" | string;
        comments: number;
        requestId?: number;
        seeders: number;
        leechers: number;
        downloadRating: number;
        downloadSpeed: string;
        size: string;
        files: number;
        getNfo: () => Promise<string>;
        getFiles: () => Promise<{ name: string; size: string }[]>;
        getOtherVersions: (imdbId?: string | number) => any;
    } {
        return {
            category: this.#parsed.properties.category,
            uploadTime: this.#parsed.properties.uploadTime,
            uploader: this.#parsed.properties.uploader,
            comments: this.#parsed.properties.comments,
            requestId: this.#parsed.properties.requestId,
            seeders: this.#parsed.properties.seeders,
            leechers: this.#parsed.properties.leechers,
            downloadRating: this.#parsed.properties.downloadRating,
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
                if (!this.product.fields["IMDb link"]) return new Error("No IMDb link found");
                if (imdbId) {
                    const res = await this.#api.ajax().getOtherVersions(this.id, imdbId);
                    const txt = await res.text();
                    return parser(txt);
                }
                const res = await this.#api.ajax().getOtherVersions(this.id, 0);
                const txt = await res.text();
                return parser(txt);
            },
        };
    }

    get product(): {
        thumbnail?: string;
        title?: string;
        fields: { [key: string]: string };
    } {
        return this.#parsed.product;
    }

    get description(): string {
        return this.#parsed.description;
    }

    get thanks(): string[] {
        return this.#parsed.thanks;
    }

    async download(): Promise<NodeJS.ReadableStream> {
        const res = await this.#api.torrent().download(this.id, this.#parsed.trackerKey);
        return res.body;
    }

    async thank(): Promise<boolean> {
        const res = await this.#api.ajax().thank(this.id);
        return res.status === 200;
    }

    toJSON(): ParsedTorrent {
        return this.#parsed;
    }
}
