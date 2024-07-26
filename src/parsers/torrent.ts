import * as cheerio from "cheerio";
import { rereferer } from "../helpers/functions";
import Torrent from "../classes/Torrent";
import fetch from "node-fetch";
import * as fs from "fs";
import UrlQueryManager from "../classes/api/UrlQueryManager";

export type ParsedTorrent = {
    id: number;
    title: string;
    images: { src: string; aspectRatio: string; width: number; height: number }[];
    properties: {
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
        downloadRating: propertyParser()["Letöltve"].split(``).length,
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

// async function test(id: string | number) {
//     const res = await fetch(`https://ncore.pro/torrents.php?action=details&id=${id}`, {
//         headers: {
//             accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
//             "accept-language": "en-US,en;q=0.9",
//             "cache-control": "no-cache",
//             pragma: "no-cache",
//             priority: "u=0, i",
//             "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126"',
//             "sec-ch-ua-mobile": "?0",
//             "sec-ch-ua-platform": '"Windows"',
//             "sec-fetch-dest": "document",
//             "sec-fetch-mode": "navigate",
//             "sec-fetch-site": "none",
//             "sec-fetch-user": "?1",
//             "upgrade-insecure-requests": "1",
//             cookie: "adblock_tested=false; adblock_stat=1; __utma=249006360.1373197927.1720318485.1720318485.1720318485.1; __utmc=249006360; __utmz=249006360.1720318485.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); PHPSESSID=6c241b7cdb9ec5d8a3666544b3811657; nick=bajekek; pass=b26e1c17e44839e4be00f232e134734b; nyelv=hu; stilus=light",
//             referrerPolicy: "strict-origin-when-cross-origin",
//         },
//         body: null,
//         method: "GET",
//     });
//     const html = await res.text();
//     fs.writeFileSync(
//         "./src/parsers/complete.json",
//         JSON.stringify(module.exports(html), null, 4),
//         "utf8"
//     );
//     //return module.exports(html);
// }

// test(3644485);

// require("fs").writeFileSync(
//     "./src/parsers/complete.json",
//     JSON.stringify(
//         module.exports(require("fs").readFileSync("./src/parsers/site.html", "utf8")),
//         0,
//         4
//     ),
//     "utf8"
// );
// console.log(module.exports(require("fs").readFileSync("./src/parsers/site.html", "utf8")));
