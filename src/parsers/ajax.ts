import * as cheerio from "cheerio";
import HtmlTableToJson from "../helpers/HtmlTableToJson";

function parseNfo(html: string): string {
    const $ = cheerio.load(html);
    const nfo = $(`body > div.torrent_leiras > table > tbody > tr > td > pre`).text();
    return nfo;
}

function parseFiles(html: string): { name: string; size: string }[] {
    const $ = cheerio.load(html);

    const tableObject = $(`body > div.torrent_leiras`).html();
    const table = new HtmlTableToJson(tableObject).results[0]
        .filter((row: { "#": string; Név: string; Méret: string }) => row["Név"] && row["Méret"])
        .map((row: { "#": string; Név: string; Méret: string }) => {
            return { name: row["Név"], size: row["Méret"] };
        });

    return table;
}

export { parseNfo, parseFiles };
