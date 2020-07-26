const MongoClient = require('mongodb').MongoClient;

module.exports = {
  connect: async function (connectionString) {
    return new Promise(async (resolve, reject) => {
      new MongoClient.connect(connectionString, { useUnifiedTopology: true })
        .then(client => {
          resolve(client);
        })
        .catch(error => {
          reject(error);
        })
    })
  }
}