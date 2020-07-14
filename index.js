const service = require('./service');
const { Client, MessageAttachment, Message } = require('discord.js');
const client = new Client();

const TOKEN = 'NzMxMDE0NDIxMDk0MzM0NDk3.Xwf41w.Nnvt6BaSzxsF13JZwUoMNkANQW8';
let AllowedChannel = [];

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

client.on('message', message => {
  const prefixMessage = message.content.slice(0, 1);
  const [command, ...subCommands] = message.content.slice(1).split(' ');
  let channelId;
  if (prefixMessage == '!') {
    switch(command) {
      case 'ping':
        message.reply('Pong!');
        break;
      case 'deleteAll':
        message.channel.messages.fetch().then(msgs => {
          message.channel.bulkDelete(msgs.filter(m => m.author.username == 'itswednesdaymydudes'))
        });
        break;
      case 'allowChannel':
        channelId = message.channel.id;
        if (AllowedChannel.findIndex(chId => chId == channelId) != -1) {
          message.channel.send('This channel already allowed');
          break;    
        }
        AllowedChannel.push(message.channel.id);
        message.channel.send('This channel will get memes. Horray :)');
        break;
      case 'disallowChannel':
        channelId = message.channel.id;
        const channelIndex = AllowedChannel.findIndex(chId => chId == channelId)
        if (channelIndex == -1) {
          message.channel.send('This isn\'t allowed to begin with.');
          break;
        }
        AllowedChannel = AllowedChannel.filter((chId, i) => i != channelIndex);
        message.channel.send('This channel now lost it\'s awesomeness. :(');
        break;
      case 'meme':
        service.getMeme(subCommands[0])
          .then(memes => {
            if (!memes.nfsw) {
              const attachment = new MessageAttachment(memes.url);
              message.channel.send(attachment);
            } else {
              console.log('Getting NFSW meme. Not handled yet');
            }
          })
          .catch(error => {
            console.error(error);
            message.channel.send(error.message);
          })
        break;
    }
  } else if (message.content.toLowerCase().includes('dude')) {
    const attachment = new MessageAttachment('https://i.imgflip.com/47t4x7.jpg');
    message.channel.send(attachment);
  }
});

client.login(TOKEN);