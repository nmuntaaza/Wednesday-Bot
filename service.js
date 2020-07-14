const axios = require('axios').default;

const memeURL = 'https://meme-api.herokuapp.com/gimme/';

const getMeme = async function (subreddit, size) {
  let url = memeURL;
  url = subreddit ? url + subreddit + '/' : url;
  url = size ? url + size + '/' : url;
  console.log(`Getting meme with url ${url}`);
  return axios.get(url)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      throw error.response.data;
    });
}

module.exports = {
  getMeme
}