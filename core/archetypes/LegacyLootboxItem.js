
//const gemRATES = require("@polestar/constants/lootbox").LootGems;
const { set, ref, onValue } = require("@firebase/database");
const gemRATES = {
  "C": 0.5,
  "U": 0.7,
  "R": 0.8,
  "SR": 0.9,
  "UR": 1,
};

class LootboxItem {
  #filter;
  #bypass;

  constructor(t, r, p) {
    this.type = t === "BKG" ? "background"
      : t === "MDL" ? "medal"
        : t === "BPK" ? (this.collection = "items", "boosterpack")
          : t === "ITM" ? (this.collection = "items", p.itemType)
            : ["RBN", "JDE", "SPH"].includes(t) ? "gems" : null;

    this.rarity = r || "C";
    this.exclusive = p.exclusive;
    this.event = p.event;
    this.#filter = p.filter;
    this.#bypass = p.bypass || [];
  }

  fetchFrom(collection) {
    collection = collection || this.collection || "cosmetics";
    this.loaded = new Promise((resolve) => {
      let query = { rarity: this.rarity };
      query.event = this.event || null;
      query.filter = this.#filter;

      query.droppable = !this.#bypass.includes("droppable");
      if (this.type !== "boosterpack") query.public = !this.#bypass.includes("public");

      // ITEM DB FORMAT QUERY ISSUES
      if (this.collection === "items") {
        delete query.event;
        delete query.filter;
        delete query.public;
      }

      query.type = this.type;
      Object.keys(query).forEach((ky) => query[ky] ?? delete query[ky]);

      if (this.exclusive) query = [query, { exclusive: this.exclusive }]; // FIXME Is query an object or array of objects? Check where this is handled

      onValue(ref(Kanyon.database, `Kanyon/${collection}`), (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const results = [];

          // Filtrar os dados conforme a `query`
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              const item = data[key];
              let match = true;
              for (const qKey in query) {
                if (query.hasOwnProperty(qKey) && item[qKey] !== query[qKey]) {
                  match = false;
                  break;
                }
              }
              if (match) {
                results.push(item);
              }
            }
          }

          // Selecionar uma amostra aleatória
          const sample = results.length > 0 ? results[Math.floor(Math.random() * results.length)] : null;

          if (!sample) {
            this.type = "gems";
            this.calculateGems("RBN");
            this.query = query;
            resolve(this);
            return (this.loaded = true);
          } else {
            this.objectId = sample._id;
            this.id = sample.id;
            this.name = sample.name;
            this.code = sample.code;
            this.event = sample.event;
            this.icon = sample.icon;
            this.release_pack = sample.BUNDLE;
            this.isPublic = sample.public;
            resolve(this);
            return (this.loaded = true);
          }
        }
      });
    });
    return this.loaded;
  }

  calculateGems(gem) {
    const noise = randomize(-30, 100);
    this.amount = gem === "SPH" ? Math.ceil((gemRATES[this.rarity]) / 100) : Math.floor((gemRATES[this.rarity] + noise) * (gem === "JDE" ? 5 : 1));
    this.currency = gem;
    return this.amount;
  }
}

module.exports = LootboxItem;
