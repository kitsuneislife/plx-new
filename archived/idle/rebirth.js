const Discord = require("discord.js");
const IdleUserModel = require("../../archetypes/IdleUserModel.js");

const init = async (Kanyon, message, args) => {
  try {
    const Target = message.author;
    let USERDATA = await qdb.get(`Users.${Target.id}`);
    let IDLEUSER = new IdleUserModel(USERDATA, Target);

    const rebirthRequirement = 1000000;

    if (IDLEUSER.tokens < rebirthRequirement) {
      return await message.reply(`Você precisa de pelo menos **${miliarize(rebirthRequirement)}** tokens para realizar um renascimento.`);
    }

    const excessTokens = IDLEUSER.tokens - rebirthRequirement;
    const additionalMultiplier = Math.sqrt(excessTokens / 100000);
    IDLEUSER.globalMultiplier += additionalMultiplier;

    IDLEUSER.rebirthCount++;

    IDLEUSER.tokens = 0;
    IDLEUSER.jadeIncomeLevel = 1;
    IDLEUSER.rubineIncomeLevel = 1;
    IDLEUSER.sapphireIncomeLevel = 1;
    IDLEUSER.storageLevel = 1;
    IDLEUSER.resources = {
      jade: 0,
      rubine: 0,
      sapphire: 0,
    };

    await IDLEUSER.saveToDatabase();

    let VIEW_EMBED = new Discord.EmbedBuilder()
      .setColor("#DD5383")
      .setTitle("Kanyon Idle - Renascimento")
      .setDescription(`Você realizou um renascimento! Seu multiplicador de produção agora é \`${IDLEUSER.globalMultiplier.toFixed(2)}x\`.`)
      .addFields(
        {
          name: "Renascimentos",
          value: `${IDLEUSER.rebirthCount}`,
          inline: false,
        },
        {
          name: "Novo Multiplicador",
          value: `${_emoji("token_simplelarge")} \`${IDLEUSER.globalMultiplier.toFixed(2)}x\``,
          inline: false,
        }
      )
      .setFooter({ text: Target.tag, iconURL: Target.displayAvatarURL() });

    message.reply({
      embeds: [VIEW_EMBED],
      allowedMentions: { repliedUser: false },
    });
  } catch (error) {
    console.error(error);
    await message.reply("Ocorreu um erro ao tentar realizar o renascimento.");
  }
};

module.exports = {
  pub: true,
  slashable: true,
  slashOptions: {
    options: [],
    guilds: ["789382326680551455"],
  },
  botPerms: ["EmbedLinks"],
  aliases: ["idlerb"],
  name: "idlerebirth",
  perms: 3,
  init,
  cat: "idle",
};
