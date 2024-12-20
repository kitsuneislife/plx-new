const { set, ref, onValue } = require("@firebase/database");

class InventoryCommand {
  constructor(user, invType, options) {
    this.userID = user.id || user;
    this.invType = invType || "";
    this.db = options?.db || "inventory";
    this.Items = new Promise((resolve) => {
      const itemsRef = ref(Kanyon.database, `Users/${this.userID}/items`);
      onValue(
        itemsRef,
        (snapshot) => {
          resolve(snapshot.val());
        },
        { onlyOnce: true },
      );
    }).catch((err) => {
      console.error("Error fetching items:", err);
      return [];
    });
  }

  async listItems(uD) {
    try {
      if (!uD || !uD.modules)
        uD = await Kanyon.databaseResolveUser(this.userID);

      const items = await this.Items;

      if (!items) {
        console.log("No items found for user:", this.userID);
        return [];
      }

      const inv = Object.values(items)
        .map((itm) => {
          const thisItem = Object.values(uD.modules[this.db])?.find(
            (it) => it.id === itm.id && it.count > 0,
          );
          return thisItem ? ((itm.count = thisItem.count), itm) : null;
        })
        .filter((i) => i != null);

      return inv;
    } catch (error) {
      console.error("Error listing items:", error);
      return [];
    }
  }
}

module.exports = InventoryCommand;
