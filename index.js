require('dotenv').config();

const service = require('./service');
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

var radioList = [{
  "url": "http://ice-the.musicradio.com:80/LBC973MP3Low",
  "name": "LBC",
  "genre": "",
  "lang": "EN"
}, {
  "url": "http://media-ice.musicradio.com/SmoothLondonMP3",
  "name": "Smooth Radio",
  "genre": "70s and 80s",
  "lang": "EN"
}, {
  "url": "http://bbcmedia.ic.llnwd.net/stream/bbcmedia_radio2_mf_p",
  "name": "BBC Radio 2",
  "genre": "Adult",
  "lang": "EN"
}, {
  "url": "http://bbcmedia.ic.llnwd.net/stream/bbcmedia_6music_mf_p",
  "name": "BBC Radio 6 Music",
  "genre": "Adult",
  "lang": "EN"
}, {
  "url": "http://starradio.nsdsl.net/128K",
  "name": "Star Cambridge",
  "genre": "Adult contemporary",
  "lang": "EN"
}, {
  "url": "http://gbradio.cdn.tibus.net/SWASS",
  "name": "Swansea Sound",
  "genre": "Adult contemporary",
  "lang": "EN"
}, {
  "url": "http://icy-e-04.sharp-stream.com/tcnation.mp3",
  "name": "Nation Radio Cardiff",
  "genre": "Alternative rock",
  "lang": "EN"
}, {
  "url": "http://relay.181.fm:8016",
  "name": "181.FM - The FrontPorch",
  "genre": "Bluegrass",
  "lang": "EN"
}, {
  "url": "http://soho.wavestreamer.com:4845/stream/1/",
  "name": "Classic Hits UK",
  "genre": "Classic hits",
  "lang": "EN"
}, {
  "url": "http://78.129.202.200:8000/;",
  "name": "Radio Caroline",
  "genre": "Classic hits",
  "lang": "EN"
}, {
  "url": "http://ice-the.musicradio.com:80/RealXSManchesterMP3",
  "name": "Real Radio XS Manchester",
  "genre": "Classic rock",
  "lang": "EN"
}, {
  "url": "http://bbcmedia.ic.llnwd.net/stream/bbcmedia_radio3_mf_p",
  "name": "BBC Radio 3",
  "genre": "Classical",
  "lang": "EN"
}, {
  "url": "http://relay.181.fm:8018",
  "name": "181.FM - Highway 181",
  "genre": "Country",
  "lang": "EN"
}, {
  "url": "https://radio.bigrig.fm/",
  "name": "BigRig FM",
  "genre": "Country",
  "lang": "EN"
}, {
  "url": "http://205.164.62.22:7800",
  "name": "1.FM - Absolutely Country Hits",
  "genre": "Country",
  "lang": "EN"
}, {
  "url": "http://205.164.62.22:7806",
  "name": "1.FM - Classic Country",
  "genre": "Country",
  "lang": "EN"
}, {
  "url": "http://strm112.1.fm/country_mobile_mp3",
  "name": "1.FM - Country One",
  "genre": "Country",
  "lang": "EN"
}, {
  "url": "http://relay.181.fm:8050",
  "name": "181.FM - 90's Country",
  "genre": "Country",
  "lang": "EN"
}, {
  "url": "http://relay.181.fm:8130",
  "name": "181.FM - Kickin' Country",
  "genre": "Country",
  "lang": "EN"
}, {
  "url": "http://relay.181.fm:8034",
  "name": "181.FM - Real Country",
  "genre": "Country",
  "lang": "EN"
}, {
  "url": "http://s36.myradiostream.com:13028/;listen.mp3",
  "name": "House Heads UK",
  "genre": "House",
  "lang": "EN"
}, {
  "url": "http://bbcmedia.ic.llnwd.net/stream/bbcmedia_radio4fm_mf_p",
  "name": "BBC Radio 4",
  "genre": "News",
  "lang": "EN"
}, {
  "url": "http://bbcmedia.ic.llnwd.net/stream/bbcmedia_radio5live_mf_p",
  "name": "BBC Radio 5 Live",
  "genre": "News",
  "lang": "EN"
}, {
  "url": "http://stream8.considerit.co.uk/kingdomfm128.mp3",
  "name": "Kingdom FM",
  "genre": "Oldies",
  "lang": "EN"
}, {
  "url": "http://feed.felixstoweradio.co.uk:8000/FXR",
  "name": "Felixstowe Radio",
  "genre": "Pop",
  "lang": "EN"
}, {
  "url": "https://19993.live.streamtheworld.com/JACK_FM.mp3",
  "name": "Jack FM Oxford",
  "genre": "Pop",
  "lang": "EN"
}, {
  "url": "http://5.20.223.18/crf128.mp3",
  "name": "Rock FM",
  "genre": "Rock",
  "lang": "EN"
}, {
  "url": "http://radio.canstream.co.uk:8075/live.mp3",
  "name": "Jazz London Radio",
  "genre": "Rock",
  "lang": "EN"
}, {
  "url": "http://24-7nicheradio.com:8130/stream",
  "name": "24-7 Rock 'N' Roll",
  "genre": "Rock",
  "lang": "EN"
}, {
  "url": "http://ice-sov.musicradio.com/ArrowMP3",
  "name": "The Arrow",
  "genre": "Rock",
  "lang": "EN"
}, {
  "url": "http://albireo.shoutca.st:9937/stream",
  "name": "Happenstance Radio",
  "genre": "Rock",
  "lang": "EN"
}, {
  "url": "http://uk1.internet-radio.com:8294/stream",
  "name": "Radio Bloodstream",
  "genre": "Rock",
  "lang": "EN"
}, {
  "url": "https://radio.truckers.fm/",
  "name": "TruckersFM",
  "genre": "Sim radio",
  "lang": "EN"
}, {
  "url": "http://stream.simulatorradio.com:8002/stream.mp3",
  "name": "Simulator Radio",
  "genre": "Sim radio",
  "lang": "EN"
}, {
  "url": "http://radio.trucksim.fm:8000/stream",
  "name": "TruckSimFM",
  "genre": "Sim radio",
  "lang": "EN"
}, {
  "url": "http://bbcmedia.ic.llnwd.net/stream/bbcmedia_radio1_mf_p",
  "name": "BBC Radio 1",
  "genre": "Top 40",
  "lang": "EN"
}]

var AllowedChannel = [];
var connection;
var dispatcher;
var streamDestroyed;
var intervalStream;
var lastMemeSubReddit;
var lastPlayedRadio = radioList[21];
var defaultRadio = radioList[21];
var maxPageList = 10;
var radioPagination;

client.on('ready', () => {
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
  let msgEmbed;
  if (message.content.startsWith(PREFIX)) {
    switch (command) {
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
              msgEmbed = await message.channel.send(attachment);
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
                  message.channel.send(`Stream at ${subCommands[1] || subCommands[0]} started`);
                });
              } else {
                dispatcher = connection.play(radioList[+subCommands[0] - 1].url).on('start', () => {
                  success = true;
                  lastPlayedRadio = radioList[+subCommands[0] - 1];
                  console.log(`Stream at ${radioList[+subCommands[0] - 1].url} started`);
                  message.channel.send(`Stream at ${radioList[+subCommands[0] - 1].name} started`);
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
                  dispatcher = connection.play(defaultRadio.url).on('start', () => {
                    console.log(`Timeout: Play default. Stream at ${defaultRadio.url} started`);
                    message.channel.send(`Timeout: Play default. Stream at ${defaultRadio.name} started`);
                  });
                }
              }, RADIO_PLAY_TIMEOUT * 1000);
            } catch (error) {
              console.log('Failed adding new radio URL');
              dispatcher = connection.play(defaultRadio.url).on('start', () => {
                console.log(`Failed: Play default. Stream at ${defaultRadio.url} started`);
                message.channel.send(`Failed: Play default. Stream at ${defaultRadio.name} started`);
              });
            }
          } else {
            dispatcher = connection.play(radioList[0].url).on('start', () => {
              lastPlayedRadio = defaultRadio;
              console.log(`Playing default. Stream at ${defaultRadio.url} started`);
              message.channel.send(`Playing default. Stream at ${defaultRadio.name} started`);
            });
          }
          intervalStream = setInterval(function () {
            if (connection.channel.members.size < 2) {
              dispatcher.destroy();
              streamDestroyed = true;
            } else {
              if (streamDestroyed) {
                dispatcher = connection.play(lastPlayedRadio || defaultRadio);
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
      case 'radio':
        radioPagination = 1;
        let text = '';
        for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
          if (i >= radioList.length) break;
          text += `${i + 1}) ${radioList[i].name} | ${radioList[i].genre} | ${radioList[i].lang} ${radioList[i].name == lastPlayedRadio.name ? '**PLAYING NOW 🎵**' : ''}\n`;
        }
        embedMsg = new MessageEmbed().setDescription(text.trim());
        msgEmbed = await message.channel.send(embedMsg);
        if (radioPagination != 1) await msgEmbed.react('⬆️');
        if (radioPagination != Math.ceil(radioList.length / maxPageList)) await msgEmbed.react('⬇️');
        break;
      case 'help':
      default:
        message.channel.send({
          "embed": {
            "title": "What's this bot?",
            "description": "Wednesday My Dudes 🐸 is simple bot for reminding you when wednesday is. Sometime we forget time without enjoying it, for that reason this bot add features for you enjoy it.",
            "color": 7506394,
            "fields": [{
              "name": "List Command",
              "value": "!allow [Allowing channel to get wednesday reminder]\n!radio [Open radio list]\n!play {radio list index} [Play radio from radio list at inputed index]\n!play {new radio url} {radio  name} [Radio name is mandatory. Play at custom url and saved to radio list for later]"
            }],
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

  if (reaction.emoji.name == '🔄') {
    service.getMeme(lastMemeSubReddit)
      .then(async memes => {
        if (!memes.nfsw) {
          const attachment = new MessageAttachment(memes.url);
          const msgEmbed = await reaction.message.channel.send(attachment);
          await msgEmbed.react("🔄");
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
      text += `${i + 1}) ${radioList[i].name} | ${radioList[i].genre} | ${radioList[i].lang} ${radioList[i].name == lastPlayedRadio.name ? '**PLAYING NOW 🎵**' : ''}\n`;
    }
    const embedMsg = new MessageEmbed().setDescription(text.trim());
    const msgEmbed = await reaction.message.edit(embedMsg);
    if (radioPagination != 1) {
      await msgEmbed.react('⬆️');
    } else {
      await reaction.message.reactions.cache.get('⬆️').remove().catch(error => {
        console.error('Error');
      });
    }
    if (radioPagination != Math.ceil(radioList.length / maxPageList)) {
      await msgEmbed.react('⬇️');
    } else {
      await reaction.message.reactions.cache.get('⬇️').remove().catch(error => {
        console.error('Error');
      });
    }
  }

  if (reaction.emoji.name == '⬆️') {
    radioPagination = radioPagination == 1 ? radioPagination : radioPagination - 1;
    let text = '';
    for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
      if (i >= radioList.length) break;
      text += `${i + 1}) ${radioList[i].name} | ${radioList[i].genre} | ${radioList[i].lang} ${radioList[i].name == lastPlayedRadio.name ? '**PLAYING NOW 🎵**' : ''}\n`;
    }
    const embedMsg = new MessageEmbed().setDescription(text.trim());
    const msgEmbed = await reaction.message.edit(embedMsg);
    if (radioPagination != 1) {
      await msgEmbed.react('⬆️');
    } else {
      await reaction.message.reactions.cache.get('⬆️').remove().catch(error => {
        console.error('Error');
      });
    }
    if (radioPagination != Math.ceil(radioList.length / maxPageList)) {
      await msgEmbed.react('⬇️');
    } else {
      await reaction.message.reactions.cache.get('⬇️').remove().catch(error => {
        console.error('Error');
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

  if (reaction.emoji.name == '⬇️') {
    radioPagination++;
    let text = '';
    for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
      if (i >= radioList.length) break;
      text += `${i + 1}) ${radioList[i].name} | ${radioList[i].genre} | ${radioList[i].lang} ${radioList[i].name == lastPlayedRadio.name ? '**PLAYING NOW 🎵**' : ''}\n`;
    }
    const embedMsg = new MessageEmbed().setDescription(text.trim());
    const msgEmbed = await reaction.message.edit(embedMsg);
    if (radioPagination != 1) {
      await msgEmbed.react('⬆️');
    } else {
      reaction.message.reactions.cache.get('⬆️').remove().catch(error => {
        console.error('Error');
      });
    }
    if (radioPagination != Math.ceil(radioList.length / maxPageList)) {
      await msgEmbed.react('⬇️');
    } else {
      reaction.message.reactions.cache.get('⬇️').remove().catch(error => {
        console.error('Error');
      });
    }
  }

  if (reaction.emoji.name == '⬆️') {
    radioPagination--;
    let text = '';
    for (let i = (radioPagination - 1) * maxPageList; i < (radioPagination) * maxPageList; i++) {
      if (i >= radioList.length) break;
      text += `${i + 1}) ${radioList[i].name} | ${radioList[i].genre} | ${radioList[i].lang} ${radioList[i].name == lastPlayedRadio.name ? '**PLAYING NOW 🎵**' : ''}\n`;
    }
    const embedMsg = new MessageEmbed().setDescription(text.trim());
    const msgEmbed = await reaction.message.edit(embedMsg);
    if (radioPagination != 1) {
      await msgEmbed.react('⬆️');
    } else {
      reaction.message.reactions.cache.get('⬆️').remove().catch(error => {
        console.error('Error');
      });
    }
    if (radioPagination != Math.ceil(radioList.length / maxPageList)) {
      await msgEmbed.react('⬇️');
    } else {
      reaction.message.reactions.cache.get('⬇️').remove().catch(error => {
        console.error('Error');
      });
    }
  }
})

client.login(TOKEN);