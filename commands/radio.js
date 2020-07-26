const {
  MessageEmbed
} = require('discord.js');
const radioService = require('../services/radio');
const userRadioService = require('../services/user-radio');

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
        const radioList = [...await radioService.find(mongoClient), ...await userRadioService.find(mongoClient, { guildId: reaction ? reaction.message.guild.id : message.guild.id })];
        const radioListLength = radioList.length;

        let text = currentPlayed ? `🎵 **Playing ${currentPlayed} Now** 🎵\n\n` : '';
        for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
          if (i >= radioListLength) break;
          text += `**[${i + 1}]** ${radioList[i].name} ${radioList[i].genre ? '| ' + radioList[i].genre : ''}\n`;
        }
        const embedMsg = new MessageEmbed().setDescription(text.trim());
        if (!reaction) {
          await (await message.channel.send(embedMsg)).react('⬇️');
          resolve({
            message: `Sent radio list page ${radioPagination} @${message.guild.name}-${message.guild.id}`
          })
        } else {
          const maxPagination = Math.ceil(radioListLength / maxPageList);
          if (radioPagination == 1) {
            await (await reaction.message.reactions.removeAll()).react('⬇️');
          } else if (radioPagination > 1 && radioPagination < maxPagination) {
            const m = await (await reaction.message.reactions.removeAll()).edit(embedMsg);
            await m.react('⬇️');
            await m.react('⬆️');
          } else {
            await (await (await reaction.message.reactions.removeAll()).edit(embedMsg)).react('⬆️');
          }
          resolve({
            message: `Sent radio list page ${radioPagination} @${reaction.message.guild.name}-${reaction.message.guild.id}`
          })
        }
      } catch (error) {
        console.error('Error @Commands.Radio.Execute():', error);
        console.error('Args:', args);
      }
    });
  }
}