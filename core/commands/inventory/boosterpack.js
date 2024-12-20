// TRANSLATE[epic=translations] boosterpack

const INVENTORY = require("../../archetypes/Inventory");

const init = async (Kanyon, message, args, reactionMember) => {
  try {
    const reactionUserID = reactionMember?.user.id || reactionMember?.id || reactionMember;

    if (reactionUserID && args[10]?.id != reactionUserID && reactionUserID !== message.author.id) return "Only the owner can see inside";

    // message.lang = message.lang || [message.channel.LANG || "en", "dev"];

    const userInventory = new INVENTORY(reactionUserID ?? message.author.id, "boosterpack");
    const Inventory = await userInventory.listItems(args[10]);

    const embed = new Discord.EmbedBuilder()
      .setColor(0xeb546d)
      .setDescription(Inventory.length > 0
                     ? Inventory.map((i) => `${_emoji(i.rarity)}  **${i.name}** × ${i.count} \`${message.prefix || args[11]}open booster ${i.icon}\``).join("\n")
                     : `*${rand$t($t.responses.inventory.emptyJokes)}*`)
      .setFooter(
        {
          text: (args[12] || message).author.tag,
          iconUrl: (args[12] || message).author.avatarURL,
        }
      )

    //message.reply({ content: `${_emoji("BOOSTER")} ${$t.responses.inventory.browsingBooster}`, embeds: [embed] })
    return { content: `${_emoji("BOOSTER")} ${$t.responses.inventory.browsingBooster}`, embeds: [embed] };
  } catch (error) {
    console.error("Error in init function:", error);
    return "An error occurred while processing your request.";
  }
};

const open = async function (message, args) {
  try {
    const userInventory = new INVENTORY(message.author.id, "boosterpack");
    const Inventory = await userInventory.listItems();

    if (!Inventory.find((bx) => bx.icon == args[0])) return "No such pack";

    require("../cosmetics/openbooster.js").init(Kanyon, message, { rarity: args[0] });
  } catch (error) {
    console.error("Error in open function:", error);
    return "An error occurred while processing your request.";
  }
};

module.exports = {
  init,
  open,
  pub: true,
  name: "boosterpack",
  perms: 3,
  cat: "inventory",
  botPerms: ["attachFiles", "embedLinks"],
  aliases: ["booster"],
  /*autoSubs: [
    {
      label: "open",
      gen: open,
      options: {
        argsRequired: true,
        invalidUsageMessage: (message) => { Kanyon.autoHelper("force", { message, cmd: "boosterpack", opt: "cosmetics" }); },
      },
    },
  ],*/
};
