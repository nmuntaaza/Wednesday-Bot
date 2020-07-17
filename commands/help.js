module.exports = {
  name: 'help',
  description: 'Show help attachment',
  execute: async function ({
    client,
    connection,
    message,
    args
  }) {
    return new Promise((resolve, reject) => {
      message.channel.send({
        "embed": {
          "title": "Wednesday",
          "description": "Is simple bot for you enjoy.",
          "color": 7506394,
          "fields": [{
            "name": "Features",
            "value": "**1.** Get memes from reddit.\n**2.** Listen to radio. You can add yours to!.\n**3.** Listen to podcast (i hope)."
          }, {
            "name": "List of command",
            "value": "**!radio** [open radio list]\n**!play {index}** [play radio from radio list at inputed index]\n**!play {url} {name}** [play custom radio and saved to radio list]\n**!timeout {time}** [change radio timeout time]"
          }]
        }
      });
    });
  }
}