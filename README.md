<div align="center">
    <img src="https://raw.githubusercontent.com/underctrl-io/commandkit/master/apps/docs/public/ckit_logo.svg" width="60%" />
    <br />
    <!-- <a href="https://ctrl.lol/discord"><img src="https://img.shields.io/discord/1055188344188973066?color=5865F2&logo=discord&logoColor=white" alt="support server" /></a> -->
    <a href="https://www.npmjs.com/package/ncore-api-wrapper"><img src="https://img.shields.io/npm/v/ncore-api-wrapper?maxAge=3600" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/ncore-api-wrapper"><img src="https://img.shields.io/npm/dt/ncore-api-wrapper?maxAge=3600" alt="npm downloads" /></a>
</div>

# nCore API Wrapper

nCore API Wrapper is a library that makes it easy to communicate with the nCore API including searching, downloading torrents and much more.

## Features

-   Beginner friendly 🚀
-   Slash + context menu commands support ✅
-   Multiple dev guilds, users, & roles support 🤝
-   Automatic command updates 🤖
-   REST registration behaviour 📍
-   Easy command line interface 🖥️
-   And much more! 🧪

## Documentation

You can find the full documentation [here](https://commandkit.js.org).

## Installation

[![npm](https://nodei.co/npm/commandkit.png)](https://nodei.co/npm/commandkit/)

To install nCore API Wrapper, simply run the following command:

```bash
$ npm install ncore-api-wrapper
```

## Usage

This is a simple overview of how to set up this library with all the options. You can read more in the [full documentation](https://commandkit.js.org)

```js
// index.js
const { Client, GatewayIntentBits } = require("discord.js");
const { CommandKit } = require("commandkit");
const path = require("path");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

new CommandKit({
    // Your discord.js client object
    client,

    // Path to the commands folder
    commandsPath: path.join(__dirname, "commands"),

    // Path to the events folder
    eventsPath: path.join(__dirname, "events"),

    // Path to the validations folder (only valid if "commandsPath" was provided)
    validationsPath: path.join(__dirname, "validations"),

    // Array of development server IDs (used to register and run devOnly commands)
    devGuildIds: ["1234567890", "0987654321"],

    // Array of developer user IDs (used for devOnly commands)
    devUserIds: ["1234567890", "0987654321"],

    // Array of developer role IDs (used for devOnly commands)
    devRoleIds: ["1234567890", "0987654321"],

    // Disable CommandKit's built-in validations
    skipBuiltInValidations: true,

    // Update command registration/reload behaviour to register all commands at once
    bulkRegister: true,
});

client.login("YOUR_TOKEN_HERE");
```

## Support and Suggestions

Submit any queries or suggestions in our [Discord community](https://ctrl.lol/discord).
