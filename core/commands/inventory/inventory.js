const Picto = require("../../utilities/Picto");
const Discord = require("discord.js");
const { set, ref, onValue } = require("@firebase/database")

const $t = require("../../../appRoot/locales/pt-BR/bot_strings.json");
const rand$t = (array) => {
  if (!Array.isArray(array) || array.length === 0) return 'sexo';
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const INVOKERS = new Map();

const init = async (Kanyon, message, args) => {
  try {
    const canvas = Picto.new(800, 600);
    const ctx = canvas.getContext("2d");

    const XYZ = {
      // majors
      LBX: { y: 160, x: 710, w: 140, h: 37 },
      BPK: { y: 244, x: 710, w: 140, h: 0 },
      KEY: { y: 323, x: 710, w: 140, h: 0 },
      MTL: { y: 322, x: 180, w: 140, h: 37 },
      CSM: { y: 405, x: 180, w: 140, h: 0 },
      JNK: { y: 482, x: 180, w: 140, h: 0 },
      // minis
      mBG: { y: 255, x: 390 },
      mMD: { y: 220, x: 390 },
      mST: { y: 220, x: 285 },
      mFL: { y: 255, x: 285 },
      // meta
      uname: { y: 122, x: 227 },
      color1: { y: 127, x: 154, w: 505, h: 418, mw: 0 },
    };

    const Target = message.author;

    const callback = (snapshot) => snapshot.val(); 
    const [_baseline, hex, userDataSnapshot, itemDataSnapshot] = await Promise.all([
      Picto.getCanvas(`${paths.CDN}/build/invent/inventframe.png`),
      Picto.makeHex(175, Target.avatarURL({ extension: 'png' })),
      Kanyon.databaseResolveUser(Target.id),
      new Promise((resolve, reject) => {
        const itemsRef = ref(Kanyon.database, `Users/${Target.id}/items`);
        onValue(itemsRef, (snapshot) => {
          resolve(snapshot.val());
        }, { onlyOnce: true });
      })
    ]);

    const userData = userDataSnapshot;
    const itemData = itemDataSnapshot;

    ctx.fillStyle = userData.modules.favcolor || "#FFF";
    ctx.fillRect(154, 127, 500, 408);
    ctx.fillRect(427, 516, 132, 60);

    ctx.drawImage(hex, 25, 25);
    ctx.drawImage(_baseline, 0, 0);
    ctx.rotate(-0.10);

    const fSize = 40;
    const uname_w = Picto.popOutTxt(ctx, Target.username, XYZ.uname.x - 10, XYZ.uname.y + 00, `${fSize}pt 'Panton Black','Corporate Logo Rounded' `, "#FFF", 400, { style: "#1f1d25", line: 14 }).w;
    Picto.popOutTxt(ctx, `#${Target.discriminator}`, XYZ.uname.x + uname_w - 30, XYZ.uname.y + 20, "24pt 'Panton Light'", "#FFF", 100, { style: "#1f1d25", line: 8 }).w;
    ctx.rotate(0.10);

    Picto.setAndDraw(ctx, Picto.tag(ctx, $t.keywords.lootbox, "400 22pt 'Panton'", "#FFF"), XYZ.LBX.x, XYZ.LBX.y, XYZ.LBX.w, "right");
    Picto.setAndDraw(ctx, Picto.tag(ctx, $t.keywords.boosterpack, "400 22pt 'Panton'", "#FFF"), XYZ.BPK.x, XYZ.BPK.y, XYZ.BPK.w, "right");
    Picto.setAndDraw(ctx, Picto.tag(ctx, $t.keywords.consumable, "400 22pt 'Panton'", "#FFF"), XYZ.CSM.x, XYZ.CSM.y, XYZ.CSM.w, "left");
    Picto.setAndDraw(ctx, Picto.tag(ctx, $t.keywords.material, "400 22pt 'Panton'", "#FFF"), XYZ.MTL.x, XYZ.MTL.y, XYZ.MTL.w, "left");
    Picto.setAndDraw(ctx, Picto.tag(ctx, $t.keywords.key, "400 22pt 'Panton'", "#FFF"), XYZ.KEY.x, XYZ.KEY.y, XYZ.KEY.w, "right");
    Picto.setAndDraw(ctx, Picto.tag(ctx, $t.keywords.junk, "400 22pt 'Panton'", "#FFF"), XYZ.JNK.x, XYZ.JNK.y, XYZ.JNK.w, "left");

    const types = {};

    const inventory = Array.isArray(userData.modules.inventory) ? userData.modules.inventory : [];

    inventory.forEach((itm) => {
      let itemType;
      try {
        itemType = itemData.find((i) => (itm.id || itm) == i.id).type || "other";
      } catch (err) {
        console.error(`BAD INVENTORY ITEM ${itm} - ${err.message}`);
        itemType = "other";
      }
      if (!types[itemType]) types[itemType] = 0;
      types[itemType] += (itm.count || 0);
    });

    const a_csm = xlr99(types.consumable || 0, "L");
    const a_key = xlr99(types.key || 0);
    const a_mtl = xlr99(types.material || 0);
    const a_jnk = xlr99(types.junk || 0);
    const a_bpk = xlr99(types.boosterpack || 0, "L");
    const a_lbx = xlr99(types.box || 0, "L");

    function xlr99(x, LR = "R") {
      x = LR === "R" ? x > 99 ? "+99" : x : x > 99 ? "99+" : x;
      return x;
    }

    const a_bg = Array.isArray(userData.modules.bgInventory) ? userData.modules.bgInventory.length : 0;
    const a_md = Array.isArray(userData.modules.medalInventory) ? userData.modules.medalInventory.length : 0;
    const a_st = Array.isArray(userData.modules.stickerInventory) ? userData.modules.stickerInventory.length : 0;
    const a_fl = Array.isArray(userData.modules.flairsInventory) ? userData.modules.flairsInventory.length : 0;

    ctx.globalAlpha = 0.7;
    Picto.setAndDraw(ctx, Picto.tag(ctx, a_st, "600 18pt 'Panton'", "#FFF"), XYZ.mST.x, XYZ.mST.y, 100, "right");
    Picto.setAndDraw(ctx, Picto.tag(ctx, a_fl, "600 18pt 'Panton'", "#FFF"), XYZ.mFL.x, XYZ.mFL.y, 100, "right");
    Picto.setAndDraw(ctx, Picto.tag(ctx, a_md, "600 18pt 'Panton'", "#FFF"), XYZ.mMD.x, XYZ.mMD.y, 100, "right");
    Picto.setAndDraw(ctx, Picto.tag(ctx, a_bg, "600 18pt 'Panton'", "#FFF"), XYZ.mBG.x, XYZ.mBG.y, 100, "right");
    ctx.globalAlpha = 1;

    Picto.setAndDraw(ctx, Picto.tag(ctx, a_jnk, "100 20pt 'Panton Light'", "#FFF"), XYZ.JNK.x + 180, XYZ.JNK.y, XYZ.JNK.w, "right");
    Picto.setAndDraw(ctx, Picto.tag(ctx, a_mtl, "100 20pt 'Panton Light'", "#FFF"), XYZ.MTL.x + 180, XYZ.MTL.y, XYZ.MTL.w, "right");
    Picto.setAndDraw(ctx, Picto.tag(ctx, a_csm, "100 20pt 'Panton Light'", "#FFF"), XYZ.CSM.x + 180, XYZ.CSM.y, XYZ.CSM.w, "right");
    Picto.setAndDraw(ctx, Picto.tag(ctx, a_key, "100 24pt 'Panton Light'", "#FFF"), XYZ.KEY.x - 200, XYZ.KEY.y, XYZ.KEY.w, "left");
    Picto.setAndDraw(ctx, Picto.tag(ctx, a_bpk, "100 24pt 'Panton Light'", "#FFF"), XYZ.BPK.x - 200, XYZ.BPK.y, XYZ.BPK.w, "left");
    Picto.setAndDraw(ctx, Picto.tag(ctx, a_lbx, "100 24pt 'Panton Light'", "#FFF"), XYZ.LBX.x - 200, XYZ.LBX.y, XYZ.LBX.w, "left");

    let selectedType = "";
    const createInventoryButtons = (selectedType, disabled = false) => [
      [
        { style: selectedType === "MATERIAL" ? 1 : 2, label: selectedType === "MATERIAL" ? "MATERIAL" : "", custom_id: `invButton:MATERIAL:${message.author.id}`, emoji: { id: _emoji("MATERIAL").id }, disabled },
        { style: selectedType === "CONSUMABLE" ? 1 : 2, label: selectedType === "CONSUMABLE" ? "CONSUMABLE" : "", custom_id: `invButton:CONSUMABLE:${message.author.id}`, emoji: { id: _emoji("CONSUMABLE").id }, disabled },
        { style: selectedType === "JUNK" ? 1 : 2, label: selectedType === "JUNK" ? "JUNK" : "", custom_id: `invButton:JUNK:${message.author.id}`, emoji: { id: _emoji("JUNK").id }, disabled },
        { style: selectedType === "LOOTBOX" ? 1 : 2, label: selectedType === "LOOTBOX" ? "LOOTBOX" : "", custom_id: `invButton:LOOTBOX:${message.author.id}`, emoji: { id: _emoji("LOOTBOX").id }, disabled },
        { style: selectedType === "BOOSTER" ? 1 : 2, label: selectedType === "BOOSTER" ? "BOOSTER" : "", custom_id: `invButton:BOOSTER:${message.author.id}`, emoji: { id: _emoji("BOOSTER").id }, disabled },
      ], [
        { style: selectedType === "KEY" ? 1 : 2, label: selectedType === "KEY" ? "KEY" : "", custom_id: `invButton:KEY:${message.author.id}`, emoji: { id: _emoji("KEY").id }, disabled },
        { style: 2, custom_id: `BLANK_1`, disabled: true, emoji: { id: _emoji("__").id } },
        { style: 2, custom_id: `BLANK_2`, disabled: true, emoji: { id: _emoji("__").id } },
        { style: 2, custom_id: `BLANK_3`, disabled: true, emoji: { id: _emoji("__").id } },
        { style: 4, custom_id: `invButton:CLOSE:${message.author.id}`, emoji: { id: _emoji("nope").id }, disabled },
      ]
    ];

    let menuAttachment = await canvas.toBuffer();
    let menuComponents = createInventoryButtons(selectedType).map(row => new Discord.ActionRowBuilder().addComponents(row.map(button => new Discord.ButtonBuilder(button))));

    const menumes = await message.reply({
      files: [{ attachment: menuAttachment, name: "inventory.png", description: `${Target.username}'s inventory.` }],
      components: menuComponents,
      allowedMentions: { repliedUser: false }
    });

    const menuObject = {
      MATERIAL: require('./material.js'),
      BOOSTER: require("./boosterpack.js"),
      CONSUMABLE: require('./consumable.js'),
      JUNK: require('./junk.js'),
      LOOTBOX: require('./lootbox.js'),
      KEY: require('./key.js')
    }

    const collector = menumes.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 60_000 });

    collector.on('collect', async i => {
      if (i.user.id === message.author.id) {
        const [_, type] = i.customId.split(':');
        
        if(_ == "openBox") {
          await menuObject["LOOTBOX"].open(message, type, message.author.id)
          menumes.edit({
            allowedMentions: { repliedUser: false },
            components: createInventoryButtons(selectedType, true).map(row => new Discord.ActionRowBuilder().addComponents(row.map(button => new Discord.ButtonBuilder(button))))
          });
          await i.deferUpdate();
          return;
        }

        if (type === "CLOSE") {
          menumes.edit({
            allowedMentions: { repliedUser: false },
            components: createInventoryButtons(selectedType, true).map(row => new Discord.ActionRowBuilder().addComponents(row.map(button => new Discord.ButtonBuilder(button))))
          });
          await i.deferUpdate();
          return;
        }

        if (selectedType === type) {
          await i.deferUpdate();
          return;
        }

        selectedType = type;

        const toEdit = await menuObject[type].init(Kanyon, message, args, i);

        toEdit.allowedMentions = { repliedUser: false };
        const newComponents = createInventoryButtons(selectedType).map(row => new Discord.ActionRowBuilder().addComponents(row.map(button => new Discord.ButtonBuilder(button))));
        
        toEdit.components = toEdit.components && toEdit.components.length > 0
        ? [...newComponents, ...toEdit.components]
        : newComponents;

        menumes.edit(toEdit);
        await i.deferUpdate();
      } else {
        await i.reply({ content: `These buttons aren't for you!`, ephemeral: true });
        await i.deferUpdate();
      }
    });

    collector.on('end', async i => {
      menumes.edit({
        allowedMentions: { repliedUser: false },
        components: createInventoryButtons(selectedType, true).map(row => new Discord.ActionRowBuilder().addComponents(row.map(button => new Discord.ButtonBuilder(button))))
      });
      return;
    })

    menumes.target = Target;
    args[10] = userData;
    args[11] = message.prefix;
    INVOKERS.set(message.author.id, menumes.id);

    return menumes;
  } catch (e) {
    console.log(e);
    message.channel.send("Ocorreu um erro ao tentar exibir o inventário. Por favor, tente novamente mais tarde.");
  }
};

module.exports = {
  init,
  pub: true,
  name: "inventory",
  perms: 3,
  cat: "inventory",
  botPerms: ["ATTACH_FILES", "EMBED_LINKS"],
  aliases: ["inv"],
  reactionButtonTimeout: 30e3,
  postCommand: (m, a, r) => setTimeout(() => INVOKERS.delete(m.author.id), 32e3),
};
