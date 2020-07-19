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

const TOKEN = process.env.TOKEN;
const PREFIX = process.env.PREFIX;

var states = new Map();

client.login(TOKEN);

client.on('ready', () => {
  console.log('Bot is up!');
});

client.on('message', async message => {
  const [command, ...subCommands] = message.content.toLowerCase().slice(1).split(' ');
  let intervalStream;
  if (message.content.startsWith(PREFIX)) {
    const sourceId = message.guild ? message.guild.id : message.author.id;
    const newstates = {
      lastMemeSubReddit: '',
      maxPageList: 10,
      radioPlayTimeout: 6,
      radioPagination: 0
    }
    if (!states.has(sourceId)) states.set(sourceId, newstates);
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
            states.get(sourceId).lastMemeSubReddit = result.subReddit;
          });
        break;
      case 'play':
        if (!message.guild) {
          message.reply('In guild only');
          return;
        }
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
                      timeout: states.get(sourceId).radioPlayTimeout
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
                      timeout: states.get(sourceId).radioPlayTimeout
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
                    timeout: states.get(sourceId).radioPlayTimeout
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
        if (!message.guild) {
          message.reply('In guild only');
          return;
        }
        states.get(sourceId).radioPagination = 1;
        client.commands.get('radio').execute({
          message,
          args: {
            maxPageList: states.get(sourceId).maxPageList,
            radioPagination: states.get(sourceId).radioPagination
          }
        });
        break;
      case 'timeout':
        if (!message.guild) {
          message.reply('In guild only');
          return;
        }
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
            states.get(sourceId).radioPlayTimeout = result.timeout;
            message.reply(`Radio connetion timeout set to ${states.get(sourceId).radioPlayTimeout} second`);
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
  const sourceId = reaction.message.guild ? reaction.message.guild.id : reaction.message.author.id;
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  if (user.bot) return;
  if (!reaction.message.guild) return;
  if (reaction.message.author.id != client.user.id) return;

  if (reaction.emoji.name == '🔄') {
    client.commands.get('meme')
      .execute({
        message: reaction.message,
        args: {
          subReddit: states.get(sourceId).lastMemeSubReddit
        }
      })
      .then(result => {
        states.get(sourceId).lastMemeSubReddit = result.subReddit;
      });
  }

  if (reaction.emoji.name == '⬇️' || reaction.emoji.name == '⬆️') {
    states.get(sourceId).radioPagination = reaction.emoji.name == '⬇️' ?
      states.get(sourceId).radioPagination == Math.ceil(radioList.length / states.get(sourceId).maxPageList) ? states.get(sourceId).radioPagination : states.get(sourceId).radioPagination + 1 :
      states.get(sourceId).radioPagination == 1 ? states.get(sourceId).radioPagination : states.get(sourceId).radioPagination - 1;
    client.commands.get('radio').execute({
      reaction,
      args: {
        maxPageList: states.get(sourceId).maxPageList,
        radioPagination: states.get(sourceId).radioPagination
      }
    });
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  const sourceId = reaction.message.guild ? reaction.message.guild.id : reaction.message.author.id;
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  if (user.bot) return;
  if (!reaction.message.guild) return;
  if (reaction.message.author.id != client.user.id) return;

  if (reaction.emoji.name == '🔄') {
    client.commands.get('meme')
      .execute({
        message: reaction.message,
        args: {
          subReddit: states.get(sourceId).lastMemeSubReddit
        }
      })
      .then(result => {
        states.get(sourceId).lastMemeSubReddit = result.subReddit;
      });
  }

  if (reaction.emoji.name == '⬇️' || reaction.emoji.name == '⬆️') {
    states.get(sourceId).radioPagination = reaction.emoji.name == '⬇️' ?
      states.get(sourceId).radioPagination == Math.ceil(radioList.length / states.get(sourceId).maxPageList) ? states.get(sourceId).radioPagination : states.get(sourceId).radioPagination + 1 :
      states.get(sourceId).radioPagination == 1 ? states.get(sourceId).radioPagination : states.get(sourceId).radioPagination - 1;
    client.commands.get('radio').execute({
      reaction,
      args: {
        maxPageList: states.get(sourceId).maxPageList,
        radioPagination: states.get(sourceId).radioPagination
      }
    });
  }
});