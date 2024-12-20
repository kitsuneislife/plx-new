
const clc = require('cli-color');
global.Discord = require('discord.js');
const { createClient } = require('redis')

const Gearbox = require("./core/utilities/Gearbox/index.js");
const Queue = require('./database/queue.js')

//const { QuickDB } = require("quick.db");

//global.qdb = new QuickDB();
//global.Jest = {}
//require("./core/commands/cards/jest/Jest.js").initialize();

//global
global.$t = require('./appRoot/locales/pt-BR/bot_strings.json')
global.$t.items = require('./appRoot/locales/pt-BR/items.json')
global.$t.games = require('./appRoot/locales/pt-BR/games.json')
global.$t.ts = require('./appRoot/locales/pt-BR/translation.json')
global.rand$t = (array) => {
  if (!Array.isArray(array) || array.length === 0) return 'sexo';
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

global.Kanyon = new Discord.Client({ intents: [
  Discord.GatewayIntentBits.Guilds,
  Discord.GatewayIntentBits.GuildMembers,
  Discord.GatewayIntentBits.GuildModeration,
  Discord.GatewayIntentBits.GuildEmojisAndStickers,
  Discord.GatewayIntentBits.GuildIntegrations,
  Discord.GatewayIntentBits.GuildWebhooks,
  Discord.GatewayIntentBits.GuildInvites,
  Discord.GatewayIntentBits.GuildVoiceStates,
  Discord.GatewayIntentBits.GuildPresences,
  Discord.GatewayIntentBits.GuildMessages, 
  Discord.GatewayIntentBits.GuildMessageReactions, 
  Discord.GatewayIntentBits.GuildMessageTyping,
  Discord.GatewayIntentBits.DirectMessages,
  Discord.GatewayIntentBits.DirectMessageReactions,
  Discord.GatewayIntentBits.DirectMessageTyping,
  Discord.GatewayIntentBits.MessageContent,
  Discord.GatewayIntentBits.GuildScheduledEvents,
  Discord.GatewayIntentBits.AutoModerationConfiguration,
  Discord.GatewayIntentBits.AutoModerationExecution
] });

Kanyon.commands                  = new Discord.Collection();
Kanyon.aliases                   = new Discord.Collection();
Kanyon.database                  = require('./database/index.js').database;
Kanyon.firestore                 = require('./database/index.js').firestore;

Kanyon.database.queue            = new Queue();
Kanyon.firestore.queue           = new Queue();

Kanyon.prefix                    = ">";
(async () => {
  Kanyon.redis = createClient({ port: 80 });
  Kanyon.redis.on('error', err => console.log('Redis Client Error', err));
  await Kanyon.redis.connect();
  console.log('Redis client connected successfully');
})();

Object.assign(global, Gearbox.Global);
Object.assign(Kanyon, Gearbox.Client);

require("@polestar/emoji-grimoire").initialize(Kanyon);
require("./utils/paths").run();
require(`./core/structures/CommandPreprocessor`)(Kanyon);
var cmds = [];

Kanyon.commands.filter(cmd => !['_botOwner'].includes(cmd.category)).each(cmd => cmds.push(cmd.name) && cmd.aliases && cmd.aliases.map(alias => cmds.push(alias)));

Kanyon.on("messageCreate", async message => {

  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  if (!message.guild) return;
    
  /*let prefix = await Kanyon.database.ref(`Configurações/${message.guild.id}/Dados/Prefixo`).once('value')
      prefix = prefix.val()*/
  let prefix;
  if (!prefix) prefix = '>';

  /*if (message.content.startsWith(`<@${Kanyon.user.id}>`) ||
    message.content.startsWith(`<@!${Kanyon.user.id}>`)) {

    let embed = new Discord.EmbedBuilder()
      .setDescription(`${emojis.seta2} Meu prefixo neste servidor é \`${prefix}\`\n${emojis.duvida} Digite \`${prefix}ajuda\` para visualizar meus comandos.\nMe adicione através do comando \`${prefix}convite\`\n\n${emojis.no_attach} Meu server de suporte: `)
      .setColor(parseInt(colors.purple, 16))

    message.reply({
      embeds: [embed]
    });
  }*/

  //console.log(message.content.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if (cmd == '/') return;

  if (cmd.length === 0) return;
  let command = cmdRun(cmd);

  if (!command) {

    /*let cmdy = await Kanyon.database.ref(`Configurações/${message.guild.id}/Comandos-Personalizados/${cmd}`)
      .once('value');
    let cmdx = cmdy.val();*/
    let cmdx;

    if (cmdx) {

      let cmdbed = new Discord.MessageEmbed()
        .setDescription(cmdx)
        .setColor("#ffc156")
        .setFooter("Comando personalizado")

      message.inlineReply(cmdbed);

    } else if (!cmdx) {

      let rcmd = relativeCommand(cmd);

      let RELATIVE_COMMAND_EMBED = new Discord.EmbedBuilder()
        .setDescription(`Você quis dizer ${rcmd}?`)
        .setColor("#ffc156")

      if(rcmd === "drop") return;
      return message.reply({ embeds: [RELATIVE_COMMAND_EMBED] }).then(msg => {
        let reaction = "✅";
        msg.react(reaction);

        let collector = msg.createReactionCollector((r, u) => r.emoji.id == reaction && u.id == message.author.id, { max: 1 });

        collector.on("collect", (r, u) => {
          if(r.emoji.name != reaction) return;
          if(u.id != message.author.id) return;
          cmdRun(rcmd);
          collector.stop();
        });
      });
    }  
  }

  function cmdRun(cmdName) {
    const db1 = require('lcdb')("Jsons/event");
    if (3600000 - (Date.now() - (db1.get(message.author.id) || 0)) <= 0) {
      if (message.guild.id != "733493162479452160") {
        db1.set(message.author.id, Date.now());
      }
    }
    let cmdExec = Kanyon.commands.get(cmdName) || Kanyon.commands.get(Kanyon.aliases.get(cmdName));
    if (cmdExec) {
      cmdExec.init(Kanyon, message, args, null, cmdExec);
      let db2 = require('lcdb')("Jsons/cmdsSort");
      db2.set(cmdExec.name, (db2.get(cmdExec.name) || 0) + 1);
      return true;
    } else return false;
  }
});

function relativeCommand(cmdName) {
  let abc = cmdName.split("").filter((a, b, c) => c.indexOf(a) == b)
  return cmds.map(cmdBot => {
    let xyz = cmdBot.split("").filter((a, b, c) => c.indexOf(a) == b);
    let sort = (2.0 * xyz.map(a => abc.filter(b => a == b)).filter(a => a.length).length) / (cmdName.length + cmdBot.length - 2);
    return {
      name: cmdBot,
      sort
    };
  }).sort((a, b) => b.sort - a.sort)[0].name;
}

Kanyon.on("ready", () => {
  console.log(clc.magenta("[Kanyon]"), "Online.")
});

Kanyon.login(process.env.token);