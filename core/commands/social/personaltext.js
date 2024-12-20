const Discord = require("discord.js");
const { set, ref, onValue } = require("@firebase/database");
const $t = require("../../../appRoot/locales/pt-BR/bot_strings.json");

const rand$t = (array) => {
  if (!Array.isArray(array) || array.length === 0) return 'sexo';
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const init = async (Kanyon, message, args) => {
  try {
    const Target = message.author;
    const userData = await new Promise((resolve, reject) => {
      onValue(ref(Kanyon.database, `Users/${Target.id}`), (snapshot) => {
        resolve(snapshot.val());
      }, reject);
    });
    
    const persotxt = args.join(" ");
    userData.modules.persotext = persotxt;
    await set(ref(Kanyon.database, `Users/${Target.id}`), userData);

    const acknowledgedMessage = rand$t($t.responses.verbose.interjections.acknowledged);
    const persotexUpdateMessage = $t.responses.profile.persotexUpdate;

    const embed = new Discord.EmbedBuilder()
      .setDescription(`${_emoji("yep")}${acknowledgedMessage} ${persotexUpdateMessage.replace('{{pstext}}', `*\`\`\`css\n${persotxt}\`\`\`*`).replace('{{prefix}}', `\`${Kanyon.prefix}\``)}`);

    message.reply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    return message.reply("Ocorreu um erro ao executar o comando.");
  }
};

module.exports = {
  init,
  pub: true,
  name: "personaltext",
  argsRequired: true,
  perms: 3,
  cat: "social",
  botPerms: ["EMBED_LINKS"],
  aliases: ["ptxt"]
};
