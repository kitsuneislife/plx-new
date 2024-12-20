// item.type
// item.name
// item.amount
// itemVisual

const LootRates = {
  LootItemType: {
    "JDE": 25,
    "RBN": 25,
    "BKG": 25,
    "MDL": 25
  },
  LootRarity: {
    "C": 100,
    "U": 50,
    "R": 35,
    "SR": 15,
    "UR": 5,
    "XR": 1,
  }
};

const LootboxItem = require("./LootboxItem.js");
/** *********************** */
//          ODDS          //
/** *********************** */

const itmODDS = LootRates.LootItemType;
const rarODDS = LootRates.LootRarity;
const COLORS = {
  C: "#928fa8",
  U: "#62b361",
  R: "#3991d6",
  SR: "#93479b",
  UR: "#dc5c54",
  XR: "#FF0000",
};

const POPULATE = (pile, no, pushee) => { while (no-- > 0) shuffle(pile).push(pushee); return shuffle(pile); };

const itmPILE = [];
const rarPILE = [];
setImmediate(()=>{
  Object.keys(itmODDS).forEach((i) => POPULATE(itmPILE, itmODDS[i], i));
  Object.keys(rarODDS).forEach((i) => POPULATE(rarPILE, rarODDS[i], i));
})
//= ================================================================

class Lootbox {
  #size;
  #filter;

  constructor(rar, options = {}) {
    this.rarity = rar;
    this.content = [];
    this.timestamp = Date.now();
    this.color = COLORS[this.rarity];
    this.id = options.id || "unknown";
    this.event = options.event || false;
    this.#size = options.meta?.size || 3;
    this.#filter = options.filter;

    const rarArray = Lootbox._shuffle(rarPILE).slice(0, this.#size - 1).concat(rar);
    const eveArray = Lootbox._shuffle(([...new Array(this.#size - 1)]).concat(this.event));
    const fltArray = Lootbox._shuffle(([...new Array(this.#size - 1)]).concat(this.#filter));
    const itmArray = Lootbox._shuffle(itmPILE).slice(0, this.#size);

    let contentBlueprint = [];
    for (let i = 0; i < this.#size; i++) {
      const itemTypeArray = Lootbox._shuffle([
        "junk",
        "junk",
        "junk",
        "material",
        "material",
        "junk",
        "key",
        "key",
      ]);
      contentBlueprint.push({
        rarity: rarArray[i],
        event: eveArray[i],
        item: itmArray[i],
        itemType: itemTypeArray[0],
        filter: fltArray[i],
      });
    }

    contentBlueprint = Lootbox._shuffle(contentBlueprint);

    this.content = contentBlueprint.map((cbl) => {
      const Item = new LootboxItem(cbl.item, cbl.rarity, cbl);
      if (Item.collection) Item.fetchFrom(Item.collection);
      else if (Item.type !== "gems") Item.fetchFrom();
      else Item.calculateGems(cbl.item);
      return Item;
    });
    console.log(this.content)

    this.compileVisuals = new Promise((resolve) => {
      this.visuals = new Array(3);
      let completed = 0;
      this.content.forEach(async (ct, i, a) => {
        await ct.loaded;
        if (ct.type === "background")
          this.visuals[i] = `${paths.CDN}/backdrops/${ct.code || ct.id}.png`;
        if (ct.type === "medal")
          this.visuals[i] = `${paths.CDN}/medals/${ct.icon}.png`;
        if (ct.collection === "items")
          this.visuals[i] = `${paths.CDN}/build/items/${ct.icon || ct.id}.png`;
        if (ct.type === "boosterpack")
          this.visuals[i] = `${paths.CDN}/boosters/showcase/${ct.icon}.png`;
        if (ct.type === "gems")
          this.visuals[i] =
            `${paths.CDN}/build/LOOT/${ct.currency}_${ct.rarity}.png`;

        if (++completed === a.length) {
          resolve(null);
          delete this.compileVisuals;
        }
      });
    });
  }
  static _shuffle(arr) {
    const newArr = arr.slice();
    arr.forEach((_, i) => {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = newArr[i];
      newArr[i] = newArr[j];
      newArr[j] = temp;
    });
    return newArr;
  }
}

module.exports = Lootbox;
