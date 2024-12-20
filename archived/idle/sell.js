const Discord = require("discord.js");
const { set, ref, onValue } = require("@firebase/database");
const IdleUserModel = require("../../archetypes/IdleUserModel.js");

const init = async (Kanyon, message, args) => {
  try {
    const Target = message.author;
    let USERDATA = await qdb.get(`Users.${Target.id}`);
    let IDLEUSER = new IdleUserModel(USERDATA, Target);

    // Calcula o rendimento acumulado até o momento da venda
    await IDLEUSER.calculateAccumulatedIncome(message);

    const jadeUnits = parseFloat(IDLEUSER.resources.jade).toFixed(2);
    const rubineUnits = parseFloat(IDLEUSER.resources.rubine).toFixed(2);
    const sapphireUnits = parseFloat(IDLEUSER.resources.sapphire).toFixed(2);

    // Valores predefinidos para cada tipo de recurso
    const jadeValue = 10; // Valor de cada unidade de Jade em tokens
    const rubineValue = 25; // Valor de cada unidade de Rubine em tokens
    const sapphireValue = 60; // Valor de cada unidade de Sapphire em tokens

    // Calcula o valor total dos recursos vendidos
    const jadeSold = IDLEUSER.resources.jade * jadeValue;
    const rubineSold = IDLEUSER.resources.rubine * rubineValue;
    const sapphireSold = IDLEUSER.resources.sapphire * sapphireValue;
    const totalValue = jadeSold + rubineSold + sapphireSold;

    // Adiciona os tokens correspondentes à conta do usuário
    IDLEUSER.tokens += totalValue;

    // Calcula o total de unidades vendidas e a porcentagem da capacidade de armazenamento
    const totalUnits = parseFloat(jadeUnits) + parseFloat(rubineUnits) + parseFloat(sapphireUnits);
    const storageCapacity = IDLEUSER.calcStorage();
    const storagePercentage = ((totalUnits / storageCapacity) * 100).toFixed(2);

    // Salva as mudanças no banco de dados antes de zerar os recursos
    IDLEUSER.resources.jade = 0;
    IDLEUSER.resources.rubine = 0;
    IDLEUSER.resources.sapphire = 0;

    await IDLEUSER.saveToDatabase();

    // Responde ao usuário com os detalhes da venda
    let VIEW_EMBED = new Discord.EmbedBuilder()
      .setColor("#DD5383")
      .setTitle(`Você vendeu ${totalUnits.toFixed(2)} itens (${storagePercentage}%)`)
      .setDescription(`${_emoji('jade_simplelarge')} Jade x${jadeUnits} | **$${jadeSold.toFixed(2)}**
${_emoji('rubine_simplelarge')} Rubine x${rubineUnits} | **$${rubineSold.toFixed(2)}**
${_emoji('sapphire_simplelarge')} Sapphire x${sapphireUnits} | **$${sapphireSold.toFixed(2)}**\n
Total: **$${miliarize(totalValue.toFixed(2))}**
${_emoji("token_simplelarge")} **$${miliarize(IDLEUSER.tokens.toFixed(2))}**
`)
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
  },
  botPerms: ["EmbedLinks"],
  aliases: [],
  name: "idlesell",
  perms: 3,
  init,
  cat: "idle",
};
