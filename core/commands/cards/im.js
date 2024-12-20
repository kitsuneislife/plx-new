const Discord = require("discord.js");

const init = async (Kanyon, message, args) => {
  try {
    let query = args.join(" ");
    let character = global.Jest.searchCharacter(query);

    if (!character) {
      return message.reply("Personagem não encontrado.");
    }

    let Target = message.author;
    let characterImage = global.Jest.getCharacterImage(character.id); 
    
    let EMBED = new Discord.EmbedBuilder()
      .setDescription(`**${character.name}**\n${character.series}`)
      .setImage(characterImage) 
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
  aliases: ["im"],
  name: "infomarry",
  perms: 3,
  init,
  cat: "cards",
};
