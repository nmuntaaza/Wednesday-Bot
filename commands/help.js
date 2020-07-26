module.exports = {
  name: 'help',
  description: 'Show help attachment',
  execute: async function ({
    client,
    connection,
    message,
    args
  }) {
    return new Promise((resolve) => {
      message.author.send({
          "embed": {
            "title": "Wednesday Bot",
            "description": "Is simple bot for you enjoy.",
            "color": 3092790,
            "fields": [{
                "name": "Features",
                "value": "**1.** Get memes from reddit.\n**2.** Listen to radio. You can add yours to!.\n**3.** Listen to podcast (i hope)."
              },
              {
                "name": "List of command",
                "value": "**!meme {sub reddit}** [get meme from reddit]\n**!radio** [open radio list]\n**!play {index}** [play radio from radio list at inputed index]\n**!play {url} {name}** [play custom radio and saved to radio list]\n**!timeout {time}** [change radio timeout time]"
              },
              {
                "name": "Contribution",
                "value": "This bot is an opensource bot, so you can help this bot to have more feature or improve the performance. Feel free to create a pull request.\n--\n[Github](https://github.com/nmuntaaza/Wednesday-Bot)"
              }
            ]
          }
        })
        .then(m => {
          resolve({
            message: `Sent help to ${message.author.username}-${message.author.id}`
          });
        })
        .catch(error => {
          console.error('Error @Commads.Help.Execute():', error);
        })
    });
  }
}