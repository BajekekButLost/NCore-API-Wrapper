import { load } from "cheerio";
import UrlQueryManager from "../classes/api/UrlQueryManager";
import { writeFileSync } from "fs";

export function getKeys(html: string): { q: string; trackerKey: string } {
    const $ = load(html);
    const q = $("#menu_11").attr("href")?.split("=")[1];
    // console.log(
    //     $(
    //         "#main_tartalom > div.lista_all > div.box_torrent_all > div:nth-child(4) > div.torrent_lenyilo_lehetoseg > div.letoltve_txt > a"
    //     ).text()
    // );
    const trackerKey = new UrlQueryManager()
        .setQueryFromUrl($("#details1 > div.fobox_tartalom > div.download > a").attr("href"))
        .getQueryValue("key");
    return { q, trackerKey };
}
