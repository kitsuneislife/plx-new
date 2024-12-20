const Discord = require("discord.js");

const Lootbox = require("../../archetypes/Lootbox.js");
const ECO = require("../../archetypes/Economy.js")
const Picto = require("../../utilities/Picto.js");

const { set, ref, onValue, update } = require("@firebase/database");
const { getTarget } = require("../../utilities/Gearbox/client.js");

const CARD_WIDTH = 270;
const BASELINE_REROLLS = 3;
const REROLL_MSG = (P) => ({ embed: { description: $t.loot.rerolled } });
const FIRSTROLL_MSG = (P) => ({ embed: { description: $t.loot.opening } });

const VisualsCache = new Map();

const staticAssets = {};
staticAssets.load = Promise.all([
  Picto.getCanvas(`${paths.CDN}/build/LOOT/frame_C.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/frame_U.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/frame_R.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/frame_SR.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/frame_UR.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/frame_XR.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/dupe-tag.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/bgC.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/bgU.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/bgR.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/bgSR.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/bgUR.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/sparkles_0.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/sparkles_1.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/sparkles_2.png`),
  Picto.getCanvas(`${paths.CDN}/build/LOOT/bonusbar.png`),
]).then((res) => {
  const [
    frame_C,
    frame_U,
    frame_R,
    frame_SR,
    frame_UR,
    frame_XR,
    dupe_tag,
    bgC,
    bgU,
    bgR,
    bgSR,
    bgUR,
    sparkles_0,
    sparkles_1,
    sparkles_2,
    bonusbar,
  ] = res;
  Object.assign(staticAssets, {
    frame_C,
    frame_U,
    frame_R,
    frame_SR,
    frame_UR,
    frame_XR,
    dupe_tag,
    bgC,
    bgU,
    bgR,
    bgSR,
    bgUR,
    sparkles_0,
    sparkles_1,
    sparkles_2,
    bonusbar,
    loaded: true,
  });
  delete staticAssets.load;
});

const init = async (Kanyon, message, args) => {
  try {
    //if ( (!args.boxID && message.author.id != "88120564400553984") || args[0] > 5 ) return;
    if (!staticAssets.loaded) await staticAssets.load;
    if (VisualsCache.size > 800) VisualsCache.clear();

    const USERDATA = await Kanyon.databaseResolveUser(message.author.id)
    let INCONSTANT = { cosmos: 0 };

    let boxparams = Object.values(USERDATA.items || {}).find(
      (bx) => bx.id == args?.boxID && bx.rarity == args?.rarity,
    );
    if (!boxparams) boxparams = {};
    boxparams.size = ~~args[0];

    const lootbox = new Lootbox(boxparams.rarity, boxparams);
    await lootbox.compileVisuals;
    
    let currentRoll = 0;

    async function process() {
      await Promise.all([
        // USERDATA.removeItem(lootbox.id),
        // USERDATA.addItem("cosmo_fragment", P.cosmos),
        // ECO.pay(USERDATA, determineRerollCost(lootbox, currentRoll - 1, USERDATA), "lootbox_reroll"),
        // DB.users.set(USERDATA.id, lootbox.bonus.query),
        // // FIXME [epic=flicky] Boosterpacks not being added
        await Kanyon.databaseRemoveLootbox(message.author.id, lootbox.id),
        Promise.all(lootbox.content.map((item) => getPrize(item, USERDATA))),
        wait(1)
      ]);

      console.log('a')
      return null;
    }

    function renderCard(item, visual) {
      const canvas = Picto.new(CARD_WIDTH, 567);
      const ctx = canvas.getContext("2d");

      const itemVisual = VisualsCache.get(visual);
      const backFrame = staticAssets[`frame_${item.rarity}`];

      ctx.drawImage(backFrame, CARD_WIDTH / 2 - backFrame.width / 2, 0);

      ctx.globalCompositeOperation = "overlay";
      ctx.rotate(-1.5708);

      const itemTypePrint = (
        item.type !== "gems"
          ? $t.keywords[item.type]
          : $t.keywords[item.currency]
      ).toUpperCase();
      Picto.setAndDraw(
        ctx,
        Picto.tag(
          ctx,
          itemTypePrint,
          "600 50px 'AvenirNextRoundedW01-Bold'",
          "#FFF",
        ),
        -468,
        (CARD_WIDTH - backFrame.width) / 2 + 10,
        460,
      );
      ctx.rotate(1.5708);
      ctx.globalCompositeOperation = "source-over";

      ctx.shadowColor = "#2248";
      ctx.shadowOffsetY = 5;
      ctx.shadowBlur = 10;

      if (item.type === "background") {
        const ox = -25;
        const oy = 125;
        const odx = 240;
        const ody = 135;

        const offset = 10;

        ctx.rotate(-0.2);
        ctx.translate(0, 10);
        Picto.roundRect(ctx, ox, oy, 240, 135, 15, "#FFF", "#1b1b2b", 5);
        ctx.shadowColor = "transparent";
        Picto.roundRect(
          ctx,
          ox + offset,
          oy + offset,
          odx - offset * 2,
          ody - offset * 2,
          offset / 2,
          itemVisual,
        );
        ctx.shadowColor = "#2248";
        ctx.translate(0, -10);
        ctx.rotate(0.2);
      } else if (item.type === "medal") {
        const itemW = 150;
        ctx.drawImage(
          itemVisual,
          CARD_WIDTH / 2 - itemW / 2,
          190 - itemW / 2,
          itemW,
          itemW,
        );
      } else if (item.type === "boosterpack") {
        const itemW = 210;
        ctx.translate(CARD_WIDTH / 2 - itemW / 2 + 30, 190 - 300 / 2);
        ctx.rotate(0.17);
        ctx.drawImage(itemVisual, 0, 0, itemW, 300);
        ctx.rotate(-0.17);
        ctx.translate(-(CARD_WIDTH / 2 - itemW / 2 + 30), -(190 - 300 / 2));
      } else {
        const itemW = 200;
        try {
          ctx.drawImage(
            itemVisual,
            CARD_WIDTH / 2 - itemW / 2,
            190 - itemW / 2,
            itemW,
            itemW,
          );
        } catch (err) {
          console.error("===========================");
          console.error(err);
          console.error(item);
          console.error("===========================");
        }
      }

      ctx.shadowBlur = 5;

      const itemTitle = (item.name || `${item.amount}`).toUpperCase();
      const itemFont = "50px 'Panton Black Italic Caps'";
      const itemOptions = {
        textAlign: "center",
        verticalAlign: "middle",
        lineHeight: 1.1,
        sizeToFill: true,
        maxFontSizeToFill: 80,
        paddingY: 15,
        paddingX: 15,
        stroke: {
          style: "#121225",
          line: 15,
        },
      };

      ctx.drawImage(
        Picto.block(ctx, itemTitle, itemFont, "#FFF", 230, 100, itemOptions)
          .item,
        15,
        220,
      );

      itemOptions.stroke = null;

      ctx.drawImage(
        Picto.block(ctx, itemTitle, itemFont, "#FFF", 230, 100, itemOptions)
          .item,
        15,
        220,
      );

      ctx.shadowColor = "transparent";
      Picto.setAndDraw(
        ctx,
        Picto.tag(
          ctx,
          `${$t.keywords[item.rarity]}`,
          "900 32px AvenirNextRoundedW01-Bold",
          "#FFFB",
        ),
        CARD_WIDTH / 2,
        15,
        230,
        "center",
      );

      return canvas;
    }
    function renderDupeTag(rarity) {
      const canvas = Picto.new(
        staticAssets.dupe_tag.width,
        staticAssets.dupe_tag.width,
      );
      const ctx = canvas.getContext("2d");
      //const cosmoAward = LootGems[rarity];
      //INCONSTANT.cosmos += cosmoAward;
      const cosmoAward = 0;

      ctx.translate(
        canvas.width - staticAssets.dupe_tag.width + 10,
        canvas.height / 2,
      );
      ctx.rotate(0.22);
      ctx.shadowColor = "#53F8";
      ctx.shadowBlur = 10;
      ctx.drawImage(staticAssets.dupe_tag, 0, 0);
      ctx.shadowBlur = 0;
      Picto.setAndDraw(
        ctx,
        Picto.tag(
          ctx,
          `${$t("loot.duplicate", P)} ! `,
          " 32px 'Panton Black Italic Caps'",
          "#ffca82",
          { line: 8, style: "#1b1b32" },
        ),
        49,
        5,
        235,
      );
      Picto.setAndDraw(
        ctx,
        Picto.tag(
          ctx,
          `+${cosmoAward}`,
          " 25px 'Panton Black Italic Caps'",
          "#FFF",
          { line: 6, style: "#1b1b32" },
        ),
        175,
        40,
        125,
        "right",
      );
      Picto.setAndDraw(
        ctx,
        Picto.tag(
          ctx,
          $t("keywords.cosmoFragment_plural", P).toUpperCase(),
          "900 17px 'Panton'",
          "#DDF8",
        ),
        175,
        48,
        150,
      );

      return canvas;
    }
    async function getPrize(loot, USERDATA) {
      if (loot.type === "gems") return ECO.receive(USERDATA.id, loot.amount, "lootbox_rewards", loot.currency || "RBN");
      if (loot.type === "background") return Kanyon.databaseAddCosmetic(USERDATA.id, loot);
      if (loot.type === "medal") return Kanyon.databaseAddCosmetic(USERDATA.id, loot);
    }
    function determineRerollCost(box, rollNum, USERDATA) {
      /*let stake = Math.round(
        (USERDATA.modules.bgInventory.length || 100)
        + (USERDATA.modules.bgInventory.length || 100)
        + (USERDATA.modules.inventory.length || 100),
      );
      stake = stake < 50 ? 50 : stake;

      const factors = ["C", "U", "R", "SR", "UR"].indexOf(box.rarity) || 0;
      return ((rollNum || 0) + 1) * Math.ceil(factors * 1.2 + 1) * (stake + 50);*/
    }
    function boxBonus(lootbox, options, USERDATA) {
      const rarityIndex = ["C", "U", "R", "SR", "UR", "XR"].indexOf(
        lootbox.rarity,
      );
      let prize = Math.max(
        Math.ceil(
          25 + rarityIndex * 25 - (options.currentRoll || 0) * 15 * rarityIndex,
        ),
        28,
      );

      prize += randomize(1, 100);

      return {
        label: prize,
        unit: "EXP",
        query: { $inc: { "modules.exp": prize } },
      };
    }

    async function compileBox(message, lootbox, USERDATA, options) {
      await Promise.all(
        lootbox.visuals.map(
          async (vis) =>
            VisualsCache.get(vis) ||
            (VisualsCache.set(
              vis,
              await Picto.getCanvas(vis).catch((e) => e),
            ) &&
              VisualsCache.get(vis)),
        ),
      );

      const {
        currentRoll,
        rerollCost,
        totalRerolls,
        canAffordReroll,
        P,
        canReroll,
      } = options;
      let hasDupes = false;

      const canvas = Picto.new(800, 600);
      const ctx = canvas.getContext("2d");
      const back = staticAssets[`bg${lootbox.rarity}`];

      const itemCards = lootbox.content.map((item, i) =>
        renderCard(item, lootbox.visuals[i]),
      );

      if (itemCards.length <= 3) {
        if (itemCards.length === 3) ctx.drawImage(back, 0, 0, 800, 600);
        ctx.translate(0, 10);
        itemCards.forEach((card, i, a) => {
          if (a.length === 1) i = 1;
          const angle = -0.05 + 0.05 * i;
          const moveY = Math.abs(i - 1) + (i || 15) - (i === 2 ? 25 : 0);
          const moveX = i - 1 * 15 + i * 16;

          ctx.translate(moveX, moveY);
          ctx.rotate(angle);
          ctx.drawImage(card, 8 + i * (CARD_WIDTH - 15) + 2, 0);
          ctx.rotate(-angle);
          ctx.translate(-moveX, -moveY);
        });
        ctx.translate(0, -10);
      } else {
        ctx.save();
        ctx.translate(0, 470);
        ctx.rotate(-0.08 * Math.floor(itemCards.length / 2));
        itemCards.forEach((card, i) => {
          const angle = 0.08 * i;
          const dx = 230;
          const dy = 0;
          ctx.save();
          ctx.rotate(angle);
          ctx.translate(0, -470);
          ctx.drawImage(
            card,
            -(780 / (itemCards.length * 2)) +
              (1 + i) * (780 / itemCards.length - 40) +
              2 -
              10 * i,
            120 + Math.pow(1 + i, 2) * -(10 - i),
          );
          ctx.restore();
        });
        ctx.restore();
      }

      lootbox.content.forEach((loot, i, a) => {
        let isDupe = false;

        if (loot.type === "background")
          isDupe = Object.keys(USERDATA.modules?.backgroundInventory || {}).includes(loot.objectId);
        if (loot.type === "medal")
          isDupe = Object.keys(USERDATA.modules?.medalInventory || {}).includes(loot.objectId)

        if (isDupe) {
          hasDupes = true;
          loot.isDupe = true;
          const dupe = renderDupeTag(loot.rarity);
          if (a.length <= 3)
            ctx.drawImage(
              dupe,
              -6 + (a.length === 1 ? 1 : i) * (CARD_WIDTH - 15),
              -80,
              CARD_WIDTH + 40,
              CARD_WIDTH + 40,
            );
          else
            Picto.setAndDraw(
              ctx,
              Picto.tag(ctx, "DUPE", '600 italic 30px "Panton"', "#FA5", {
                style: "#22212b",
                line: 10,
              }),
              100 + i * (750 / a.length) - 40 * (1 + i),
              430 + Math.abs((i - 2) * 10),
            );
        }
      });

      ctx.drawImage(staticAssets.bonusbar, 0, 0, 800, 600);
      if (lootbox.content.length <= 3) {
        lootbox.content.forEach((l, i, a) =>
          l.rarity.includes("R")
            ? ctx.drawImage(staticAssets[`sparkles_${a[1] ? i : 1}`], 0, 0)
            : null,
        );
      }

      lootbox.bonus = boxBonus(lootbox, options, USERDATA);

      const bonusNum = Picto.tag(
        ctx,
        lootbox.bonus.label,
        "42px 'Panton Black Italic Caps'",
        "#FFF",
      );
      const bonusName = Picto.tag(
        ctx,
        lootbox.bonus.unit,
        "34px 'Panton Black Italic Caps'",
        "#FFF",
      );
      ctx.drawImage(
        bonusNum.item,
        620 - bonusName.width - bonusNum.width - 10,
        525,
      );
      ctx.drawImage(bonusName.item, 620 - bonusName.width, 535);

      process()
      return {
        files: [{ attachment: await canvas.toBuffer(), name: "lootbox.png" }],
      };
    }

    const r = await compileBox(message, lootbox, {}, USERDATA);

    const translate_rar = {
      C: 'COMUM',
      U: 'INCOMUM',
      R: 'RARO',
      SR: 'SUPER RARO',
      UR: 'ULTRA RARO'
    };

    const translate_type = {
      RBN: $t.keywords.RBN_plural,
      JDE: $t.keywords.JDE_plural,
      background: $t.keywords.background,
      medal: $t.keywords.medal
    };

    const items = lootbox.content.slice(0, 3);

    const maxRarityLength = items.reduce((max, item) => {
      const rarityLength = (translate_rar[item.rarity] || '---').length;
      return Math.max(max, rarityLength);
    }, 0);

    const maxTypeLength = items.reduce((max, item) => {
      const typeLength = (translate_type[item.currency || item.type] || '---').length;
      return Math.max(max, typeLength);
    }, 0);

    const itemsDescription = items.map(item => {
      const rarity = translate_rar[item.rarity] || '---';
      const type = translate_type[item.currency || item.type] || '---';
      const itemName = item.name || item.amount || '---';

      const spacesCountRarity = Math.max(0, maxRarityLength - rarity.length);
      const spacesCountType = Math.max(0, maxTypeLength - type.length);

      if(!item.currency) return `${' '.repeat(spacesCountRarity)}${rarity} | '${type}'${' '.repeat(spacesCountType)} : "${itemName}"`;
      return `${' '.repeat(spacesCountRarity)}${rarity} | '${type}'${' '.repeat(spacesCountType)} : ${itemName}`;
    }).join('\n');

    r.embeds = [{
      title: `${_emoji(lootbox.rarity)} **${$t.items[lootbox.id].name}**`,
      description: `     ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\`\`\`smalltalk\n${itemsDescription}\`\`\``,
      color: parseInt(lootbox.color.replace("#", ""), 16),
      footer: {
        iconURL: message.author.avatarURL(),
        text: message.author.username,
      }
    }];
    r.allowedMentions = { repliedUser: false }

    message.reply(r);
  } catch (error) {
    console.error(error);
    return message.reply("Ocorreu um erro ao executar o comando.");
  }
};

module.exports = {
  init,
  pub: true,
  cmd: "lootbox_generator",
  perms: 3,
  cat: "infra",
  botPerms: ["EmbedLinks"],
  aliases: [],
};
