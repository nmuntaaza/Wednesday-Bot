module.exports = {
  find: async function (mongoClient) {
    console.log('Getting radio');
    return new Promise((resolve, reject) => {
      mongoClient
        .db('wednesday')
        .collection('radio')
        .find()
        .toArray()
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          console.error('Error @Services.Radio.Find:', error);
          reject(error);
        })
    })
  },
  count: async function (mongoClient) {
    console.log('Counting radio');
    return new Promise((resolve, reject) => {
      mongoClient
        .db('wednesday')
        .collection('radio')
        .find({}, {
          _id: 0,
          name: 1
        })
        .count()
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          console.error('Error @Services.Radio.Count:', error);
          reject(error);
        })
    })
  },
  insert: async function (mongoClient, args) {
    console.log('Insert user radio');
    const { radio } = args;
    return new Promise((resolve, reject) => {
      mongoClient
        .db('wednesday')
        .collection('user_radio')
        .insertOne(radio)
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          console.error('Error @Services.Radio.Insert:', error);
          reject(error);
        })
    })
  }
}