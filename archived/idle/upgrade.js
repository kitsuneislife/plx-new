const Discord = require("discord.js");
const { set, ref, onValue } = require("@firebase/database");

const IdleUserModel = require("../../archetypes/IdleUserModel.js");

const init = async (Kanyon, message, args) => {
  try {
    const Target = message.author;
    let USERDATA = await qdb.get(`Users.${Target.id}`);
    let IDLEUSER = new IdleUserModel(USERDATA, Target);

    // Verificar se foi especificado um recurso para atualização
    const resource = args[0]?.toLowerCase(); // Supondo que o argumento 0 seja o recurso ("jade", "rubine", "sapphire", "storage")

    if (!resource || !["jade", "rubine", "sapphire", "storage"].includes(resource)) {
      return await message.reply("Você precisa especificar qual recurso deseja atualizar (`jade`, `rubine`, `sapphire` ou `storage`).");
    }

    // Verificar se o usuário tem tokens suficientes para a atualização
    const upgradePrice = resource === "storage" ? IDLEUSER.calcStorageUpgradePrice() : IDLEUSER.calcUpgradePrice(resource);
    if (IDLEUSER.tokens < upgradePrice) {
      return await message.reply(`Você não tem tokens suficientes para atualizar ${resource}. Custo: \`${upgradePrice}\` tokens.`);
    }

    // Realizar a atualização do recurso selecionado
    switch (resource) {
      case "jade":
        IDLEUSER.jadeIncomeLevel++;
        break;
      case "rubine":
        IDLEUSER.rubineIncomeLevel++;
        break;
      case "sapphire":
        IDLEUSER.sapphireIncomeLevel++;
        break;
      case "storage":
        IDLEUSER.storageLevel++;
        break;
    }

    // Deduzir o custo da atualização dos tokens do usuário
    IDLEUSER.tokens -= upgradePrice;

    // Salvar as mudanças no banco de dados
    await IDLEUSER.saveToDatabase();

    // Responder ao usuário com a confirmação da atualização
    let VIEW_EMBED = new Discord.EmbedBuilder()
      .setColor("#DD5383")
      .setTitle("Kanyon Idle - Atualização de Produção")
      .setDescription(`Você atualizou ${resource === "storage" ? "a capacidade de armazenamento" : "a produção de " + resource} para o nível ${resource === "storage" ? IDLEUSER.storageLevel : IDLEUSER[`${resource}IncomeLevel`]}.`)
      .addFields(
        {
          name: "Novo Saldo",
          value: `${_emoji("token_simplelarge")} **${miliarize(IDLEUSER.tokens.toFixed(2))}**`,
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
    await message.reply("Ocorreu um erro ao executar o comando.");
  }
};

module.exports = {
  pub: true,
  slashable: true,
  slashOptions: {
    options: [
      {
        name: "resource",
        description: "Escolha o recurso para atualização (jade, rubine, sapphire, storage)",
        type: 3,
        required: true,
        choices: [
          {
            name: "Jade",
            value: "jade",
          },
          {
            name: "Rubine",
            value: "rubine",
          },
          {
            name: "Sapphire",
            value: "sapphire",
          },
          {
            name: "Storage",
            value: "storage",
          },
        ],
      },
    ],
    guilds: ["789382326680551455"],
  },
  botPerms: ["EmbedLinks"],
  aliases: ["idleup"],
  name: "idleupgrade",
  perms: 3,
  init,
  cat: "idle",
};
