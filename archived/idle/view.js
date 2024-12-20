const Discord = require("discord.js");
const { set, ref, onValue } = require("@firebase/database");

const IdleUserModel = require("../../archetypes/IdleUserModel.js");
const IdleCalc = require("./subject/IdleCalc.js");

const init = async (Kanyon, message, args) => {
  try {
    const Target = message.author;
    let USERDATA = await qdb.get(`Users.${Target.id}`);
    let IDLEUSER = new IdleUserModel(USERDATA, Target);

    IDLEUSER.calculateAccumulatedIncome(message);

    let VIEW_EMBED = new Discord.EmbedBuilder()
      .setColor("#DD5383")
      .setTitle("Kanyon Idle")
      .setDescription(`${_emoji("token_simplelarge")} **$${miliarize(IDLEUSER.tokens)}**
:chart_with_upwards_trend: Multiplicador \`${IDLEUSER.globalMultiplier}x\`
      `)
      .addFields(
        {
          name: "Produção",
          value: `
            ${_emoji("jade_simplelarge")} Nível ${IDLEUSER.jadeIncomeLevel} \`${IDLEUSER.calcIncomePerMinute("jade")}/min\`
${_emoji("rubine_simplelarge")} Nível ${IDLEUSER.rubineIncomeLevel} \`${IDLEUSER.calcIncomePerMinute("rubine")}/min\`
${_emoji("sapphire_simplelarge")} Nível ${IDLEUSER.sapphireIncomeLevel} \`${IDLEUSER.calcIncomePerMinute("sapphire")}/min\`
            `,
          inline: true,
        },
        {
          name: "Capacidade",
          value: `
            :package: Nível ${IDLEUSER.storageLevel} \`${parseFloat(Object.values(IDLEUSER.resources).reduce((a, b) => a + b, 0)).toFixed(2)}/${IDLEUSER.calcStorage()}\`
            `,
          inline: true,
        },
        {
          name: "Melhorias",
          value: `
            ${IDLEUSER.tokens >= IDLEUSER.calcUpgradePrice("jade") ? _emoji("yep") : _emoji("nope")} ${_emoji("token_simplelarge")} ${miliarize(IDLEUSER.calcUpgradePrice("jade"))} \`${IDLEUSER.jadeIncomeLevel} -> ${IDLEUSER.jadeIncomeLevel + 1}\` \`Produção de Jades\`
${IDLEUSER.tokens >= IDLEUSER.calcUpgradePrice("rubine") ? _emoji("yep") : _emoji("nope")} ${_emoji("token_simplelarge")} ${miliarize(IDLEUSER.calcUpgradePrice("rubine"))} \`${IDLEUSER.rubineIncomeLevel} -> ${IDLEUSER.rubineIncomeLevel + 1}\` \`Produção de Rubines\`
${IDLEUSER.tokens >= IDLEUSER.calcUpgradePrice("sapphire") ? _emoji("yep") : _emoji("nope")} ${_emoji("token_simplelarge")} ${miliarize(IDLEUSER.calcUpgradePrice("sapphire"))} \`${IDLEUSER.sapphireIncomeLevel} -> ${IDLEUSER.sapphireIncomeLevel + 1}\` \`Produção de Sapphires\`
${IDLEUSER.tokens >= IDLEUSER.calcStorageUpgradePrice() ? _emoji("yep") : _emoji("nope")} ${_emoji("token_simplelarge")} ${miliarize(IDLEUSER.calcStorageUpgradePrice())} \`${IDLEUSER.storageLevel} -> ${IDLEUSER.storageLevel + 1}\` \`Capacidade\`
            `,
          inline: false,
        },
      )
      .setFooter({ text: Target.tag, iconURL: Target.displayAvatarURL() });

    message.reply({
      embeds: [VIEW_EMBED],
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
  name: "idleview",
  perms: 3,
  init,
  cat: "idle",
};
