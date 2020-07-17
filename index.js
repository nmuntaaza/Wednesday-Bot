require('dotenv').config();

const fs = require('fs');
const radioList = require('./radioList').radioList;
const {
  Client,
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

const TOKEN = process.env.PROD_TOKEN;
const PREFIX = process.env.PROD_PREFIX;
const ID = process.env.PROD_ID;

var RADIO_PLAY_TIMEOUT = 6;
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
                await client.commands.get('play')
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
                await client.commands.get('play')
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
              await client.commands.get('play')
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
        client.commands.get('radio').execute({
          message,
          args: {
            maxPageList,
            radioPagination
          }
        });
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

  if (reaction.emoji.name == '⬇️' || reaction.emoji.name == '⬆️') {
    radioPagination = reaction.emoji.name == '⬇️' 
      ? radioPagination == Math.ceil(radioList.length / maxPageList) ? radioPagination : radioPagination + 1
      : radioPagination == 1 ? radioPagination : radioPagination - 1;
    client.commands.get('radio').execute({
      reaction,
      args: {
        maxPageList,
        radioPagination
      }
    });
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

  if (reaction.emoji.name == '⬇️' || reaction.emoji.name == '⬆️') {
    radioPagination = reaction.emoji.name == '⬇️' 
      ? radioPagination == Math.ceil(radioList.length / maxPageList) ? radioPagination : radioPagination + 1
      : radioPagination == 1 ? radioPagination : radioPagination - 1;
    client.commands.get('radio').execute({
      reaction,
      args: {
        maxPageList,
        radioPagination
      }
    });
  }
});