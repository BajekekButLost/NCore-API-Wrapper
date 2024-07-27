import * as cheerio from "cheerio";
import { rereferer } from "../helpers/functions";
import Torrent, { Category } from "../classes/Torrent";
import fetch from "node-fetch";
import * as fs from "fs";
import UrlQueryManager from "../classes/api/UrlQueryManager";

const categoryIds: { [key: string]: Category } = {
    xvid_hun: { Film: "SD/HU" },
    xvid: { Film: "SD/EN" },
    dvd_hun: { Film: "DVDR/HU" },
    dvd: { Film: "DVDR/EN" },
    dvd9_hun: { Film: "DVD9/HU" },
    dvd9: { Film: "DVD9/EN" },
    hd_hun: { Film: "HD/HU" },
    hd: { Film: "HD/EN" },
    xvidser_hun: { Sorozat: "SD/HU" },
    xvidser: { Sorozat: "SD/EN" },
    dvdser_hun: { Sorozat: "DVDR/HU" },
    dvdser: { Sorozat: "DVDR/EN" },
    hdser_hun: { Sorozat: "HD/HU" },
    hdser: { Sorozat: "HD/EN" },
    mp3_hun: { Zene: "MP3/HU" },
    mp3: { Zene: "MP3/EN" },
    lossless_hun: { Zene: "Lossless/HU" },
    lossless: { Zene: "Lossless/EN" },
    clip: { Zene: "Klip" },
    xxx_xvid: { XXX: "SD" },
    xxx_dvd: { XXX: "DVDR" },
    xxx_imageset: { XXX: "Imageset" },
    xxx_hd: { XXX: "HD" },
    game_iso: { Játék: "PC/ISO" },
    game_rip: { Játék: "PC/RIP" },
    console: { Játék: "Konzol" },
    iso: { Program: "Prog/ISO" },
    misc: { Program: "Prog/RIP" },
    mobile: { Program: "Prog/Mobil" },
    ebook_hun: { Könyv: "eBook/HU" },
    ebook: { Könyv: "eBook/EN" },
};

export type ParsedTorrent = {
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
    };
    product: {
        thumbnail?: string;
        title?: string;
        fields: { [key: string]: string };
    };
    description: string;
    thanks: string[];
    trackerKey: string;
    downloadUrl: string;
};

export default function ParseTorrent(html: string): ParsedTorrent {
    const $ = cheerio.load(html);

    const id = parseInt(
        new UrlQueryManager()
            .setQueryFromUrl($("#details1 > div.fobox_tartalom > div.download > a").attr("href"))
            .getQueryValue("id")
    );
    const title = $(`#details1 > div.fobox_tartalom > div.torrent_reszletek_cim`).text();
    const [imageSources, imageSizes] = $(
        `#details1 > div.fobox_tartalom > center:nth-child(3) > table > tbody`
    ).children();

    const images = $(imageSources)
        .children()
        .toArray()
        .map((element, index) => {
            const src = $(element).children()[0].attribs.href;
            const [width, height] = $($(imageSizes)?.children()[index]?.children[0])
                ?.text()
                .replace(`(`, ``)
                .replace(`)`, ``)
                .split(`x`);
            return {
                src,
                aspectRatio: width + `x` + height,
                width: typeof width == `string` ? parseInt(width) : width,
                height: typeof height == `string` ? parseInt(height) : height,
            };
        });

    const propertyParser = (): { [key: string]: string } => {
        const keys = [
            ...$("#details1 > div.fobox_tartalom > div.torrent_reszletek > div.torrent_col1")
                .children()
                .toArray()
                .filter((element) => $(element).attr("class") == "dt")
                .map((element) => $(element).text().replace(`:`, ``)),
            ...$("#details1 > div.fobox_tartalom > div.torrent_reszletek > div.torrent_col2")
                .children()
                .toArray()
                .filter((element) => $(element).attr("class") == "dt")
                .map((element) => $(element).text().replace(`:`, ``)),
        ];

        const values = [
            ...$("#details1 > div.fobox_tartalom > div.torrent_reszletek > div.torrent_col1")
                .children()
                .toArray()
                .filter((element) => $(element).attr("class") == "dd")
                .map((element) => $(element).text()),
            ...$("#details1 > div.fobox_tartalom > div.torrent_reszletek > div.torrent_col2")
                .children()
                .toArray()
                .filter((element) => $(element).attr("class") == "dd")
                .map((element) => $(element).text()),
        ];

        return keys
            .map((key, index) => {
                let returnValue: any = {};
                returnValue[key] = values[index];
                return returnValue;
            })
            .reduce(function (result, item) {
                var key = Object.keys(item)[0];
                result[key] = item[key];
                return result;
            }, {});
    };

    const category: any = {};
    category[
        $(
            `#details1 > div.fobox_tartalom > div.torrent_reszletek > div.torrent_col1 > div:nth-child(2) > a:nth-child(1)`
        ).text()
    ] = $(
        `#details1 > div.fobox_tartalom > div.torrent_reszletek > div.torrent_col1 > div:nth-child(2) > a:nth-child(2)`
    ).text();

    let properties = {
        category: (() => {
            const category: { [key: string]: string } = {};
            const [c, t] = propertyParser()["Típus"].split(" > ");
            category[c] = t;

            return category;
        })(),
        uploadTime: propertyParser()["Feltöltve"],
        uploader: propertyParser()["Feltöltő"].replaceAll(`\n`, ``).replaceAll(`\t`, ``),
        comments: parseInt(propertyParser()["Hozzászólás"].split(` `)[0]),
        requestId: propertyParser()["Kérés"] ? parseInt(propertyParser()["Kérés"]) : undefined,
        seeders: parseInt(propertyParser()["Seederek"]),
        leechers: parseInt(propertyParser()["Leecherek"]),
        downloaded:
            propertyParser()["Letöltve"] == "0" ? 0 : propertyParser()["Letöltve"].split(``).length,
        downloadSpeed: propertyParser()["Sebesség"].split(` `, 2).join(` `),
        size: propertyParser()["Méret"].split(` `, 2).join(` `),
        files: parseInt(propertyParser()["Fájlok"]),
    };

    const product = {
        thumbnail: $(
            `#details1 > div.fobox_tartalom > div:nth-child(${
                images.length > 0 ? 16 : 15
            }) > table > tbody > tr > td.inforbar_img > img`
        ).attr(`src`),
        title:
            $(
                `#details1 > div.fobox_tartalom > div:nth-child(${
                    images.length > 0 ? 16 : 15
                }) > table > tbody > tr > td.inforbar_txt > div`
            ).text() != ``
                ? $(
                      `#details1 > div.fobox_tartalom > div:nth-child(${
                          images.length > 0 ? 16 : 15
                      }) > table > tbody > tr > td.inforbar_txt > div`
                  ).text()
                : undefined,
        fields: $(
            `#details1 > div.fobox_tartalom > div:nth-child(${
                images.length > 0 ? 16 : 15
            }) > table > tbody > tr > td.inforbar_txt > table > tbody`
        )
            .children()
            .toArray()
            .map((element) => {
                const [keyElement, valueElement] = $(element).children();
                const key = $(keyElement).text().replace(`:`, ``);
                let value = $(valueElement).text();
                if (
                    $(valueElement).children().length == 1 &&
                    $(valueElement).children()[0].name == `a` &&
                    value.startsWith(`http`)
                ) {
                    value = rereferer($(valueElement).children()[0].attribs.href);
                }
                let returnValue: any = {};
                returnValue[key] = value;
                return returnValue;
            })
            .reduce(function (result, item) {
                var key = Object.keys(item)[0];
                result[key] = item[key];
                return result;
            }, {}),
    };

    const description = $(`#details1 > div.fobox_tartalom > div.torrent_leiras.proba42`).text();

    const thanks = $(`#ncoreKoszonetAjax`)
        .text()
        .split(`, `)
        .map((name) => name.replace(`\n`, ``).replace(`\t`, ``));

    const trackerKey = new UrlQueryManager()
        .setQueryFromUrl($("#details1 > div.fobox_tartalom > div.download > a").attr("href"))
        .getQueryValue("key");
    const downloadUrl = $("#details1 > div.fobox_tartalom > div.download > a").attr("href");

    return {
        id,
        title,
        images,
        properties,
        product,
        description,
        thanks,
        trackerKey,
        downloadUrl,
    };
}

export type ParsedBoxTorrent = {
    id: number;
    title: string;
    product: {
        title: string;
    };
    imdb: {
        url: string;
        rating: number;
    };
    thumbnail: string;
    category: Category;
    status: "checked" | "unchecked" | "err";
    uploadTime: string;
    size: string;
    downloaded: number;
    seeders: number;
    leechers: number;
    uploader: string;
};

export function ParseBoxTorrent(html: string): ParsedBoxTorrent {
    const $ = cheerio.load(html);

    const title = $(
        "div.box_nagy > div.box_nev2 > div.tabla_szoveg > div.torrent_txt > a > nobr"
    ).text();
    const product = {
        title: $(
            "div.box_nagy > div.box_nev2 > div.tabla_szoveg > div.torrent_txt > div > div.siterank > span"
        ).text(),
    };
    const imdb = {
        url: rereferer(
            $(
                "div.box_nagy > div.box_nev2 > div.tabla_szoveg > div.torrent_txt > div > div.siterank > a"
            ).attr("href")
        ),
        rating: parseFloat(
            $(
                "div.box_nagy > div.box_nev2 > div.tabla_szoveg > div.torrent_txt > div > div.siterank > a"
            )
                .text()
                .split(" ")[1]
        ),
    };
    const thumbnail = $(
        "div.box_nagy > div.box_nev2 > div.tabla_szoveg > div.torrent_txt > div > div.infobar > img"
    )
        .attr("onmouseover")
        ?.split("'")[1];
    const id = parseInt(
        new UrlQueryManager()
            .setQueryFromUrl(
                $("div.box_nagy > div.box_nev2 > div.tabla_szoveg > div.torrent_txt > a").attr(
                    "href"
                )
            )
            .getQueryValue("id")
    );
    const category =
        categoryIds[
            new UrlQueryManager()
                .setQueryFromUrl($("div.box_alap_img > a").attr("href"))
                .getQueryValue("tipus")
        ];

    const status = (() => {
        const status = $("body > div > div.box_nagy > div.box_nev2 > div:nthChild(3)").attr(
            "class"
        );
        if (status == "torrent_ok") return "checked";
        if (status == "torrent_unchecked") return "unchecked";
        return "err";
    })();

    const uploadTime = $("div.box_nagy > div.box_feltoltve2").text().replace("\n", " ");
    const size = $("div.box_nagy > div.box_meret2").text();

    const downloaded =
        $("div.box_nagy > div.box_d2").text() == "0"
            ? 0
            : $("div.box_nagy > div.box_d2").text().split(``).length;
    const seeders = parseInt($("div.box_nagy > div.box_s2").text());
    const leechers = parseInt($("div.box_nagy > div.box_l2").text());
    const uploader = $("div.box_nagy > div.box_feltolto2 > a > span").text();
    return {
        id,
        title,
        product,
        imdb,
        thumbnail,
        category,
        status,
        uploadTime,
        size,
        downloaded,
        seeders,
        leechers,
        uploader,
    };
}

export type ParsedMiniBoxTorrent = {
    id: number;
    title: string;
    category: Category;
    uploadTime: string;
    size: string;
    downloaded: number;
    seeders: number;
    leechers: number;
};

export function ParseMiniBoxTorrent(html: string): ParsedMiniBoxTorrent {
    const $ = cheerio.load(html);

    const title = $("div.box_nagy_mini > div.box_nev_mini_ownfree > div > div > a").attr("title");
    const id = parseInt(
        new UrlQueryManager()
            .setQueryFromUrl(
                $("div.box_nagy_mini > div.box_nev_mini_ownfree > div > div > a").attr("href")
            )
            .getQueryValue("id")
    );
    const category =
        categoryIds[
            new UrlQueryManager()
                .setQueryFromUrl($("div.box_alap_img > a").attr("href"))
                .getQueryValue("tipus")
        ];
    const uploadTimeStr = $("div.box_nagy_mini > div.box_feltoltve_other_short").text();
    const uploadTime = uploadTimeStr.substring(0, 10) + " " + uploadTimeStr.substring(10);
    //.replace("\n", " ");
    const size = $("div.box_nagy_mini > div.box_meret2").text();
    const downloaded =
        $("div.box_nagy_mini > div.box_d2").text() == "0"
            ? 0
            : $("div.box_nagy_mini > div.box_d2").text().split(``).length;
    const seeders = parseInt($("div.box_nagy_mini > div.box_s2").text());
    const leechers = parseInt($("div.box_nagy_mini > div.box_l2").text());
    return {
        id,
        title,
        category,
        uploadTime,
        size,
        downloaded,
        seeders,
        leechers,
    };
}
