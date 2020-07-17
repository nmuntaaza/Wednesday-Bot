const {
  MessageEmbed
} = require('discord.js');
const radioList = require('../radioList').radioList;

module.exports = {
  name: 'radio',
  description: 'Show radio list',
  execute: async function ({
    client,
    connection,
    message,
    reaction,
    args
  }) {
    return new Promise(async (resolve, reject) => {
      let text = '';
      for (let i = (args.radioPagination - 1) * args.maxPageList; i < (args.radioPagination) * args.maxPageList; i++) {
        if (i >= radioList.length) break;
        text += `${i + 1}) ${radioList[i].name} ${radioList[i].genre ? '| ' + radioList[i].genre : ''}\n`;
      }
      const embedMsg = new MessageEmbed().setDescription(text.trim());
      if (!reaction) {
        await (await message.channel.send(embedMsg)).react('⬇️');
      } else {
        const msgEmbed = await reaction.message.edit(embedMsg);
        if (args.radioPagination != 1) {
          await msgEmbed.react('⬆️');
        } else {
          reaction.message.reactions.cache
            .get('⬆️')
            .remove()
            .catch(error => {
              console.error(error);
            });
        }
        if (args.radioPagination != Math.ceil(radioList.length / args.maxPageList)) {
          await msgEmbed.react('⬇️');
        } else {
          reaction.message.reactions.cache
            .get('⬇️')
            .remove()
            .catch(error => {
              console.error(error);
            });
        }
      }
    });
  }
}