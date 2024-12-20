const Discord = require("discord.js");

const init = async (Kanyon, message, args) => {
  try {
    let query = args.join(" ");
    let series = global.Jest.searchSeries(query);

    if (!series) {
      return message.reply("Série não encontrada.");
    }

    let Target = message.author;
    let EMBED = new Discord.EmbedBuilder()
      .setTitle(series.name)
      .setDescription(series.characters.map((char) => char.name).join("\n"))
      .setThumbnail(series.logo)
      .setFooter({ text: Target.tag, iconURL: Target.avatarURL() });

    message.reply({
      embeds: [EMBED],
      allowedMentions: { repliedUser: false },
    });
  } catch (error) {
    console.error(error);
    await message.reply("Ocorreu um erro ao executar o comando.");
  }
};

module.exports = {
  pub: true,
  slashable: true,
  botPerms: ["EMBED_LINKS"],
  aliases: ["ima"],
  name: "infomarrya",
  perms: 3,
  init,
  cat: "cards",
};
