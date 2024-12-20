
const Discord = require("discord.js");
const { set, ref, onValue } = require("@firebase/database");
const lootbox = require('./lootbox.js')

const init = async (Kanyon, message, args) => {
  try {
    const Target = message.author;

    if(args[0].toLowerCase() == "box" && ["C", "U", "R", "SR", "UR"].includes(args[1].toUpperCase())) return lootbox.open(message, args[1].toUpperCase(), message.author.id)

    let content;
    let EMBED = new Discord.EmbedBuilder()
      .setDescription(`
                      **\\ℹ  -  Opcões disponíveis parar \`${Kanyon.prefix}open\`:**

                     *\`${Kanyon.prefix}open \u200b\`*\u200b**\`booster [name]\`** = Boosterpacks
                     *\`${Kanyon.prefix}open \u200b\`*\u200b**\`box [tier]\`** \t = Lootboxes
                     \u200b`)

    if(args[0]) content = $t.responses.warnings.open1;
    else content = $t.responses.warnings.open2;

    await message.reply({
      content,
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
  slashOptions: {
    options: [
      {
        name: "private",
        description: "Show this only to yourself",
        type: 5,
        required: false,
      },
    ],
    guilds: ["789382326680551455"],
    //global: true,
  },
  botPerms: ["EmbedLinks"],
  aliases: [],
  name: "open",
  perms: 3,
  init,
  cat: "economy",
};
