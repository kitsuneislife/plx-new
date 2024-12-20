const { ref, onValue, set, update } = require("@firebase/database");

// Define TRANSACTION_TYPES as given in the original code

const TRANSACTION_TYPES = {
  daily: "Daily Rewards",
  webdaily: "Daily Rewards [Dashboard]",
  daily_10streak_website: "Daily 10 Streak Bonus [Dashboard]",
  daily_3streak_website: "Daily 3 Streak Bonus [Dashboard]",
  daily_250streak_website: "Daily 250 Streak Bonus [Dashboard]",
  daily_365streak_website: "Daily 365 Streak Bonus [Dashboard]",
  upvote_daily_boost_website: "Daily Upvote Bonus [Dashboard]",
  special_daily_boost_website: "Daily Special Bonus [Dashboard]",

  lootbox_drop: "Lootbox Drop: {{loot_id}}",
  lootbox_transfer: "Lootbox Transfer: {{user_id}}",

  lootbox_rewards: "Lootbox Rewards",
  lootbox_reroll: "Lootbox Reroll",
  lootbox_transfer_tax: "Lootbox Transfer Tax",

  rubine_transfer: "Rubine Transfer Fee",

  gambling_betflip: "Betflip",
  gambling_blackjack: "Blackjack",
  gambling_roulette: "Casino Roulette",
  gambling_russroll: "Russian Roulette",

  role_purchase: "Role Purchase at {{server_id}}",

  bgshop_bot: "Background Quickbuy",
  bgshop_dash: "Background Shop Classic",
  background_shop_dash: "Background Shop Classic",
  medalshop_dash: "Medal Shop Classic",
  medal_shop_dash: "Medal Shop Classic",

  bgshop_dash_bundle: "Background Shop Bundle",
  medalshop_dash_bundle: "Medal Shop Bundle",

  crafting_dash: "Crafting: [Dashboard]",
  crafting_bot: "Crafting: [Bot]",
  crafting_discovery: "Crafting: [Discovery]",

  crafting_service: "Crafting: {{player}} Service",
  crafting_advanced: "Adv.Crafting: Material Costs",

  expand_gallery_slots: "Expand Gallery Slots",
  sell_gallery_slots: "Sell Gallery Slots",
  expand_wife_slots: "Expand Marriage Slots",
  webshop_custom: "Webshop(?) - {{type}}",

  storefront_bundle: "Storefront: Bundle",
  storefront_background: "Storefront: Background",
  storefront_medal: "Storefront: Medal",
  storefront_other: "Storefront: Other",

  marketplace_buy: "Marketplace: BUY",
  marketplace_sell: "Marketplace: SELL",
  marketplace_post: "Marketplace: POST Fee",

  event_action: "Event: [{{action}}]",

  airlines: "Airlines: {{???}}",
  discoin_out: "Discoin: >> [{{currency}}]",
  discoin_in: "Discoin: << [{{currency}}]",
  local$: "Custom Currency Trade [{{currency}}]",
  local$_convert: "Trade for Rubines",
  local$_trade: "Trade with {{user_id}}",
  local$_treasury: "Custom Currency Treasury",
  local$_invest: "Custom Currency Invest",

  venture_event: "Adventure Journey Event",
  venture_insurance: "Adventure Insurance",

  adm_awarded: "Admin Awarded",
  dono_rewards: "{{tier}} Rewards: {{month}}/{{year}}",
  dono_rewards_1st: "{{tier}} Rewards: {{month}}/{{year}} (First Month Bonus)",
};

// Define CurrencyMap and currencies as given in the original code

const toCurrencies = {
  RUBINE: "RBN",
  JADE: "JDE",
  SAPPHIRE: "SPH",
  AMETHYST: "AMY",
  EMERALD: "EMD",
  TOPAZE: "TPZ",
  PRISM: "PSM",
};

const currencies = ["RBN", "JDE", "SPH", "AMY", "EMD", "TPZ", "PSM", "EVT"];

// Define parseCurrencies function

function parseCurrencies(curr) {
  const type = typeof curr;
  if (typeof curr === "string") curr = [curr.toUpperCase()];
  else currarr = curr.map((c) => c.toUpperCase());

  if (curr)
    curr = curr.map((c) =>
      toCurrencies[c]
        ? toCurrencies[c]
        : toCurrencies[c.slice(0, c.length - 1)]
          ? c.slice(0, c.length - 1)
          : c,
    );

  if (curr.some((curr) => !currencies.includes(curr)))
    throw new Error(
      `Unknown ${!curr ? "object" : typeof curr === "string" ? "currency" : "currencies"}: ${curr}`,
    );
  return type === "string" ? curr[0] : curr;
}

// Define checkFunds function

async function checkFunds(user, amount, currency = "RBN") {
  if (amount === 0) return true;
  if (!user) throw new Error(`Missing user: ${user}`);
  if (typeof amount !== "number" && !Array.isArray(amount))
    throw new TypeError(
      "Amount should be of type number or an array of numbers.",
    );
  let curr = parseCurrencies(currency);

  if (typeof amount === "number" || typeof currency === "string") {
    if (!(typeof amount === "number" && typeof curr === "string"))
      throw new TypeError(
        "amt & curr need to be a single number & string or equal length arrays.",
      );
    amount = [amount];
    curr = [curr];
  } else if (amount.length !== currency.length)
    throw new TypeError("amt & curr arrays need to be equal length");

  const uID = typeof user === "object" ? user.id : user;

  const userData = await new Promise((resolve, reject) => {
    onValue(
      ref(Kanyon.database, `Users/${uID}`),
      (snapshot) => {
        const data = snapshot.val();
        resolve(data);
      },
      { onlyOnce: true },
      (error) => {
        reject(error);
      },
    );
  });

  if (!userData) return false;

  return curr.every((c, i) => {
    if (amount[i] === 0) return true;
    if (!userData.modules[c]) return false;
    return userData.modules[c] >= amount[i];
  });
}

// Define generatePayload function

function generatePayload(
  userFrom,
  userTo,
  amt,
  type,
  curr,
  subtype,
  symbol,
  fields = {},
) {
  if (!(userFrom && type && curr && subtype && symbol && userTo))
    throw new Error("Missing arguments");
  if (typeof amt !== "number")
    throw new TypeError("Type of amount should be number.");

  if (typeof userFrom === "object") userFrom = userFrom.id;
  if (typeof userTo === "object") userTo = userTo.id;

  const now = Date.now();
  const payload = {
    subtype: subtype,
    type: type,
    currency: curr,
    transaction: symbol,
    from: userFrom,
    to: userTo,
    timestamp: now,
    transactionId: `${curr}${(now + Math.floor(Math.random() * 2000) - 1000).toString(32).toUpperCase()}`,
    amt: amt < 0 ? -amt : amt,
  };

  return { ...fields, ...payload };
}

// Define pay function

function pay(user, amt, type = "OTHER", currency = "RBN", options = {}) {
  return transfer(
    user,
    Kanyon.user.id,
    amt,
    type,
    currency,
    "PAYMENT",
    "-",
    options,
  );
}

// Define receive function

function receive(user, amt, type = "OTHER", currency = "RBN", options = {}) {
  return transfer(
    Kanyon.user.id,
    user,
    amt,
    type,
    currency,
    "INCOME",
    "+",
    options,
  );
}

// Define transfer function

async function transfer(
  userFrom,
  userTo,
  amt,
  type = "SEND",
  curr = "RBN",
  subtype = "TRANSFER",
  symbol = ">",
  options = {},
) {
  if (!(userFrom && userTo)) throw new Error("Missing arguments");
  if (typeof amt !== "number" && !Array.isArray(amt))
    throw new TypeError("Type of amount should be number or an array.");

  function createTransaction() {
    return async () => {
      const updates = {};
      const payloads = [];

      if (typeof userFrom === "object") userFrom = userFrom.id;
      if (typeof userTo === "object") userTo = userTo.id;

      const hasFunds = await checkFunds(userFrom, amt, curr);
      if (!hasFunds && !options.disableFundsCheck) throw new Error("NO FUNDS");

      curr = parseCurrencies(curr);
      if (typeof amt === "number" || typeof curr === "string") {
        if (!(typeof amt === "number" && typeof curr === "string"))
          throw new Error(
            "amt & curr need to be a single number & string or equal length arrays.",
          );
        amt = [amt];
        curr = [curr];
      } else if (amt.length !== curr.length) {
        throw new Error("amt & curr arrays need to be equal length");
      }

      for (let i = 0; i < curr.length; i++) {
        let absAmount = Math.abs(amt[i]);
        if (typeof absAmount !== "number")
          throw new TypeError("Amounts should be of type number.");
        if (absAmount === 0 && !options.allowZero) continue;

        const key = `modules/${curr[i]}`;
        const userFromCurrency = await new Promise((resolve, reject) => {
          onValue(
            ref(Kanyon.database, `Users/${userFrom}/${key}`),
            (snapshot) => {
              const data = snapshot.val();
              resolve(data);
            },
            { onlyOnce: true },
            (error) => {
              reject(error);
            },
          );
        });
        const userToCurrency = await new Promise((resolve, reject) => {
          onValue(
            ref(Kanyon.database, `Users/${userTo}/${key}`),
            (snapshot) => {
              const data = snapshot.val();
              resolve(data);
            },
            { onlyOnce: true },
            (error) => {
              reject(error);
            },
          );
        });

        updates[`Users/${userFrom}/${key}`] =
          (userFromCurrency || 0) - absAmount;
        updates[`Users/${userTo}/${key}`] = (userToCurrency || 0) + absAmount;

        payloads.push(
          generatePayload(
            userFrom,
            userTo,
            amt[i],
            type,
            curr[i],
            subtype,
            symbol,
            options.fields,
          ),
        );
      }

      if (!payloads.length) return true;

      function generateUniqueKey() {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      try {
        await update(ref(Kanyon.database), updates);

        const auditsRef = ref(Kanyon.database, "Kanyon/audits");

        let currentAuditsSnapshot = await new Promise((resolve, reject) => {
          onValue(
            auditsRef,
            (snapshot) => {
              const data = snapshot.val();
              resolve(data);
            },
            { onlyOnce: true },
            (error) => {
              reject(error);
            },
          );
        });
        currentAudits = currentAuditsSnapshot || {};

        payloads.forEach((payload) => {
          const newAuditKey = generateUniqueKey();
          currentAudits[newAuditKey] = payload;
        });

        await set(auditsRef, currentAudits);

        payloads.forEach(logTransaction);

        return payloads.length === 1 ? payloads[0] : payloads;
      } catch (error) {
        console.error("Error performing transaction:", error);
        throw error;
      }
    };
  }

  const transaction = createTransaction();
  return Kanyon.database.queue.addTask(transaction);
}

// let transactionQueue = [];
// let processingQueue = false;

// async function executeInSeries(transactions) {
//   for (const transaction of transactions) {
//     await transaction();
//   }
// }

// async function transfer(
//   userFrom,
//   userTo,
//   amt,
//   type = "SEND",
//   curr = "RBN",
//   subtype = "TRANSFER",
//   symbol = ">",
//   options = {},
// ) {
//   if (!(userFrom && userTo)) throw new Error("Missing arguments");
//   if (typeof amt !== "number" && !Array.isArray(amt))
//     throw new TypeError("Type of amount should be number or an array.");

//   function createTransaction() {
//     return async () => {
//       const updates = {};
//       const payloads = [];

//       if (typeof userFrom === "object") userFrom.id;
//       if (typeof userTo === "object") userTo = userTo.id;

//       const hasFunds = await checkFunds(userFrom, amt, curr);
//       if (!hasFunds && !options.disableFundsCheck) throw new Error("NO FUNDS");

//       curr = parseCurrencies(curr);
//       if (typeof amt === "number" || typeof curr === "string") {
//         if (!(typeof amt === "number" && typeof curr === "string"))
//           throw new Error(
//             "amt & curr need to be a single number & string or equal length arrays.",
//           );
//         amt = [amt];
//         curr = [curr];
//       } else if (amt.length !== curr.length) {
//         throw new Error("amt & curr arrays need to be equal length");
//       }

//       for (let i = 0; i < curr.length; i++) {
//         let absAmount = Math.abs(amt[i]);
//         if (typeof absAmount !== "number")
//           throw new TypeError("Amounts should be of type number.");
//         if (absAmount === 0 && !options.allowZero) continue;

//         const key = `modules/${curr[i]}`;
//         const userFromCurrency = await new Promise((resolve, reject) => {
//           onValue(
//             ref(Kanyon.database, `Users/${userFrom}/${key}`),
//             (snapshot) => {
//               const data = snapshot.val();
//               resolve(data);
//             },
//             { onlyOnce: true },
//             (error) => {
//               reject(error);
//             },
//           );
//         });
//         const userToCurrency = await new Promise((resolve, reject) => {
//           onValue(
//             ref(Kanyon.database, `Users/${userTo}/${key}`),
//             (snapshot) => {
//               const data = snapshot.val();
//               resolve(data);
//             },
//             { onlyOnce: true },
//             (error) => {
//               reject(error);
//             },
//           );
//         });

//         updates[`Users/${userFrom}/${key}`] =
//           (userFromCurrency || 0) - absAmount;
//         updates[`Users/${userTo}/${key}`] = (userToCurrency || 0) + absAmount;

//         payloads.push(
//           generatePayload(
//             userFrom,
//             userTo,
//             amt[i],
//             type,
//             curr[i],
//             subtype,
//             symbol,
//             options.fields,
//           ),
//         );
//       }

//       if (!payloads.length) return true;

//       function generateUniqueKey() {
//         return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//       }

//       try {
//         await update(ref(Kanyon.database), updates);

//         const auditsRef = ref(Kanyon.database, "Kanyon/audits");

//         let currentAuditsSnapshot = await new Promise((resolve, reject) => {
//           onValue(
//             auditsRef,
//             (snapshot) => {
//               const data = snapshot.val();
//               resolve(data);
//             },
//             { onlyOnce: true },
//             (error) => {
//               reject(error);
//             },
//           );
//         });
//         currentAudits = currentAuditsSnapshot || {};

//         payloads.forEach((payload) => {
//           const newAuditKey = generateUniqueKey();
//           currentAudits[newAuditKey] = payload;
//         });

//         await set(auditsRef, currentAudits);

//         payloads.forEach(logTransaction);

//         return payloads.length === 1 ? payloads[0] : payloads;
//       } catch (error) {
//         console.error("Error performing transaction:", error);
//         throw error;
//       }
//     };
//   }

//   const transaction = createTransaction();
//   transactionQueue.push(transaction);

//   if (!processingQueue) {
//     processingQueue = true;

//     try {
//       await executeInSeries(transactionQueue);
//     } finally {
//       processingQueue = false;
//       transactionQueue = [];
//     }
//   }
// }

// async function transfer(
//   userFrom,
//   userTo,
//   amt,
//   type = "SEND",
//   curr = "RBN",
//   subtype = "TRANSFER",
//   symbol = ">",
//   options = {},
// ) {
//   console.log(userFrom, userTo);

//   if (!(userFrom && userTo)) throw new Error("Missing arguments");
//   if (typeof amt !== "number" && !Array.isArray(amt))
//     throw new TypeError("Type of amount should be number or an array.");

//   if (typeof userFrom === "object") userFrom.id;
//   if (typeof userTo === "object") userTo = userTo.id;

//   const hasFunds = await checkFunds(userFrom, amt, curr);
//   if (!hasFunds && !options.disableFundsCheck) throw new Error("NO FUNDS");

//   curr = parseCurrencies(curr);
//   if (typeof amt === "number" || typeof curr === "string") {
//     if (!(typeof amt === "number" && typeof curr === "string"))
//       throw new Error(
//         "amt & curr need to be a single number & string or equal length arrays.",
//       );
//     amt = [amt];
//     curr = [curr];
//   } else if (amt.length !== curr.length) {
//     throw new Error("amt & curr arrays need to be equal length");
//   }

//   const updates = {};
//   const payloads = [];

//   for (let i = 0; i < curr.length; i++) {
//     let absAmount = Math.abs(amt[i]);
//     if (typeof absAmount !== "number")
//       throw new TypeError("Amounts should be of type number.");
//     if (absAmount === 0 && !options.allowZero) continue;

//     const key = `modules/${curr[i]}`;
//     const userFromCurrency = await new Promise((resolve, reject) => {
//       onValue(
//         ref(Kanyon.database, `Users/${userFrom}/${key}`),
//         (snapshot) => {
//           const data = snapshot.val();
//           resolve(data);
//         },
//         { onlyOnce: true },
//         (error) => {
//           reject(error);
//         },
//       );
//     });
//     const userToCurrency = await new Promise((resolve, reject) => {
//       onValue(
//         ref(Kanyon.database, `Users/${userTo}/${key}`),
//         (snapshot) => {
//           const data = snapshot.val();
//           resolve(data);
//         },
//         { onlyOnce: true },
//         (error) => {
//           reject(error);
//         },
//       );
//     });

//     updates[`Users/${userFrom}/${key}`] = (userFromCurrency || 0) - absAmount;
//     updates[`Users/${userTo}/${key}`] = (userToCurrency || 0) + absAmount;

//     payloads.push(
//       generatePayload(
//         userFrom,
//         userTo,
//         amt[i],
//         type,
//         curr[i],
//         subtype,
//         symbol,
//         options.fields,
//       ),
//     );
//   }

//   if (!payloads.length) return true;

//   //const userFromRef = ref(Kanyon.database, `Users/${userFrom}`);
//   //const userToRef = ref(Kanyon.database, `Users/${userTo}`);

//   function generateUniqueKey() {
//     return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   }

//   try {
//     await update(ref(Kanyon.database), updates);

//     const auditsRef = ref(Kanyon.database, "Kanyon/audits");

//     let currentAuditsSnapshot = await new Promise((resolve, reject) => {
//       onValue(
//         auditsRef,
//         (snapshot) => {
//           const data = snapshot.val();
//           resolve(data);
//         },
//         { onlyOnce: true },
//         (error) => {
//           reject(error);
//         },
//       );
//     });
//     currentAudits = currentAuditsSnapshot || {};

//     payloads.forEach((payload) => {
//       const newAuditKey = generateUniqueKey()
//       currentAudits[newAuditKey] = payload;
//     });

//     await set(auditsRef, currentAudits);

//     payloads.forEach(logTransaction);

//     return payloads.length === 1 ? payloads[0] : payloads;
//   } catch (error) {
//     console.error("Error performing transaction:", error);
//     throw error;
//   }
// }

// Define arbitraryAudit function

async function arbitraryAudit(
  from,
  to,
  amt = 1,
  type = "ARBITRARY",
  tag = "OTH",
  symbol = "!!",
  fields = {},
) {
  if (!from || !to) throw new Error("Missing arguments");
  if (typeof amt !== "number")
    throw new TypeError("Type of amt should be number.");
  const payload = generatePayload(
    from,
    to,
    amt,
    type,
    tag,
    type,
    symbol,
    fields,
  );
  const auditsRef = ref(Kanyon.database, "Kanyon/audits");
  await set(auditsRef, payload);
  return { ...fields, ...payload };
}

module.exports = {
  TRANSACTION_TYPES,
  currencies,
  arbitraryAudit,
  checkFunds,
  generatePayload,
  parseCurrencies,
  pay,
  receive,
  transfer,
};

function logTransaction(t) {
  let cleanString = `-------${t.amt}---${t.currency}-${t.type}-${t.from}----${t.to}--${t.transactionId}--`;

  let fullString = `${
    t.subtype === "PAYMENT"
      ? " [-] ".red
      : t.subtype === "TRANSFER"
        ? " [>] ".yellow
        : " [+] ".green
  } ${(" " + t.amt + " ").inverse}${
    t.currency == "RBN"
      ? " RBN ".bgRed
      : t.currency == "JDE"
        ? " JDE ".bgCyan
        : t.currency == "SPH"
          ? " SPH ".bgBlue
          : t.currency.yellow
  } ${t.type.cyan} ${t.from[t.from == Kanyon.user.id ? "red" : "cyan"]} -> ${t.to[t.to == Kanyon.user.id ? "red" : "cyan"]} ${t.subtype} -${
    t.transactionId.gray
  }- ${t.fields && Array.isArray(t.fields) ? `[${t.fields.join(" , ")}]` : ""}`;

  //console.log(fullString);
}
