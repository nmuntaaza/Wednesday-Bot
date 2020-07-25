const {
  MessageEmbed
} = require('discord.js');
const radioService = require('../services/radio');

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
      try {
        const {
          currentPlayed,
          radioPagination,
          maxPageList,
          mongoClient
        } = args;
        const radioList = await radioService.find(mongoClient);
        const radioListLength = radioList.length;

        let text = currentPlayed ? `🎵 **Playing ${currentPlayed} Now** 🎵\n\n` : '';
        for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
          if (i >= radioListLength) break;
          text += `**[${i + 1}]** ${radioList[i].name} ${radioList[i].genre ? '| ' + radioList[i].genre : ''}\n`;
        }
        const embedMsg = new MessageEmbed().setDescription(text.trim());
        if (!reaction) {
          await (await message.channel.send(embedMsg)).react('⬇️');
          resolve();
        } else {
          const msgEmbed = await reaction.message.edit(embedMsg);
          if (radioPagination != 1) {
            await msgEmbed.react('⬆️');
          } else {
            reaction.message.reactions.cache
              .get('⬆️')
              .remove()
              .then(() => {
                resolve();
              })
              .catch(error => {
                reject(error);
              });
          }
          if (radioPagination != Math.ceil(radioListLength / maxPageList)) {
            await msgEmbed.react('⬇️');
          } else {
            reaction.message.reactions.cache
              .get('⬇️')
              .remove()
              .then(() => {
                resolve();
              })
              .catch(error => {
                reject(error);
              });
          }
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
}