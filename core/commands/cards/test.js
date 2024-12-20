const init = async (Kanyon, message, args) => {
  try {
    let Target = message.author

    
    let EMBED = new Discord.EmbedBuilder()
      .setDescription(`${_emoji("gradeSS_big")} **Jolyne Kujoh**\nJoJo's Bizarre Adventure: Stone Ocean\n\n\`Amizade\` 💕 200\n\`Tier   \` ${_emoji("tierBronze")} Bronze\n\`Classe \` ★★★☆☆`)
      .setImage("https://mudae.net/uploads/4598851/xdxwwxL~RqMUg7J.png")
      .setFooter({ text: Target.tag, iconURL: Target.avatarURL() })

    

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
  botPerms: ["EmbedLinks"],
  aliases: [],
  name: "test",
  perms: 3,
  init,
  cat: "cards",
};
