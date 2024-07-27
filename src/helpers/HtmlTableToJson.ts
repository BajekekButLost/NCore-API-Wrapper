import * as cheerio from "cheerio";

/**
 * Full credit to brandon93s' html-table-to-json package on npm!
 * brandon93s: https://www.npmjs.com/~brandon93s
 * html-table-to-json: https://www.npmjs.com/package/html-table-to-json
 */

class HtmlTableToJson {
    html: any;
    opts: any;
    _$: any;
    _results: any[];
    _headers: any[];
    _count: any;
    _firstRowUsedAsHeaders: any[];
    constructor(html: string | any, opts = {}) {
        if (typeof html !== "string") {
            throw new TypeError("html input must be a string");
        }

        this.html = html;
        this.opts = opts;

        this._$ = cheerio.load(this.html);
        this._results = [];
        this._headers = [];
        this._count = null;

        this._firstRowUsedAsHeaders = [];

        this._process();
    }

    static parse(html: any, opts: any) {
        return new HtmlTableToJson(html, opts);
    }

    get count() {
        return Number.isInteger(this._count)
            ? this._count
            : (this._count = this._$("table").get().length);
    }

    get results() {
        return this.opts.values === true
            ? this._results.map((result) => result.map(Object.values))
            : this._results;
    }

    get headers() {
        return this._headers;
    }

    _process() {
        if (this._results.length) {
            return this._results;
        }

        this._$("table").each((i: any, element: any) => this._processTable(i, element));

        return this._results;
    }

    _processTable(tableIndex: any, table: any) {
        this._results[tableIndex] = [];
        this._buildHeaders(tableIndex, table);

        this._$(table)
            .find("tr")
            .each((i: any, element: any) => this._processRow(tableIndex, i, element));
        this._pruneEmptyRows(tableIndex);
    }

    _processRow(tableIndex: any, index: any, row: any) {
        if (index === 0 && this._firstRowUsedAsHeaders[tableIndex] === true) return;

        this._results[tableIndex][index] = {};

        this._$(row)
            .find("td")
            .each((i: any, cell: any) => {
                this._results[tableIndex][index][this._headers[tableIndex][i] || i + 1] = this._$(
                    cell
                )
                    .text()
                    .trim();
            });
    }

    _buildHeaders(index: any, table: any) {
        this._headers[index] = [];

        this._$(table)
            .find("tr")
            .each((i: any, row: any) => {
                this._$(row)
                    .find("th")
                    .each((j: any, cell: any) => {
                        this._headers[index][j] = this._$(cell).text().trim();
                    });
            });

        if (this._headers[index].length) return;

        this._firstRowUsedAsHeaders[index] = true;
        this._$(table)
            .find("tr")
            .first()
            .find("td")
            .each((j: any, cell: any) => {
                this._headers[index][j] = this._$(cell).text().trim();
            });
    }

    _pruneEmptyRows(tableIndex: any) {
        this._results[tableIndex] = this._results[tableIndex].filter(
            (t: any) => Object.keys(t).length
        );
    }
}

export default HtmlTableToJson;
