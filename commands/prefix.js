module.exports = {
  name: 'prefix',
  description: 'Change bot prefix',
  execute: async function ({
    client,
    connection,
    message,
    args
  }) {
    return new Promise((resolve, reject) => {
      try {
        let newState = args.currentState;
        newState.prefix = args.newPrefix;
        resolve({
          newState
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}