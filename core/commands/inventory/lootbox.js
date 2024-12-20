const INVENTORY = require("../../archetypes/Inventory");
const GENERATOR = require("../cosmetics/lootbox_generator.js");

const INVOKERS = new Map();
const INV_STATUS = new Map();

const createInventoryEmbed = function createInventoryEmbed(
  Inventory,
  { author, lang = "en", prefix = Kanyon.prefix },
) {
  const embed = {
    color: 0xd14362,
    thumbnail: { url: `${paths.CDN}/build/LOOT/lootbox_trans_80.png` },
  };
  embed.description =
    Inventory.length > 0
      ? Inventory.slice(0, 25)
          .map(
            (i) =>
              `${_emoji(i.rarity)} ${_emoji(i.emoji || i.emoji_alt)} **${i.name || $t.items[i.id].name}** × ${i.count} \`${prefix}open box ${i.rarity}\``,
          )
          .join("\n")
      : `*${rand$t($t.responses.inventory.emptyJokes)}*`;

  embed.footer = {
    text: author.tag,
    iconUrl: author.avatarURL(),
  };

  return embed;
};

const init = async function (Kanyon, msg, args, reactionMember) {
  const reactionUserID =
    reactionMember?.user.id || reactionMember?.id || reactionMember;

  if (
    reactionUserID &&
    args[10]?.id != reactionUserID &&
    reactionUserID !== msg.author.id
  )
    return "Only the owner can see inside";
  msg.lang = msg.lang || [msg.channel.LANG || "en", "dev"];

  const userInventory = new INVENTORY(reactionUserID || msg.author.id, "", {
    db: "box",
  });
  const Inventory = await userInventory.listItems(args[10]);

  const embed = createInventoryEmbed(Inventory, msg);

  args[0] = msg;
  args[1] = Inventory.map((i) => i.rarity);
  INV_STATUS.set(reactionUserID || msg.author.id, args[1]);

  const createLootboxButtons = (inventory, disabled = false) => [
    [
      {
        style: 2,
        label: $t.keywords["C"],
        custom_id: `openBox:C:${msg.author.id}:${msg.lang[0]}`,
        emoji: { id: _emoji("C").id },
        disabled: disabled || !inventory.some((item) => item.rarity === "C"),
      },
      {
        style: 2,
        label: $t.keywords["U"],
        custom_id: `openBox:U:${msg.author.id}:${msg.lang[0]}`,
        emoji: { id: _emoji("U").id },
        disabled: disabled || !inventory.some((item) => item.rarity === "U"),
      },
      {
        style: 2,
        label: $t.keywords["R"],
        custom_id: `openBox:R:${msg.author.id}:${msg.lang[0]}`,
        emoji: { id: _emoji("R").id },
        disabled: disabled || !inventory.some((item) => item.rarity === "R"),
      },
      {
        style: 2,
        label: $t.keywords["SR"],
        custom_id: `openBox:SR:${msg.author.id}:${msg.lang[0]}`,
        emoji: { id: _emoji("SR").id },
        disabled: disabled || !inventory.some((item) => item.rarity === "SR"),
      },
      {
        style: 2,
        label: $t.keywords["UR"],
        custom_id: `openBox:UR:${msg.author.id}:${msg.lang[0]}`,
        emoji: { id: _emoji("UR").id },
        disabled: disabled || !inventory.some((item) => item.rarity === "UR"),
      },
    ],
  ];

  const response = {
    content: `${_emoji("LOOTBOX")} ${$t.responses.inventory.browsingBox}`,
    embeds: [embed],
    components: createLootboxButtons(Inventory).map(row => new Discord.ActionRowBuilder().addComponents(row.map(button => new Discord.ButtonBuilder(button)))),
    allowedMentions: { repliedUser: false }
  };

  if (reactionUserID) return response;
  const res = await msg.reply(response);

  const collector = res.createMessageComponentCollector({
    componentType: Discord.ComponentType.Button,
    time: 60_000,
  });
  collector.on("collect", async (i) => {
    if (i.user.id === msg.author.id) {
      const [_, type] = i.customId.split(":");
      open(msg, type, msg.author.id)
      res.edit({
        allowedMentions: { repliedUser: false },
        components: createLootboxButtons(Inventory, true).map(row => new Discord.ActionRowBuilder().addComponents(row.map(button => new Discord.ButtonBuilder(button)))),
      });
      i.deferUpdate();
    } else {
      await i.reply({
        content: `These buttons aren't for you!`,
        ephemeral: true,
      });
      await i.deferUpdate();
    }
  });

  collector.on("end", async (i) => {
    res.edit({
      allowedMentions: { repliedUser: false },
      components: createLootboxButtons(Inventory, true).map(row => new Discord.ActionRowBuilder().addComponents(row.map(button => new Discord.ButtonBuilder(button)))),
    });
    return;
  });

  INVOKERS.set(msg.author.id, res.id);
  return res;
};

const open = async function (msg, rar, memberObj) {
  const userID = memberObj?.id || memberObj;

  INVOKERS.delete(userID || msg.author.id);
  INV_STATUS.delete(userID || msg.author.id);

  if (userID && msg.author.id != userID) return "Only the owner can see inside";

  const userInventory = new INVENTORY(userID || msg.author.id, "", { db: "box" });
  const Inventory = await userInventory.listItems();
  const selectedBox = Inventory.find((bx) => bx.rarity === rar);

  if (!selectedBox) {
    msg.reply({
      content: $t.responses.inventory.noSuchBox,
      allowedMentions: { repliedUser: false }
    })
    return $t.responses.inventory.noSuchBox;
  }
  this.hooks = GENERATOR.hooks;
  return GENERATOR.init(Kanyon, msg, { boxID: selectedBox.id, rarity: selectedBox.rarity }).catch(
    console.error,
  );
};

module.exports = {
  init,
  open,
  pub: true,
  name: "lootbox",
  perms: 3,
  cat: "inventory",
  botPerms: ["attachFiles", "embedLinks"],
  aliases: ["box", "boxes"],
  /*autoSubs: [
    {
      label: "open",
      gen: open,
      options: {
        argsRequired: true,
        invalidUsageMessage: (msg) => { PLX.autoHelper("force", { msg, cmd: "lootbox", opt: "cosmetics" }); },
      },
    },
  ],*/
  //reactionButtons: ["C", "U", "R", "SR", "UR"].map(reactionOption),
  createInventoryEmbed,
};
