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
      let handlerTimeout;
      let success = false;
      const radioURL = args.newRadio ? args.radio[0] : args.radio.url;
      const radioName = args.newRadio ? args.radio[1] : args.radio.name;
      const broadcast = client.voice.createBroadcast();
      const dispatcher = broadcast.play(radioURL);

      const connectionHandler = () => {
        if (success && args.newRadio) {
          const radio = {
            url: args.radio[0] || '',
            name: args.radio[1] ? titleCase(args.radio[1]) : '',
            genre: args.radio[2] || '',
            lang: args.radio[3] || '',
          }
          resolve({
            radio,
            dispatcher,
            currentPlayed: radioName
          });
        } else if (success) {
          console.log('Success playing from existing radio list');
          resolve({
            dispatcher,
            currentPlayed: radioName
          })
        } else {
          message.edit('Timeout. Extend the timeout or try again');
          reject('Timeout. Play other or try again');
        }
      }

      connection.play(broadcast, {
          highWaterMark: 50
        })
        .on('start', () => {
          success = true;
          clearTimeout(handlerTimeout);
          connectionHandler();
          console.log(`Stream at ${radioURL} started`);
          message.edit(`Connected. Stream at ${radioName} started`);
        })
        .on('error', error => {
          message.edit('Failed. Play other');
          reject(error);
        })

      handlerTimeout = setTimeout(connectionHandler, args.timeout * 1000);
    });
  }
}