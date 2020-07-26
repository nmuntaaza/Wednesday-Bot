const memeService = require('../services/meme');
const {
  MessageAttachment
} = require('discord.js');

module.exports = {
  name: 'meme',
  description: 'Get memes from subreddit',
  execute: async function ({
    client,
    connection,
    message,
    args
  }) {
    return new Promise((resolve, reject) => {
      memeService
        .getMeme(args.subReddit)
        .then(async memes => {
          if (!memes.nfsw) {
            const attachment = new MessageAttachment(memes.url);
            try {
              await (await message.channel.send(attachment))
                .react('🔄');
            } catch (error) {
              console.error(error);
              message.channel
                .send('Timeout');
            }
            resolve({
              subReddit: args.subReddit,
              message: `Sent meme`
            });
          } else {
            console.log('Getting NFSW meme. Not handled yet');
          }
        })
        .catch(error => {
          console.error('Error @Commands.Meme.Execute():', error);
          message.channel.send(error.message);
        })
    })
  }
}