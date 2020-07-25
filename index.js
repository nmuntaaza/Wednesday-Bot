require('dotenv').config();

const fs = require('fs');
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
const mongodb = require('./services/mongodb');
const radioService = require('./services/radio');

const TOKEN = process.env.TOKEN;
const PREFIX = process.env.PREFIX;
const MONGODB_CONNECT_STRING = process.env.MONGODB_CONNECT_STRING;

var mongoClient;
var states = new Map();

run();

client.on('ready', () => {
  console.log('Bot is up!');
  client.user.setActivity('!help');
});

client.on('message', async message => {
  if (message.author.bot) return;
  let intervalStream;
  const [command, ...subCommands] = message.content.toLowerCase().slice(1).split(' ');
  const sourceId = message.guild ? message.guild.id : message.author.id;
  if (!states.get(sourceId)) {
    const newState = {
      lastMemeSubReddit: '',
      maxPageList: 10,
      radioPlayTimeout: 6,
      radioPagination: 0,
      prefix: '!',
      currentPlayed: ''
    }
    states.set(sourceId, newState);
  }
  const state = states.get(sourceId);
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
            state.lastMemeSubReddit = result.subReddit;
          });
        break;
      case 'prefix':
        break; // Not yet added to new feature
        if (subCommands.length < 1) {
          message.channel.send('Please specify the prefix');
          return;
        }
        client.commands.get('prefix')
          .execute({
            args: {
              currentState: state,
              newPrefix: subCommands[0]
            }
          })
          .then(result => {
            states.set(sourceId, result.newState);
            message.channel.send(`Prefix has changed to ${result.newState.prefix}`);
          })
      case 'play':
        let m;
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
          let radioList = await radioService.find(mongoClient);
          try {
            if (subCommands.length > 0) {
              let isNotIndex = Number.isNaN(Number(subCommands[0]));
              if (isNotIndex && subCommands.length < 2) {
                message.channel.send('Please add radio name');
                return;
              }
              m = await message.channel.send('Connecting. Please wait...');
              if (!isNotIndex) {
                await client.commands.get('play')
                  .execute({
                    client,
                    connection: con,
                    message: m,
                    args: {
                      radio: radioList[Number(subCommands[0]) - 1],
                      newRadio: false,
                      timeout: state.radioPlayTimeout
                    }
                  })
                  .then(result => {
                    dispatcher = result.dispatcher;
                    state.currentPlayed = result.currentPlayed;
                  })
                  .catch(error => {
                    console.log(error);
                  });
              } else {
                await client.commands.get('play')
                  .execute({
                    client,
                    connection: con,
                    message: m,
                    args: {
                      radio: subCommands,
                      newRadio: true,
                      timeout: state.radioPlayTimeout,
                      mongoClient
                    }
                  })
                  .then(result => {
                    dispatcher = result.dispatcher;
                    state.currentPlayed = result.currentPlayed;
                    radioService.insert(mongoClient, {
                        radio: result.radio
                      })
                      .then(result => { console.log('Success insert new radio', result.radio); })
                      .catch(error => { console.error('Error @Index.radioService.insert()', error); })
                  })
                  .catch(error => {
                    console.log(error);
                  });
              }
            } else {
              m = await message.channel.send('Connecting. Please wait...');
              await client.commands.get('play')
                .execute({
                  client,
                  connection: con,
                  message: m,
                  args: {
                    radio: radioList[12], // Default radio
                    newRadio: false,
                    timeout: state.radioPlayTimeout
                  }
                })
                .then(result => {
                  dispatcher = result.dispatcher;
                  state.currentPlayed = result.currentPlayed;
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
        state.radioPagination = 1;
        client.commands.get('radio').execute({
          message,
          args: {
            maxPageList: state.maxPageList,
            radioPagination: state.radioPagination,
            currentPlayed: state.currentPlayed,
            mongoClient
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
            state.radioPlayTimeout = result.timeout;
            message.reply(`Radio connetion timeout set to ${state.radioPlayTimeout} second`);
          })
          .catch(error => {
            console.error(error);
            message.reply(`Error: ${error.message}`);
          });
        break;
      case 'help':
        client.commands.get('help').execute({
          message
        });
        break;
    }
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  const sourceId = reaction.message.guild ? reaction.message.guild.id : reaction.message.author.id;
  let state = states.get(sourceId);
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
          subReddit: state.lastMemeSubReddit
        }
      })
      .then(result => {
        state.lastMemeSubReddit = result.subReddit;
      });
  }

  if (reaction.emoji.name == '⬇️' || reaction.emoji.name == '⬆️') {
    const radioListLength = await radioService.count(mongoClient);
    state.radioPagination = reaction.emoji.name == '⬇️' ?
      state.radioPagination == Math.ceil(radioListLength / state.maxPageList) ? state.radioPagination : state.radioPagination + 1 :
      state.radioPagination == 1 ? state.radioPagination : state.radioPagination - 1;
    client.commands.get('radio').execute({
      reaction,
      args: {
        maxPageList: state.maxPageList,
        radioPagination: state.radioPagination,
        currentPlayed: state.currentPlayed,
        mongoClient
      }
    });
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  const sourceId = reaction.message.guild ? reaction.message.guild.id : reaction.message.author.id;
  let state = states.get(sourceId);
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
          subReddit: state.lastMemeSubReddit
        }
      })
      .then(result => {
        state.lastMemeSubReddit = result.subReddit;
      });
  }

  if (reaction.emoji.name == '⬇️' || reaction.emoji.name == '⬆️') {
    const radioListLength = await radioService.count(mongoClient);
    state.radioPagination = reaction.emoji.name == '⬇️' ?
      state.radioPagination == Math.ceil(radioListLength / state.maxPageList) ? state.radioPagination : state.radioPagination + 1 :
      state.radioPagination == 1 ? state.radioPagination : state.radioPagination - 1;
    client.commands.get('radio').execute({
      reaction,
      args: {
        maxPageList: state.maxPageList,
        radioPagination: state.radioPagination,
        currentPlayed: state.currentPlayed,
        mongoClient
      }
    });
  }
});

async function run() {
  mongodb.connect(MONGODB_CONNECT_STRING)
    .then(async mongoC => {
      console.log('Connected to DB');
      mongoClient = mongoC;
      client.login(TOKEN);
    })
    .catch(error => {
      console.error('Error @Index.Run:', error);
    })
}