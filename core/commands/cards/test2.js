const init = async (Kanyon, message, args) => {
  try {
    let Target = message.author


    let EMBED = new Discord.EmbedBuilder()
      .setDescription(`${_emoji("gradeSS_big")} **Jolyne Kujoh**\n*Edição de Colecionador*\n\n\`Dono   \` <@496270782679220234>\n\`Origem \` <@496270782679220234> \n\`Serial \` 1\n\`Cópias \` 200 `)
      .setThumbnail("https://mudae.net/uploads/4598851/xdxwwxL~RqMUg7J.png")
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
  name: "test2",
  perms: 3,
  init,
  cat: "cards",
};
