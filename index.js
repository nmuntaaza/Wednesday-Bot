require('dotenv').config();

const fs = require('fs');
const service = require('./services/meme');
const radio = require('./radioList');
const {
  Client,
  MessageAttachment,
  MessageEmbed,
  Collection
} = require('discord.js');

const client = new Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (let commandFile of commandFiles) {
  const command = require(`./commands/${commandFile}`);
  client.commands.set(command.name, command);
}

const TOKEN = process.env.DEV_TOKEN;
const PREFIX = process.env.DEV_PREFIX;
const ID = process.env.DEV_ID;

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
  if (message.content.startsWith(PREFIX)) {
    switch (command) {
      case 'ping':
        client.commands.get('ping').execute({
          message
        });
        break;
      case 'meme':
        client.commands.get('meme')
          .execute({
            message,
            args: {
              subReddit: subCommands[0]
            }
          })
          .then(result => {
            lastMemeSubReddit = result.subReddit;
          });
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
              if (!isNotIndex) {
                client.commands.get('play')
                  .execute({
                    client,
                    connection: con,
                    message,
                    args: {
                      radio: radioList[Number(subCommands[0]) - 1],
                      newRadio: false,
                      timeout: RADIO_PLAY_TIMEOUT
                    }
                  })
                  .then(result => {
                    dispatcher = result.dispatcher;
                  })
                  .catch(error => {
                    console.log(error);
                  });
              } else {
                client.commands.get('play')
                  .execute({
                    client,
                    connection: con,
                    message,
                    args: {
                      radio: subCommands,
                      newRadio: true,
                      timeout: RADIO_PLAY_TIMEOUT
                    }
                  })
                  .then(result => {
                    dispatcher = result.dispatcher;
                    radioList.push(result.radio);
                  })
                  .catch(error => {
                    console.log(error);
                  });
              }
            } else {
              client.commands.get('play')
                .execute({
                  client,
                  connection: con,
                  message,
                  args: {
                    radio: radioList[12], // Default radio
                    newRadio: false,
                    timeout: RADIO_PLAY_TIMEOUT
                  }
                })
                .then(result => {
                  dispatcher = result.dispatcher;
                })
                .catch(error => {
                  console.log(error);
                });
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
        if (subCommands.length < 1) {
          message.reply('Please set the time')
          return;
        }
        client.commands.get('timeout')
          .execute({
            message,
            args: {
              timeout: subCommands[0]
            }
          })
          .then(result => {
            RADIO_PLAY_TIMEOUT = result.timeout;
            message.reply(`Radio connetion timeout set to ${RADIO_PLAY_TIMEOUT} second`);
          })
          .catch(error => {
            console.error(error);
            message.reply(`Error: ${error.message}`);
          });
        break;
      case 'help':
      default:
        client.commands.get('help').execute({
          message
        });
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
    client.commands.get('meme')
      .execute({
        message: reaction.message,
        args: {
          subReddit: lastMemeSubReddit
        }
      })
      .then(result => {
        lastMemeSubReddit = result.subReddit;
      });
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
    client.commands.get('meme')
      .execute({
        message: reaction.message,
        args: {
          subReddit: lastMemeSubReddit
        }
      })
      .then(result => {
        lastMemeSubReddit = result.subReddit;
      });
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

    con.play(broadcast, {
        highWaterMark: 50
      })
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
          url: radio[0] || '',
          name: radio[1] || '',
          genre: radio[2] || '',
          lang: radio[3] || '',
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
  });
}