require('dotenv').config();

const fs = require('fs');
const service = require('./service');
const radio = require('./radioList');
const {
  Client,
  MessageAttachment,
  MessageEmbed
} = require('discord.js');
const client = new Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

const TOKEN = process.env.PROD_TOKEN;
const PREFIX = process.env.PROD_PREFIX;
const ID = process.env.PROD_ID;

var RADIO_PLAY_TIMEOUT = 6;

var radioList = radio.radioList;
var intervalStream;
var lastMemeSubReddit;
var maxPageList = 10;
var radioPagination;

client.login(TOKEN);

client.on('ready', () => {
  console.log('Bot is up!');
});

client.on('message', async message => {
  const [command, ...subCommands] = message.content.toLowerCase().slice(1).split(' ');
  let embedMsg;
  let msgEmbed;
  if (message.content.startsWith(PREFIX)) {
    switch (command) {
      case 'ping':
        message.channel.send('Pong!');
        break;
      case 'meme':
        service.getMeme(subCommands[0])
          .then(async memes => {
            lastMemeSubReddit = subCommands[0];
            if (!memes.nfsw) {
              const attachment = new MessageAttachment(memes.url);
              await (await message.channel.send(attachment)).react('🔄');
            } else {
              console.log('Getting NFSW meme. Not handled yet');
            }
          })
          .catch(error => {
            console.error(error);
            message.channel.send(error.message);
          })
        break;
      case 'play':
        if (!message.guild) return;
        if (!message.member.voice.channel) {
          message.reply('You need to join a voice channel first!');
          return;
        }
        message.member.voice.channel.join().then(async (con) => {
          let dispatcher;
          try {
            if (subCommands.length > 0) {
              let isNotIndex = Number.isNaN(Number(subCommands[0]));
              if (isNotIndex && subCommands.length < 2) {
                message.channel.send('Please add radio name');
                return;
              }
              dispatcher = isNotIndex ? await playRadio(con, subCommands, message, true) : await playRadio(con, radioList[+subCommands[0] - 1], message);
            } else {
              dispatcher = await playRadio(con, radioList[12], message);
            }
            intervalStream = setInterval(async () => {
              if (con.channel.members.size < 2) {
                dispatcher.destroy();
                con.disconnect();
                clearInterval(intervalStream);
              }
            }, 5 * 1000);
          } catch (error) {
            console.error(error);
          }
        })
        break;
      case 'radio':
        radioPagination = 1;
        let text = '';
        for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
          if (i >= radioList.length) break;
          text += `${i + 1}) ${radioList[i].name} ${radioList[i].genre ? '| ' + radioList[i].genre : ''}\n`;
        }
        embedMsg = new MessageEmbed().setDescription(text.trim());
        await (await message.channel.send(embedMsg)).react('⬇️');
        break;
      case 'timeout':
        if (subCommands < 1) {
          message.reply('Set the time');
          return;
        }
        if (Number.isNaN(+subCommands[0])) {
          message.reply('Time in number');
          return;
        }
        RADIO_PLAY_TIMEOUT = +subCommands[0];
        message.reply(`Set timeout to ${subCommands[0]}`);
        break;
      case 'help':
      default:
        message.channel.send({
          "embed": {
            "title": "Wednesday",
            "description": "Is simple bot for you enjoy.",
            "color": 7506394,
            "fields": [{
              "name": "Features",
              "value": "**1.** Get memes from reddit.\n**2.** Listen to radio. You can add yours to!.\n**3.** Listen to podcast (i hope)."
            }, {
              "name": "List of command",
              "value": "**!radio** [open radio list]\n**!play {index}** [play radio from radio list at inputed index]\n**!play {url} {name}** [play custom radio and saved to radio list]\n**!timeout {time}** [change radio timeout time]"
            }]
          }
        })
        break;
    }
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  if (user.bot) return;
  if (!reaction.message.guild) return;
  if (reaction.message.author.id != ID) return;

  if (reaction.emoji.name == '🔄') {
    service.getMeme(lastMemeSubReddit)
      .then(async memes => {
        if (!memes.nfsw) {
          const attachment = new MessageAttachment(memes.url);
          await (await reaction.message.channel.send(attachment)).react('⬇️');
        } else {
          console.log('Getting NFSW meme. Not handled yet');
        }
      })
      .catch(error => {
        console.error(error);
        message.channel.send(error.message);
      })
  }

  if (reaction.emoji.name == '⬇️') {
    radioPagination = radioPagination == Math.ceil(radioList.length / maxPageList) ? radioPagination : radioPagination + 1;
    let text = '';
    for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
      if (i >= radioList.length) break;
      text += `${i + 1}) ${radioList[i].name} ${radioList[i].genre ? '| ' + radioList[i].genre : ''}\n`;
    }
    const embedMsg = new MessageEmbed().setDescription(text.trim());
    const msgEmbed = await reaction.message.edit(embedMsg);
    if (radioPagination != 1) {
      await msgEmbed.react('⬆️');
    } else {
      reaction.message.reactions.cache
        .get('⬆️')
        .remove()
        .catch(error => {
          console.error(error);
        });
    }
    if (radioPagination != Math.ceil(radioList.length / maxPageList)) {
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

  if (reaction.emoji.name == '⬆️') {
    radioPagination = radioPagination == 1 ? radioPagination : radioPagination - 1;
    let text = '';
    for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
      if (i >= radioList.length) break;
      text += `${i + 1}) ${radioList[i].name} ${radioList[i].genre ? '| ' + radioList[i].genre : ''}\n`;
    }
    const embedMsg = new MessageEmbed().setDescription(text.trim());
    const msgEmbed = await reaction.message.edit(embedMsg);
    if (radioPagination != 1) {
      await msgEmbed.react('⬆️');
    } else {
      reaction.message.reactions.cache
        .get('⬆️')
        .remove()
        .catch(error => {
          console.error(error);
        });
    }
    if (radioPagination != Math.ceil(radioList.length / maxPageList)) {
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

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  if (user.bot) return;
  if (!reaction.message.guild) return;
  if (reaction.message.author.id != ID) return;

  if (reaction.emoji.name == '🔄') {
    service.getMeme(lastMemeSubReddit)
      .then(async memes => {
        if (!memes.nfsw) {
          const attachment = new MessageAttachment(memes.url);
          await (await reaction.message.channel.send(attachment)).react('🔄');
        } else {
          console.log('Getting NFSW meme. Not handled yet');
        }
      })
      .catch(error => {
        console.error(error);
        message.channel.send(error.message);
      })
  }

  if (reaction.emoji.name == '⬇️') {
    radioPagination++;
    let text = '';
    for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
      if (i >= radioList.length) break;
      text += `${i + 1}) ${radioList[i].name} ${radioList[i].genre ? '| ' + radioList[i].genre : ''}\n`;
    }
    const embedMsg = new MessageEmbed().setDescription(text.trim());
    const msgEmbed = await reaction.message.edit(embedMsg);
    if (radioPagination != 1) {
      await msgEmbed.react('⬆️');
    } else {
      reaction.message.reactions.cache.get('⬆️').remove().catch(error => {
        console.error(error);
      });
    }
    if (radioPagination != Math.ceil(radioList.length / maxPageList)) {
      await msgEmbed.react('⬇️');
    } else {
      reaction.message.reactions.cache.get('⬇️').remove().catch(error => {
        console.error(error);
      });
    }
  }

  if (reaction.emoji.name == '⬆️') {
    radioPagination--;
    let text = '';
    for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
      if (i >= radioList.length) break;
      text += `${i + 1}) ${radioList[i].name} ${radioList[i].genre ? '| ' + radioList[i].genre : ''}\n`;
    }
    const embedMsg = new MessageEmbed().setDescription(text.trim());
    const msgEmbed = await reaction.message.edit(embedMsg);
    if (radioPagination != 1) {
      await msgEmbed.react('⬆️');
    } else {
      reaction.message.reactions.cache.get('⬆️').remove().catch(error => {
        console.error(error);
      });
    }
    if (radioPagination != Math.ceil(radioList.length / maxPageList)) {
      await msgEmbed.react('⬇️');
    } else {
      reaction.message.reactions.cache.get('⬇️').remove().catch(error => {
        console.error(error);
      });
    }
  }
});

async function playRadio(con, radio, msg, newRadio = false) {
  return new Promise(async (resolve, reject) => {
    let success = false;
    let radioURL = newRadio ? radio[0] : radio.url;
    let radioName = newRadio ? radio[1] : radio.name;
    let broadcast = client.voice.createBroadcast();
    let dispatcher = broadcast.play(radioURL);
    
    con.play(broadcast, { highWaterMark: 50 })
      .on('start', async () => {
        success = true;
        console.log(`Stream at ${radioURL} started`);
        msg.channel.send(`Stream at ${radioName} started`);
      })
      .on('error', async error => {
        msg.channel.send('Failed. Play other');
        reject(error);
      })

    setTimeout(async () => {
      if (success && newRadio) {
        let r = {
          url   : radio[0] || '',
          name  : radio[1] || '',
          genre : radio[2] || '',
          lang  : radio[3] || '',
        }
        radioList.push(r);
        console.log('Success adding new radio', r);
      } else if (success) {
        console.log('Success playing from existing radio list');
      } else {
        msg.channel.send('TImeout. Play other or try again');
        reject('Timeout. Play other or try again');
      }
      resolve(dispatcher);
    }, RADIO_PLAY_TIMEOUT * 1000);
  })
}