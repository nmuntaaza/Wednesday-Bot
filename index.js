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
var lastMemeSubReddit;
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
        message.channel.send('Pong!');
        break;
      case 'deleteAll':
        if (message.author.id != '525117809831837698') {
          message.reply('Only author this bot only allowed');
          return;
        }
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
        message.channel.send('This channel will get its_wednesday_my_dudes memes every wednesday. Horray :)');
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
            lastMemeSubReddit = subCommands[0];
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
            if (isNotIndex && subCommands.length < 2) {
              message.channel.send('Please add radio name');
              return;
            } 
            console.log(subCommands, isNotIndex);
            try {
              let success = false;
              if (isNotIndex) {
                dispatcher = connection.play(subCommands[0]).on('start', () => {
                  success = true;
                  lastPlayedRadio = subCommands[0];
                  console.log(`Stream at ${subCommands[0]} started`);
                  message.channel.send(`Stream at ${subCommands[0]} started`);
                });
              } else {
                dispatcher = connection.play(radioList[+subCommands[0] - 1].url).on('start', () => {
                  success = true;
                  lastPlayedRadio = radioList[+subCommands[0] - 1].url;
                  console.log(`Stream at ${radioList[+subCommands[0] - 1].url} started`);
                  message.channel.send(`Stream at ${radioList[+subCommands[0] - 1].url} started`);
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
                } else if (success && !isNotIndex) {
                  console.log('Success playing from existing radio list');
                } else {
                  console.error('Failed adding new radio URL');
                  dispatcher = connection.play(radioList[0].url).on('start', () => {
                    console.error(`Timeout: Play last played. Stream at ${lastPlayedRadio || radioList[0].url} started`);
                    message.channel.send(`Timeout: Play last played. Stream at ${lastPlayedRadio || radioList[0].url} started`);
                  });
                }
              }, 6 * 1000);
            } catch (error) {
              console.log('Failed adding new radio URL');
              dispatcher = connection.play(radioList[0].url).on('start', () => {
                lastPlayedRadio = radioList[0].url;
                console.error(`Failed: Play last played. Stream at ${radioList[0].url} started`);
              });
            }
          } else {
            dispatcher = connection.play(radioList[0].url).on('start', () => {
              lastPlayedRadio = radioList[0].url;
              console.log(`Stream at ${radioList[0].url} started`);
              message.channel.send(`Playing default. Stream at ${radioList[0].url} started`);
            });
          }
          intervalStream = setInterval(function () {
            if ( connection.channel.members.size < 2 ) {
              dispatcher.destroy();
              streamDestroyed = true;
            } else {
              if (streamDestroyed) {
                dispatcher = connection.play(lastPlayedRadio || radioList[0].url);
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
      case 'help':
      default:
        message.channel.send({
          "embed": {
            "title": "What's this bot?",
            "description": "Wednesday My Dudes 🐸 is simple bot for reminding you when wednesday is. Sometime we forget time without enjoying it, for that reason this bot add features for you enjoy it.",
            "color": 7506394,
            "fields": [
              {
                "name": "List Command",
                "value": "!allow [Allowing channel to get wednesday reminder]\n!open-radio [Open radio list]\n!play {radio list index} [Play radio from radio list at inputed index]\n!play {new radio url} {radio  name} [Radio name is mandatory. Play at custom url and saved to radio list for later]"
              }
            ],
            "image": {
              "url": "https://i.kym-cdn.com/photos/images/original/001/091/264/665.jpg"
            }
          }
        })
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
    service.getMeme(lastMemeSubReddit)
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
    service.getMeme(lastMemeSubReddit)
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