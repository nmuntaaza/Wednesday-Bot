# Wednesday-Bot

This bot main purpose is to play radio on discord. This bot used for my personal discord guild so i may add another feature such as get meme from reddit.

## Local Setup

To run this bot locally:

1. Install [Node.js](https://nodejs.org/en/) if you don't have them already. (I recommend install it with [nvm](https://github.com/nvm-sh/nvm))

1. Clone this repository:

   ```bash
   $ git clone https://github.com/nmuntaaza/Wednesday-Bot.git
   ```

1. `cd` to the repository directory and run the following command:

   ```bash
   $ cd Wednesday-Bot
   $ npm i
   ```
1. Rename .env.sample to .env

1. If you doesn't have discord bot token:
   * Open [Discord Developer](https://discord.com/developers/applications).
   * Create new application.
   * When done use should be in your application information, open Bot sidebar.
   * Click add bot and click yes.
   * Click copy to copy your token.
1. Paste your token on field TOKEN on .env file.
1. Fill other field.
1. Run your bot:

   ```bash
   $ npm run start
   ```
1. Get your bot client id from your application in [Discord Developer](https://discord.com/developers/applications).
1. Invite your bot with:

   ```
   https://discord.com/api/oauth2/authorize?client_id=<your_bot_client_id>&permissions=3668032&scope=bot
   ```

## Database

I use mongodb atlas to store my radio, to set up your database you can read tutorial to [setup a free cluster](https://docs.atlas.mongodb.com/getting-started/) in mongodb atlas.

Database Name: wednesday
Collection `radio` JSON structure:
```json
{
   "_id": {
      "$oid": "5f1c373291b9e39487b68055"
   },
   "url": "http://ice-the.musicradio.com:80/LBC973MP3Low",
   "name": "LBC",
   "genre": "",
   "lang": "EN"
}
```
Collection `radio` JSON structure:
```json
{
   "_id": "5251183704214077xx", // Guild ID
   "lastMemeSubReddit": "",
   "maxPageList": 10,
   "radioPlayTimeout": 6,
   "radioPagination": 0,
   "prefix": "!",
   "currentPlayed": ""
}
```
Collection `radio` JSON structure:
```json
{
   "_id": {
      "$oid": "5f1cd9651020bf1af7e80e20"
   },
   "url": "http://listento.ardanradio.com:1059/stream/1/",
   "name": "Ardan",
   "genre": "",
   "lang": ""
}
```