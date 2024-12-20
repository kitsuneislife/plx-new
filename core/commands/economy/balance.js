const Discord = require("discord.js");
const { set, ref, onValue } = require("@firebase/database");

const $t = require("../../../appRoot/locales/pt-BR/bot_strings.json");
const rand$t = (array) => {
  if (!Array.isArray(array) || array.length === 0) return "sexo";
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

function findAudits(snapshot, userId, limit = 5) {
  const results = [];
  for (const item of Object.values(snapshot || {}).reverse()) {
    if (item.from === userId || item.to === userId) {
      results.push(item);
      if (results.length >= limit) {
        break;
      }
    }
  }
  return results;
}

const init = async (Kanyon, message, args) => {
  try {
    const Target = message.author;
    //const TARGETDATA = (await DB.users.get({ id: Target.id })) || (await DB.users.new(Target));
    let TARGETDATA = await Kanyon.databaseResolveUser(Target.id, Target);
    const AUDITS = await new Promise((resolve, reject) => {
      onValue(
        ref(Kanyon.database, `Kanyon/audits`),
        (snapshot) => {
          const data = snapshot.val();
          resolve(data);
        },
        { onlyOnce: true },
        (error) => {
          reject(error);
        },
      );
    });
    // Kanyon.databaseAddLootbox(Target.id, "lootbox_C_O", "C")
    // Kanyon.databaseAddLootbox(Target.id, "lootbox_U_O", "U")
    // Kanyon.databaseAddLootbox(Target.id, "lootbox_R_O", "R")
    // Kanyon.databaseAddLootbox(Target.id, "lootbox_SR_O", "SR")
    // Kanyon.databaseAddLootbox(Target.id, "lootbox_UR_O", "UR")

    async function lastTransBuild(x) {
      if (!x) return "";

      const POLid = Kanyon.user.id;
      const ts = `<t:${~~(x.timestamp / 1000)}:R>`;
      if (x.type === "SEND") x.type = "TRANSFER";
      if (x.to === POLid || x.to === "DASHBOARD") {
        return (
          `🔴 *${ts}*\u2002 ${_emoji(x.currency, x.currency)}\u2002×\u2002**${x.amt}**\n\u200b ` +
          `╰ |   *\`${x.type}\`*`
        );
      }
      if (x.from === POLid || x.from === "DASHBOARD") {
        return (
          `🟢 *${ts}*\u2002 ${_emoji(x.currency, x.currency)}\u2002×\u2002**${x.amt}**\n\u200b ` +
          `╰ |   *\`${x.type}\`*`
        );
      }

      if (x.from && x.to === TARGETDATA.id && x.from !== POLid) {
        const othPart = (await Kanyon.getTarget(x.from, null, true)) || {
          tag: x.from,
        };

        if (!othPart) {
          return ` *${ts}* **${x.amt}** ${x.currency}\n\u200b\u2003\u2003|   *\`${x.type}\`* from ${x.to}`;
        }

        return (
          `↔ *${ts}*\u2002 ${_emoji(x.currency, _emoji("JUNK"))}\u2002×\u2002**${x.amt || 1}**\n\u200b ` +
          `╰ |   *\`${x.type}\`* from [${othPart?.tag}](${paths.DASH}/p/${othPart?.id})   `
        );
      }
      if (x.to && x.from === TARGETDATA.id && x.to !== POLid) {
        const othPart = (await Kanyon.getTarget(x.to, null, true)) || {
          tag: x.to,
        };

        if (!othPart) {
          return ` *${ts}* **${x.amt}** ${x.currency}\n\u200b\u2003\u2003|   *\`${x.type}\`* to ${x.to}`;
        }

        return (
          `↔  *${ts}*\u2002 ${_emoji(x.currency, _emoji("JUNK"))}\u2002×\u2002**${x.amt || 1}**\n\u200b ` +
          `╰ |   *\`${x.type}\`* to [${othPart?.tag}](${paths.DASH}/p/${othPart?.id})  `
        );
      }

      return "";
    }

    const EMBED = new Discord.EmbedBuilder()
      .setColor("#ffc156")
      .setTitle("Balance");

    if (TARGETDATA) {
      EMBED.addFields(
        {
          name: "\u200bClassic Gems",
          value:
            "\u200b" +
            `\u2003${_emoji("RBN")} ${"Rubines"}: **${miliarize(TARGETDATA.modules.RBN ?? 0, true)}**` +
            `\n\u2003${_emoji("SPH")} ${"Sapphires"}: **${miliarize(TARGETDATA.modules.SPH ?? 0, true)}**` +
            `\n\u2003${_emoji("JDE")} ${"Jades"}: **${miliarize(TARGETDATA.modules.JDE ?? 0, true)}**`,
          inline: true,
        },
        {
          name: "\u200bPolaris Gems",
          value:
            "\u200b" +
            `\u2003${_emoji("COS")} ${"Cosmo Fragments"}: **${miliarize(TARGETDATA.modules.COS ?? 0, true)}**` +
            `\n\u2003${_emoji("PSM")} ${"Boosting Prisms"}: **${miliarize(TARGETDATA.modules.PSM ?? 0, true)}**` +
            `\n\u2003${_emoji("EVT")} ${"Event Tokens"}: **${miliarize(TARGETDATA.modules.EVT ?? 0, true)}**` +
            `\n${invisibar}`,
          inline: true,
        },
      );

      const lastTrans = findAudits(AUDITS, Target.id);
      if (lastTrans.length > 0) {
        EMBED.addFields({
          name: "Last Transactions",
          value:
            `${await lastTransBuild(lastTrans[0])}
            ${await lastTransBuild(lastTrans[1])}
            ${await lastTransBuild(lastTrans[2])}
            ${await lastTransBuild(lastTrans[3])}
            ${await lastTransBuild(lastTrans[4])}`.trim() || "\u200b",
          inline: false,
        });
      }
    }

    if (Target) {
      EMBED.setFooter({ text: Target.tag, iconURL: Target.displayAvatarURL() });
    } else {
      EMBED.setDescription(`User \`${Target.id}\` not found anywhere`);
      EMBED.setFields([]);
    }

    EMBED.setThumbnail(`${paths.CDN}/build/coins/befli_t_s.png`);

    await message.reply({
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
  aliases: ["bal", "sapphires", "jades"],
  name: "balance",
  perms: 3,
  init,
  cat: "economy",
};
