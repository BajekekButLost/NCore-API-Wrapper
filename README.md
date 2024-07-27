<div align="center">
    <img src="https://raw.githubusercontent.com/BajekekButLost/NCore-API-Wrapper/main/logo.png" width="60%" />
    <br />
    <!-- <a href="https://ctrl.lol/discord"><img src="https://img.shields.io/discord/1055188344188973066?color=5865F2&logo=discord&logoColor=white" alt="support server" /></a> -->
    <a href="https://www.npmjs.com/package/ncore-api-wrapper" target="_blank"><img src="https://img.shields.io/npm/v/ncore-api-wrapper?maxAge=3600" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/ncore-api-wrapper" target="_blank"><img src="https://img.shields.io/npm/dt/ncore-api-wrapper?maxAge=3600" alt="npm downloads" /></a>
    <a href="https://paypal.me/bajekek" target="_blank"><img src="https://img.shields.io/badge/donate_on-Paypal-blue?logo=paypal" alt="paypal donate" /></a>
</div>

# nCore API Wrapper

> :warning: **Warning**
> This package is still in beta (v0)! Until the full release most things can and probably will change so, don't build full apps around it yet!

nCore API Wrapper is a library that makes it easy to communicate with nCore including searching, downloading torrents and much more.

## Features

-   Beginner friendly 🚀
-   Custom types 🔎
-   Downloading torrents 📩
-   Customizable useragent, cookies, etc... 🤖
-   v1 and v2 API 🌎
-   CommonJS and Module support 📦
-   And much more! 🧪

## Documentation 📚

<!-- You can find the full documentation [here](https://github.com/BajekekButLost/NCore-API-Wrapper/wiki). -->

In progress...

## Installation ⌨️

[![npm](https://nodei.co/npm/ncore-api-wrapper.png)](https://nodei.co/npm/ncore-api-wrapper/)

To install nCore API Wrapper, simply run the following command:

```bash
npm install ncore-api-wrapper
```

## Usage ❓

This is a simple overview of how to set up this library with all the options. Docs coming soon...

<!-- You can read more in the [full documentation](https://github.com/BajekekButLost/NCore-API-Wrapper/wiki) -->

```js
const nCore = require("ncore-api-wrapper");
const client = new nCore.Client({
    cookies: new nCore.CookieManager().addCookiesFromString("Your Cookies"), //Log in with cookies
});

client.on("ready", async () => {
    const torrent = await client.getTorrent(1490740);
    console.log(torrent.title); //Le.fabuleux.destin.d.Amelie.Poulain.2001.1080p.BluRay.DD5.1.x264.HuN-LiLBOX
    await torrent.download("Amelie csodálatos élete.torrent"); //Downloads torrent and creates a file with the specified path
});

client.login(username, password); //Log in with username & password
```

## Plans 📝

-   [x] Torrent page parsing to JSON
-   [x] Custom URL Query Manager
-   [x] Custom Cookie Manager
-   [x] Cookie Login
-   [x] Communicating with `/ajax.php`
-   [x] Ajax response parsing to JSON
-   [x] Torrent downloading
-   [ ] v2 Search System
-   [ ] v1 Search System
-   [ ] User class instead of string usernames

## Credits 🔎

-   **[UnderCtrl](https://github.com/underctrl-io)** for [CommandKit](https://github.com/underctrl-io/commandkit)'s README
-   **[brandon93s](https://github.com/brandon93s)** for [html-table-to-json](https://github.com/brandon93s/html-table-to-json)
