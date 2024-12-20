
const Discord = require("discord.js");

const init = async (Kanyon, message, args) => {
  try {
    let character = Jest.searchRandomCharacter({
      series: "JoJo's Bizarre Adventure: Stone Ocean",
    });

    if (!character) {
      return message.reply("Não há personagens disponíveis no momento.");
    }

    let Target = message.author;
    let characterImage = Jest.getCharacterImage(character.id);
    
    let EMBED = new Discord.EmbedBuilder()
      .setDescription(`**${character.name}**\n${character.series}`)
      .setImage(characterImage)
      .setFooter({ text: Target.tag, iconURL: Target.avatarURL() });

    let BUTTON_MARRY = new Discord.ButtonBuilder()
      .setCustomId(`${message.author.id}:marry`)
      .setLabel("💕")
      .setStyle(2);

    let ROW = new Discord.ActionRowBuilder().addComponents(BUTTON_MARRY);

    let msg = await message.reply({
      embeds: [EMBED],
      components: [ROW],
      allowedMentions: { repliedUser: false },
    });

    const collector = msg.createMessageComponentCollector({
      time: 60_000,
    });
    collector.on("collect", async (i) => {
      if (i.user.id === message.author.id) {
        const [_, type] = i.customId.split(":");

        console.log(Jest.registerCard())
        BUTTON_MARRY.setDisabled(true);
        msg.edit({
          allowedMentions: { repliedUser: false },
          components: [ROW],
        });
        i.deferUpdate();
      } else {
        await i.reply({
          content: `These buttons aren't for you!`,
          ephemeral: true,
        });
      }
    });

    collector.on("end", async (i) => {
      BUTTON_MARRY.setDisabled(true);
      msg.edit({
        allowedMentions: { repliedUser: false },
        components: [ROW],
      });
      return;
    });
  } catch (error) {
    console.error(error);
    await message.reply("Ocorreu um erro ao executar o comando.");
  }
};

module.exports = {
  pub: true,
  slashable: true,
  botPerms: ["EmbedLinks"],
  aliases: ["r"],
  name: "roll",
  perms: 3,
  init,
  cat: "cards",
};