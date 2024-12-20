
const { set, ref, onValue } = require("@firebase/database");
async function initializeItemDatabase() {
  return new Promise((resolve, reject) => {
    onValue(ref(Kanyon.database, `Kanyon/items/${collection}`), (snapshot) => {
      const data = snapshot.val();
      resolve(data);
    }, { onlyOnce: true }, (error) => {
      reject(error);
    });
  });
}

let itemDataSnapshot = require('../../appRoot/items/itemDataSnapshotv3.json');

function findItem(array, conditions) {
  const results = array.filter(item => {
    return Object.entries(conditions).every(([key, value]) => item[key] === value);
  });

  if (results.length === 0) return false;
  if (results.length === 1) return results[0];

  const randomIndex = Math.floor(Math.random() * results.length);
  return results[randomIndex];
}

const gemRATES = {
  C: 10,
  U: 25,
  R: 50,
  SR: 100,
  UR: 250,
  XR: 500
};

class LootboxItem {
  #filter;
  #bypass;

  constructor(t, r, p) {
    this.type =
      t === "BKG"
        ? "background"
        : t === "MDL"
          ? "medal"
          : t === "BPK"
            ? ((this.collection = "items"), "boosterpack")
            : t === "ITM"
              ? ((this.collection = "items"), p.itemType)
              : ["RBN", "JDE", "SPH"].includes(t)
                ? "gems"
                : null;

    this.rarity = r || "C";
    this.exclusive = p.exclusive || false;
    this.event = p.event || null;
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
      if (this.type !== "boosterpack")
        query.public = !this.#bypass.includes("public");

      // ITEM DB FORMAT QUERY ISSUES
      if (this.collection === "items") {
        delete query.event;
        delete query.filter;
        delete query.public;
      }

      query.type = this.type;
      Object.keys(query).forEach((ky) => query[ky] ?? delete query[ky]);

      if (this.exclusive) query = [query, { exclusive: this.exclusive }]; // FIXME Is query an object or array of objects? Check where this is handled

      query = { rarity: this.rarity, type: this.type, droppable: true }
      // console.log(collection)
      const itemSnapshot = findItem(itemDataSnapshot, query);
      console.log(itemSnapshot)
      if(itemSnapshot) {
        this.objectId = itemSnapshot._id;
        this.id = itemSnapshot.id || itemSnapshot.icon;
        this.name = itemSnapshot.name;
        this.code = itemSnapshot.code || itemSnapshot.icon;
        this.event = itemSnapshot.event || null;
        this.icon = itemSnapshot.icon || itemSnapshot.code;
        this.release_pack = itemSnapshot.BUNDLE || null;
        this.isPublic = itemSnapshot.public;
        resolve(this);
        return (this.loaded = true);
      } else {
        this.type = "gems";
        this.calculateGems("RBN");
        this.query = query;
        resolve(this);
        return (this.loaded = true);
      }
      /*DB[collection].aggregate([
          { $match: query },
          { $sample: { size: 1 } },
        ]).then((res) => {
          [res] = res;
          if (!res) {
            this.type = "gems";
            this.calculateGems("RBN");
            this.query = query;
            resolve(this);
            return (this.loaded = true);
          }
          this.objectId = res._id;
          this.id = res.id;
          this.name = res.name;
          this.code = res.code;
          this.event = res.event;
          this.icon = res.icon;
          this.release_pack = res.BUNDLE;
          this.isPublic = res.public;
          resolve(this);
          return (this.loaded = true);
        });*/
    });
  }

  calculateGems(gem) {
    const noise = randomize(1, 100);
    this.amount =
      gem === "SPH"
        ? Math.ceil(gemRATES[this.rarity] / 100)
        : Math.floor((gemRATES[this.rarity] + noise) * (gem === "JDE" ? 5 : 1));
    this.currency = gem;
    return this.amount;
  }
}

module.exports = LootboxItem;
