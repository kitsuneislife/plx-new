
const { set, ref, onValue } = require("@firebase/database")
const newEmoji = _emoji`new`;

const init = async (Kanyon, msg) => {
  const dref = ref(Kanyon.database, `Users/${msg.author.id}`)
  const Target = msg.author.id

  try {
    const callback = (snapshot) => snapshot.val(); 
    const [userDataSnapshot, stickerDataSnapshot, boosterDataSnapshot] = await Promise.all([
      new Promise((resolve, reject) => {
        onValue(ref(Kanyon.database, `Users/${Target.id}`), (snapshot) => {
          resolve(snapshot.val());
        }, { onlyOnce: true });
      }),
      new Promise((resolve, reject) => {
        onValue(ref(Kanyon.database, `Users/${Target.id}/cosmetics`), (snapshot) => {
          resolve(snapshot.val());
        }, { onlyOnce: true });
      }),
      new Promise((resolve, reject) => {
        onValue(ref(Kanyon.database, `Users/${Target.id}/items`), (snapshot) => {
          resolve(snapshot.val());
        }, { onlyOnce: true });
      })
    ]);

    const userData = userDataSnapshot;
    const stickerData = Object.values(stickerDataSnapshot ?? {});
    const boosterData = Object.values(boosterDataSnapshot ?? {});

    if (!userData) return 'User Not Registered';
    const collection = msg.args[0];

    function getRandomSticker(col, exc) {
      const pile = shuffle(stickerData.filter((stk) => stk.series_id === col && stk.id !== exc));
      return pile[randomize(0, pile.length - 1)];
    }

    const stk1 = getRandomSticker(collection);
    if (!stk1) return 'Collection does not exist!';
    const stk2 = getRandomSticker(collection, stk1.id);
    const stk1new = !userData.modules.stickerInventory.includes(stk1.id);
    const stk2new = !userData.modules.stickerInventory.includes(stk2.id);

    const embed = new Discord.EmbedBuilder();

    const thisPack = boosterData.find((b) => b.id === `${collection}_booster`);
    const P = {
      boostername: thisPack.name,
      dashboard: `[Dashboard](https://yourdashboardlink.com/dashboard#/stickers)`
    };

    embed.setTitle('Booster Title');
    embed.setColor('#36393f');
    embed.setDescription(`------------------------------------------------\n`
      + `${stk1new ? newEmoji : ':record_button:'} ${stk1.rarity}  ${stk1.name}\n`
      + `${stk2new ? newEmoji : ':record_button:'} ${stk2.rarity}  ${stk2.name}\n`
      + `------------------------------------------------\nCheck Stickers At: ${P.dashboard}`);

    embed.setImage(`${paths.GENERATORS}/boosterpack/${collection}/${stk1.id}/${stk2.id}/booster.png?anew=${stk1new}&bnew=${stk2new}`);
    embed.setThumbnail(`${paths.CDN}build/boosters/showcase/${collection}.png`);
    embed.setFooter(msg.author.tag, msg.author.avatarURL);

    userData.modules.stickerInventory[stk1.id] = true;
    userData.modules.stickerInventory[stk2.id] = true;
    delete userData.items[thisPack.id]
    await Promise.all([
      new Promise((resolve, reject) => {
        try {
          set(ref(ref(Kanyon.database, `Users/${Target.id}`)), userData)
          resolve(true)
        } catch (e) {
          console.log(e)
        }
      })
    ]);

    return msg.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error:', error);
    return msg.channel.send('An error occurred while processing your request.');
  }
};

module.exports = {
  init,
  pub: false,
  argsRequired: true,
  name: 'openbooster',
  perms: 3,
  cat: 'cosmetics',
  botPerms: ['ATTACH_FILES', 'EMBED_LINKS'],
  aliases: []
};
