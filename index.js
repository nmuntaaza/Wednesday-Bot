require('dotenv').config();

const service = require('./service');
const { Client, MessageAttachment, MessageEmbed } = require('discord.js');
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

const TOKEN = process.env.PROD_TOKEN;
const PREFIX = process.env.PROD_PREFIX;
const ID = process.env.PROD_ID;

var radioList = [
  {
    url: 'http://relay.181.fm:8018/',
    name: 'Highway 181',
    genre: 'Country',
    lang: 'EN'
  },
  {
    url: 'https://radio.bigrig.fm/',
    name: 'BigRig FM',
    genre: 'Country',
    lang: 'EN'
  },
  {
    url: 'https://19993.live.streamtheworld.com/JACK_FM.mp3',
    name: 'Jack FM Oxford',
    genre: 'POP',
    lang: 'EN'
  },
]

var AllowedChannel = [];
var connection;
var dispatcher;
var streamDestroyed;
var intervalStream;
var lastPlayedRadio;

client.on('ready',() => {
  console.log('Bot is up!');
  let date;
  let attachment;
  let currentDate;
  let lastSentDate;
  setInterval(() => {
    date = new Date();
    currentDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    AllowedChannel.forEach(channelId => {
      if (date.getDay() == 5) {
        if (lastSentDate != null) {
          if (lastSentDate != currentDate) {
            attachment = new MessageAttachment('./itswednesdaymydudes.jpeg');
            client.channels.cache.get(channelId).send(attachment);
          }
        } else {
          attachment = new MessageAttachment('./itswednesdaymydudes.jpeg');
          client.channels.cache.get(channelId).send(attachment);
        }
      }
    });
    lastSentDate = currentDate;
    console.log(`Get current date ${currentDate}`);
  }, 3600 * 1000);
});

client.on('message', async message => {
  const [command, ...subCommands] = message.content.slice(1).split(' ');
  let channelId;
  let embedMsg;
  if (message.content.startsWith(PREFIX)) {
    switch(command) {
      case 'ping':
        const msgEmbed = await message.channel.send('Pong!');
        break;
      case 'deleteAll':
        message.channel.messages.fetch().then(msgs => {
          message.channel.bulkDelete(msgs.filter(m => m.author.username == 'itswednesdaymydudes'))
        });
        break;
      case 'allow':
        channelId = message.channel.id;
        if (AllowedChannel.indexOf(channelId) != -1) {
          message.channel.send('This channel already allowed');
          return;
        }
        AllowedChannel.push(message.channel.id);
        message.channel.send('This channel will get memes. Horray :)');
        break;
      case 'disallow':
        channelId = message.channel.id;
        if (AllowedChannel.indexOf(channelId) == -1) {
          message.channel.send('This isn\'t allowed to begin with.');
          return;
        }
        AllowedChannel = AllowedChannel.filter((chId, i) => i != channelIndex);
        message.channel.send('This channel now lost it\'s awesomeness. :(');
        break;
      case 'meme':
        service.getMeme(subCommands[0])
          .then(async memes => {
            if (!memes.nfsw) {
              const attachment = new MessageAttachment(memes.url);
              const msgEmbed = await message.channel.send(attachment);
              msgEmbed.react("🔄");
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
        streamDestroyed = false;
        if (!message.guild) return;
        if (message.member.voice.channel) {
          connection = await message.member.voice.channel.join();
          if (subCommands.length > 0) {
            let isNotIndex = Number.isNaN(Number(subCommands[0]));
            console.log(subCommands, isNotIndex);
            try {
              let success = false;
              if (isNotIndex) {
                dispatcher = connection.play(subCommands[0]).on('start', () => {
                  console.log(`Stream at ${subCommands[0]} started`);
                  success = true;
                });
              } else {
                dispatcher = connection.play(radioList[+subCommands[0] - 1].url).on('start', () => {
                  console.log(`Stream at ${radioList[+subCommands[0] - 1].url} started`);
                  success = true;
                });
              }
              setTimeout(() => {
                if (success && isNotIndex) {
                  radioList.push({
                    url: subCommands[0],
                    name: subCommands[1] || '',
                    genre: subCommands[2] || '',
                    lang: subCommands[3] || ''
                  });
                  console.log('Success adding new radio URL');
                } else {
                  console.error('Failed adding new radio URL');
                  dispatcher = connection.play(radioList[0].url).on('start', () => {
                    console.error(`Stream at ${radioList[0].url} started`);
                  });
                }
              }, 5 * 1000);
            } catch (error) {
              console.log('Failed adding new radio URL');
              dispatcher = connection.play(radioList[0].url).on('start', () => {
                console.error(`Stream at ${radioList[0].url} started`);
              });
            }
          } else {
            dispatcher = connection.play(radioList[0].url).on('start', () => {
              console.log(`Stream at ${radioList[0].url} started`);
            });
          }
          intervalStream = setInterval(function () {
            if ( connection.channel.members.size < 2 ) {
              dispatcher.destroy();
              streamDestroyed = true;
            } else {
              if (streamDestroyed) {
                dispatcher = connection.play('http://relay.181.fm:8018/');
                streamDestroyed = false;
              }
            }
          }, 5 * 1000);
        } else {
          message.reply('You need to join a voice channel first!');
        }
        break;
      case 'leave':
        if (connection) {
          connection.disconnect();
          connection = null;
          clearInterval(intervalStream);
        }
        break;
      case 'open-radio':
        let descriptionText = radioList.reduce((acc, cur, i) => {
          return acc + `${i + 1}) ${cur.name} | ${cur.genre} | ${cur.lang}\n`;
        }, '');
        embedMsg = new MessageEmbed()
          .setDescription(descriptionText.trim());
        message.channel.send(embedMsg);
        break;
      default:
        message.channel.send('Command not found');
        break;
    }
  } else if (message.content.toLowerCase().includes('dude')) {
    const attachment = new MessageAttachment('https://i.imgflip.com/47t4x7.jpg');
    message.channel.send(attachment);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  if (user.bot) return;
  if (!reaction.message.guild) return;
  if (reaction.message.author.id != ID) return;

  if (reaction.emoji.name = '🔄') {
    service.getMeme()
      .then(async memes => {
        if (!memes.nfsw) {
          const attachment = new MessageAttachment(memes.url);
          const msgEmbed = await reaction.message.channel.send(attachment);
          msgEmbed.react("🔄");
        } else {
          console.log('Getting NFSW meme. Not handled yet');
        }
      })
      .catch(error => {
        console.error(error);
        message.channel.send(error.message);
      })
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  if (user.bot) return;
  if (!reaction.message.guild) return;
  if (reaction.message.author.id != ID) return;

  if (reaction.emoji.name = '🔄') {
    service.getMeme()
      .then(async memes => {
        if (!memes.nfsw) {
          const attachment = new MessageAttachment(memes.url);
          const msgEmbed = await reaction.message.channel.send(attachment);
          msgEmbed.react("🔄");
        } else {
          console.log('Getting NFSW meme. Not handled yet');
        }
      })
      .catch(error => {
        console.error(error);
        message.channel.send(error.message);
      })
  }
})

client.login(TOKEN);