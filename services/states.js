module.exports = {
  findOne: async function (mongoClient, args) {
    console.log('Getting state');
    const {
      _id
    } = args;
    return new Promise((resolve, reject) => {
      mongoClient
        .db('wednesday')
        .collection('states')
        .findOne({
          _id
        })
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          console.error('Error @Services.States.FindOne:', error);
          reject(error);
        })
    })
  },
  insertOne: async function (mongoClient, args) {
    console.log('Setting state');
    const {
      newState
    } = args;
    return new Promise((resolve, reject) => {
      mongoClient
        .db('wednesday')
        .collection('states')
        .insertOne(newState)
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          console.error('Error @Services.States.InsertOne:', error);
          reject(error);
        })
    })
  }
}