
const Discord = require("discord.js");
const Gal = require("../../structures/Galleries");

const init = async (Kanyon, message, args) => {
  try {
    const start = Date.now();
    const filepath = await Gal.randomOne("pong", true).catch(console.error);
    const stop = Date.now();
    const ack = Date.now() - message.createdTimestamp;

    //console.log(message.author.avatarURL())
    
    let LOADING_EMBED = new Discord.EmbedBuilder()
      .setColor(0x36393f)
      .setImage(filepath)
      .addFields(
        {
          name: "Ping",
          value: "---ms\n*\`Response Time\`*",
          inline: true
        },
        {
          name: "Pong",
          value: "---ms\n*\`Image Transport\`*",
          inline: true
        },
        {
          name: "Pong",
          value: "---ms\n*\`Discord Latency\`*",
          inline: true
        }, 
        {
          name: "Internal Services",
          value: "---",
          inline: true
        }
      );

    const msg = await message.reply({ embeds: [LOADING_EMBED] });
    const diff = (stop - start);

    const EMBED = new Discord.EmbedBuilder()
      .setColor(0x36393f)
      .setImage(filepath)
      .addFields(
        {
          name: "Ping",
          value: `${ack}ms\n*\`Response Time\`*`,
          inline: true
        },
        {
          name: "Pong",
          value: `${diff}ms\n*\`Image Transport\`*`,
          inline: true
        },
        {
          name: "Pong",
          value: `${Kanyon.ws.ping}ms\n*\`Discord Latency\`*`,
          inline: true
        }, 
        {
          name: "Internal Services",
          value: "---",
          inline: true
        }
      );

    await msg.edit({ embeds: [EMBED] });
    return null;
  } catch (error) {
    console.error(error);
    return message.reply("Ocorreu um erro ao executar o comando.");
  }
}

module.exports = {
  init,
  pub: true,
  name: "ping",
  perms: 3,
  cat: "infra",
  botPerms: ["EmbedLinks"],
  aliases: [],
}
