module.exports = {
  name: 'ping',
  description: 'Ping server',
  execute: async function ({
    client,
    connection,
    message,
    args
  }) {
    return new Promise((resolve, reject) => {
      message.channel.send('Pong!');
    })
  }
}