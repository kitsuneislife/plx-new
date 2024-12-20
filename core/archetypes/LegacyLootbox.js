
// // const LootRates = require("@polestar/constants/lootbox");
// const { set, ref, onValue } = require("@firebase/database")
// const LootRates = {
//   "common": {
//     "chance": 0.2,
//     "min": 1,
//     "max": 3
//   },
//   "uncommon": {
//     "chance": 0.1,
//     "min": 2,
//     "max": 5
//   },
//   "rare": {
//     "chance": 0.05,
//     "min": 3,
//     "max": 7
//   },
//   "epic": {
//     "chance": 0.01,
//     "min": 5,
//     "max": 10
//   },
//   "legendary": {
//     "chance": 0.001,
//     "min": 10,
//     "max": 20
//   },
//   "mythical": {
//     "chance": 0.0001,
//     "min": 20,
//     "max": 50
//   }
// }

// const LootboxItem = require("./LootboxItem");
// /** *********************** */
// //          ODDS          //
// /** *********************** */

// const itmODDS = LootRates.LootItemType;
// const rarODDS = LootRates.LootRarity;
// //const COLORS = require("@polestar/constants/ui-colors").RarityColors;
// const COLORS = {
//   "C": "#d9d9d9",
//   "U": "#00ff00",
//   "R": "#0000ff",
//   "SR": "#ff00ff",
//   "UR": "#ff0000",
//   "MYTHIC": "#ff8000",
//   "SUPREME": "#ff0080",
//   "SPECIAL": "#ff0080",
//   "UNIQUE": "#ff0080",
//   "SHINY": "#ff0080",
//   "SECRET": "#ff0080",
//   "UNOBTAINABLE": "#ff0080",
//   "VOID": "#ff0080",
//   "MATERIAL": "#ff0080",
//   "JUNK": "#ff0080",
//   "BOOSTER": "#ff0080",
//   "BACKGROUND": "#ff0080",
//   "MEDAL": "#ff0080",
// }

// const POPULATE = (pile, no, pushee) => { while (no-- > 0) shuffle(pile).push(pushee); return shuffle(pile); };

// const itmPILE = [];
// const rarPILE = [];
// setImmediate(()=>{
//   Object.keys(itmODDS).forEach((i) => POPULATE(itmPILE, itmODDS[i], i));
//   Object.keys(rarODDS).forEach((i) => POPULATE(rarPILE, rarODDS[i], i));
// })
// //= ================================================================

// function legacyEmblem(ct, mini) {
//   if (ct.type === "medal") return "MEDAL";
//   if (ct.type === "background") return "BG";
//   if (ct.type === "boosterpack") return mini ? "BOOSTER" : "STAMP";
//   if (ct.currency === "RBN") return mini ? "RUBINES" : `RUBINE_${ct.rarity}`;
//   if (ct.currency === "JDE") return mini ? "JADES" : `JADE_${ct.rarity}`;
//   if (ct.currency === "SPH") return mini ? "SAPPHIRE" : `SAPPHIRE_${ct.rarity}`;
//   return null;
// }

// class Lootbox {
//   #size;

//   #filter;

//   constructor(rar, options = {}) {
//     this.rarity = rar;
//     this.content = [];
//     this.timestamp = Date.now();
//     this.color = COLORS[this.rarity];
//     this.id = options.id || "unknown";
//     this.event = options.event || false;
//     this.#size = options.meta?.size || 3;
//     this.#filter = options.filter;

//     const rarArray = Lootbox._shuffle(rarPILE).slice(0, this.#size - 1).concat(rar);
//     const eveArray = Lootbox._shuffle(([...new Array(this.#size - 1)]).concat(this.event));
//     const fltArray = Lootbox._shuffle(([...new Array(this.#size - 1)]).concat(this.#filter));
//     const itmArray = Lootbox._shuffle(itmPILE).slice(0, this.#size);

//     let contentBlueprint = [];
//     for (let i = 0; i < this.#size; i++) {
//       const itemTypeArray = Lootbox._shuffle(["junk", "junk", "junk", "material", "material", "junk", "key", "key"]);
//       contentBlueprint.push({
//         rarity: rarArray[i], event: eveArray[i], item: itmArray[i], itemType: itemTypeArray[0], filter: fltArray[i],
//       });
//     }

//     contentBlueprint = Lootbox._shuffle(contentBlueprint);

//     this.content = contentBlueprint.map((cbl) => {
//       const Item = new LootboxItem(cbl.item, cbl.rarity, cbl);
//       if (Item.collection) Item.fetchFrom(Item.collection);
//       else if (Item.type !== "gems") Item.fetchFrom();
//       else Item.calculateGems(cbl.item);
//       return Item;
//     });

//     this.compileVisuals = new Promise((resolve) => {
//       this.visuals = new Array(3);
//       let completed = 0;
//       this.content.forEach(async (ct, i, a) => {
//         await ct.loaded;
//         if (ct.type === "background") this.visuals[i] = (`${paths.CDN}/backdrops/${ct.code || ct.id}.png`);
//         if (ct.type === "medal") this.visuals[i] = (`${paths.CDN}/medals/${ct.icon}.png`);
//         if (ct.collection === "items") this.visuals[i] = (`${paths.CDN}/build/items/${ct.icon || ct.id}.png`);
//         if (ct.type === "boosterpack") this.visuals[i] = (`${paths.CDN}/boosters/showcase/${ct.icon}.png`);
//         if (ct.type === "gems") this.visuals[i] = (`${paths.CDN}/build/LOOT/${ct.currency}_${ct.rarity}.png`);

//         if (++completed === a.length) {
//           resolve(null);
//           delete this.compileVisuals;
//         }
//       });
//     });

//     this.legacyfy = new Promise((resolve) => {
//       this.legacy = [];
//       let completed = 0;
//       this.content.forEach(async (ct, i, a) => {
//         await ct.loaded;
//         this.legacy.push({
//           item: ct.type === "boosterpack" ? ct.id : ct.code || ct.icon || ct.id || ct.amount,
//           rarity: ct.rarity,
//           emblem: legacyEmblem(ct),
//           type: legacyEmblem(ct, true),
//           name: ct.name || ct.amount || ct.icon || ct.code || ct.id,
//         });
//         if (++completed === a.length) {
//           resolve(this.legacy);
//           delete this.legacyfy;
//         }
//       });
//     });
//   }

//   static _shuffle(arr) {
//     const newArr = arr.slice();
//     arr.forEach((_, i) => {
//       const j = Math.floor(Math.random() * (i + 1));
//       const temp = newArr[i];
//       newArr[i] = newArr[j];
//       newArr[j] = temp;
//     });
//     return newArr;
//   }
// }

// module.exports = Lootbox;