const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://wednesday-bot:pass@cluster0-abi6u.gcp.mongodb.net/wednesday?retryWrites=true&w=majority";

module.exports = {
  connect: async function () {
    return new Promise(async (resolve, reject) => {
      new MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(client => {
          resolve(client);
        })
        .catch(error => {
          reject(error);
        })
    })
  }
}