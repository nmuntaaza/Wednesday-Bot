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
1. Paste your token on field TOKEN on .env file
1. Fill other field
1. Run your bot:

   ```bash
   $ npm run start
   ```
1. Invite your bot with:

   ```
   https://discord.com/api/oauth2/authorize?client_id=<your_bot_client_id>&permissions=3668032&scope=bot
   ```