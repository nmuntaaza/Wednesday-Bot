const EventEmitter = require('events');
const radioService = require('../services/radio');

function titleCase(str) {
  return str.split(' ').map(s => s[0].toUpperCase() + s.slice(1))[0];
}

module.exports = {
  name: 'play',
  description: 'Playing radio',
  execute: async function ({
    client,
    connection,
    message,
    args
  }) {
    return new Promise((resolve, reject) => {
      const connectionEventEmitter = new EventEmitter();

      connectionEventEmitter.on('success', () => {
        if (args.newRadio) {
          const radio = {
            guildId: message.guild.id,
            url: args.radio[0] || '',
            name: args.radio[1] ? titleCase(args.radio[1]) : '',
            genre: args.radio[2] || '',
            lang: args.radio[3] || '',
          }
          resolve({
            radio,
            dispatcher,
            currentPlayed: radioName,
            message: `Success playing ${radioName}-${radioURL} @${message.guild.name}-${message.guild.id}`
          });
        } else {
          resolve({
            dispatcher,
            currentPlayed: radioName,
            message: `Success playing ${radioName} from existing radio list`
          })
        }
      });

      connectionEventEmitter.on('timeout', () => {
        console.error('Error @Commands.Play.Execute():', `Timeout when trying to connect to ${radioName}-${radioURL}`);
        console.error('Args:', args);
        message.edit('Timeout. Extend the timeout or try again');
      })

      let handlerTimeout;
      let success = false;
      const radioURL = args.newRadio ? args.radio[0] : args.radio.url;
      const radioName = args.newRadio ? args.radio[1] : args.radio.name;
      const broadcast = client.voice.createBroadcast();
      const dispatcher = broadcast.play(radioURL);

      connection.play(broadcast, {
          highWaterMark: 50
        })
        .on('start', () => {
          clearTimeout(handlerTimeout);
          connectionEventEmitter.emit('success');
          console.log(`Stream at ${radioURL} started`);
          message.edit(`Connected. Stream at ${radioName} started`);
        })
        .on('error', error => {
          console.error('Error @Commands.Play.Execute().Play():', error);
          console.error('Args:', args);
          message.edit('Failed. Play other');
        })

      handlerTimeout = setTimeout(() => { connectionEventEmitter.emit('timeout'); }, args.timeout * 1000);
    });
  }
}