module.exports = {
  name: 'timeout',
  description: 'Set radio connection timeout',
  execute: async function ({
    client,
    connection,
    message,
    args
  }) {
    return new Promise((resolve, reject) => {
      if (Number.isNaN(Number(args.timeout))) {
        reject(new Error('Time must be in number type'));
      }
      resolve({
        timeout: args.timeout
      });
    });
  }
}