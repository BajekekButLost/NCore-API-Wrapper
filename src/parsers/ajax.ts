import * as cheerio from "cheerio";
import HtmlTableToJson from "../helpers/HtmlTableToJson";
import { MiniBoxTorrent } from "../classes/Torrent";
import API from "../classes/api/API";

export function parseNfo(html: string): string {
    const $ = cheerio.load(html);
    const nfo = $(`body > div.torrent_leiras > table > tbody > tr > td > pre`).text();
    return nfo;
}

export function parseFiles(html: string): { name: string; size: string }[] {
    const $ = cheerio.load(html);

    const tableObject = $(`body > div.torrent_leiras`).html();
    const table = new HtmlTableToJson(tableObject).results[0]
        .filter((row: { "#": string; Név: string; Méret: string }) => row["Név"] && row["Méret"])
        .map((row: { "#": string; Név: string; Méret: string }) => {
            return { name: row["Név"], size: row["Méret"] };
        });

    return table;
}

export function parseOtherVersions(html: string, api: API): MiniBoxTorrent[] {
    const $ = cheerio.load(html);

    return $(`#profil_right > div > div.box_torrent_all_mini`)
        .children(".box_torrent_mini2")
        .toArray()
        .map((el) => new MiniBoxTorrent($(el).html(), api));
}
