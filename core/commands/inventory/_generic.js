
const INVENTORY = require('../../archetypes/Inventory');
const navigator = require('../../structures/ReactionNavigator');

const ATTR = (i) => `${i.buyable ? _emoji("market_ready").no_space : _emoji("__").no_space}\
                    ${i.tradeable ? _emoji("can_trade").no_space : _emoji("__").no_space}\
                    ${i.destroyable ? _emoji("can_destroy").no_space : _emoji("__").no_space}`;

const displayItem = (invItm, embed) => {
  embed.addField({
    name: `${invItm.emoji}  **${$t.items[invItm.id].name}** × ${invItm.count}`,
    value: `
        \u2003 *${$t.items[invItm.id].description ?? "---"}* 
        \u2003 ${ATTR(invItm)}\
        `,
    inline: false
  }
  );
};

class GenericItemInventory {
  constructor(type, aliases, pub, img, color) {
    this.invIdentifier = type || "junk";
    this.browsingTag = type.toUpperCase() || optionals.browsingTag;
    this.emoji = type.toUpperCase() || optionals.emoji;
    this.name = type || optionals.cmd;
    this.aliases = aliases || [];
    this.img = img || "";
    this.color = color || 0xEBBEFF;
    this.pub = pub || true;

    this.init = async (Kanyon, msg, args, reactionMember, originalMsg) => {
      const reactionUserID = reactionMember?.user.id || reactionMember?.id || reactionMember;
      
      if (reactionUserID && args[10]?.id != reactionUserID && reactionUserID !== msg.author.id) return "Only the owner can see inside";

      msg.lang = msg.lang || [msg.channel.LANG || "en", "dev"];
      // const P = { lngs: msg.lang.concat("dev") };

      const userInventory = new INVENTORY(reactionUserID || msg.author.id, this.invIdentifier);
      const Inventory = await userInventory.listItems(args[10]);

      const response = { content: `${_emoji(this.emoji)} ${$t.responses.inventory[`browsing${this.browsingTag}`]} ` };

      if (Inventory.length === 0) {
      console.log('o')
        const EMPTY_EMBED = new Discord.EmbedBuilder()
          .setColor(this.color)
          .setDescription(`*${rand$t($t.responses.inventory.emptyJokes)}*`)
        response.embeds = [EMPTY_EMBED];
        return response;
      }

      const itemsPerPage = 10;

      const Pagination = async (page, mss, recursion = 0) => {
        const tot_pages = Math.ceil(Inventory.length / itemsPerPage);
        page = page > tot_pages ? tot_pages : page < 1 ? 1 : page;

        const pace = (itemsPerPage * ((page || 1) - 1));
        const pagecontent = Inventory.slice(pace, pace + itemsPerPage);
        const procedure = function (...args) {
          if (mss) return mss.edit(...args);
          return msg.channel.send(...args);
        };

        const embed = new Discord.EmbedBuilder();
        embed.setThumbnail(this.img);
        embed.setColor(0xEBBEFF);
        embed.setFooter({
          text: `${(args[12] || msg).author.tag}  |  [${page}/${tot_pages}]`,
          iconUrl: (args[12] || msg).author.avatarURL,
        })

        if (tot_pages > 0 && tot_pages < 2) {
          Inventory.forEach((itm) => displayItem(itm, embed, P));
          response.embed = embed;
          return response;
        } if (tot_pages == 0) { // soft comp to match false
          embed.setDescription(`*${rand$t($t.responses.inventory.emptyJokes)}*`);
          return { embed };
        }
        let i = 0;
        embed.fields = [];
        while (i++ < itemsPerPage) {
          const invItm = pagecontent[i - 1];
          if (!invItm) {
            embed.field("\u200b", "\u200b", true);
            continue;
          }
          displayItem(invItm, embed, P);
        }

        let mes = await procedure({ content: response.content, embeds: [embed] });
        const options = {
          page,
          tot_pages,
        };
        navigator(mes, args[12] || msg, Pagination, options, recursion);
        mes = null;
        mss = null;
      };

      return Pagination(1, originalMsg || msg);
    };

    this.cat = "inventory";
    this.botPerms = ["ATTACH_FILES", "EMBED_LINKS"];
    this.noCMD = false;
    this.scope = "inventory";
    this.related = ["boosterpack", "junk", "consumable", "key", "material", "lootbox"].filter((i) => i !== this.cmd);
  }
}

GenericItemInventory.noCMD = true;

module.exports = GenericItemInventory;
