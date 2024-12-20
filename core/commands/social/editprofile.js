// const Discord = require("discord.js");
// const { set, ref, onValue } = require("@firebase/database");

// const UserProfileModel = require("../../archetypes/UserProfileModel.js");
// const itemDataSnapshot = require("../../../appRoot/items/itemDataSnapshotv3.json");

// function findItem(array, conditions) {
//   const results = array.filter((item) => {
//     return Object.entries(conditions).every(
//       ([key, value]) => item[key] === value,
//     );
//   });

//   if (results.length === 0) return false;
//   if (results.length === 1) return results[0];

//   const randomIndex = Math.floor(Math.random() * results.length);
//   return results[randomIndex];
// }

// const init = async (Kanyon, message, args) => {
//   try {
//     const Target = message.author;
//     const USERDATA = await Kanyon.databaseResolveUser(Target.id);
//     const USERPROFILE = new UserProfileModel(USERDATA, Target, Kanyon.database);
//     console.log(USERPROFILE);

//     function medalMap() {
//       return USERPROFILE.medals.map(
//         (mdl) =>
//           new Object({
//             name: findItem(itemDataSnapshot, { icon: mdl }).name,
//             icon: mdl,
//           }),
//       );
//     }
//     function medalString() {
//       let result = "```smalltalk\n[";
//       for (let i = 0; i < 9; i++) {
//         result += `${medalMap()[i]?.icon || ""}]`;
//         if ((i + 1) % 3 !== 0 && i !== 8) {
//           result += " [";
//         }
//         if ((i + 1) % 3 === 0 && i !== 8) {
//           result += `\n[`;
//         }
//       }

//       result += "```";

//       return result;
//     }
//     function medalUnequipOptions() {
//       return USERPROFILE.medals.map(
//         (mdl) =>
//           new Object({
//             label: findItem(itemDataSnapshot, { icon: mdl }).name,
//             value: mdl,
//           }),
//       );
//     }
//     function medalUnequipPicker() {
//       return new Discord.StringSelectMenuBuilder()
//         .setCustomId(`editProfile:medalUnequip:${message.author.id}`)
//         .setPlaceholder("Escolha uma medalha para desequipar")
//         .addOptions(medalUnequipOptions());
//     }

//     if (args[0] == "medal" && !args[1]) {
//       let MEDAL_EMBED = new Discord.EmbedBuilder().setDescription(`
//                         **\\ℹ  -  Opcões disponíveis parar \`${Kanyon.prefix}pedit medal\`:**

//                        *\`${Kanyon.prefix}pedit medal \u200b\`*\u200b**\`equip [id]\`** = Equipar uma medalha
//                        *\`${Kanyon.prefix}pedit medal \u200b\`*\u200b**\`unequip [id]\`** \t = Desequipar uma medalha
//                        \u200b`);

//       await message.reply({
//         embeds: [MEDAL_EMBED],
//         allowedMentions: { repliedUser: false },
//       });
//       return;
//     }

//     if (args[0] == "medal" && args[1] == "equip") {
//       return;
//     }

//     if (args[0] == "medal" && args[1] == "unequip") {
//       let MEDAL_UNEQUIP_EMBED = new Discord.EmbedBuilder()
//         .setTitle("🥇 Medalhas")
//         .setDescription(
//           `     ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ${medalString()}`,
//         )
//         .setColor(USERPROFILE.favColor);

//       let msg = await message.reply({
//         embeds: [MEDAL_UNEQUIP_EMBED],
//         components: [
//           new Discord.ActionRowBuilder().addComponents(medalUnequipPicker()),
//         ],
//         allowedMentions: { repliedUser: false },
//       });

//       const collector = msg.createMessageComponentCollector({
//         time: 60_000,
//       });
//       collector.on("collect", async (i) => {
//         if (i.user.id === message.author.id) {
//           const [_, type] = i.customId.split(":");

//           if (type == "medalUnequip") {
//             return i.deferUpdate();
//           }

//           let toEdit = {};

//           //await msg.edit(toEdit);
//           i.deferUpdate();
//         } else {
//           await i.reply({
//             content: `These buttons aren't for you!`,
//             ephemeral: true,
//           });
//         }
//       });

//       collector.on("end", async (i) => {
//         msg.edit({
//           allowedMentions: { repliedUser: false },
//           components: [],
//         });
//         return;
//       });

//       return;
//     }

//     let selectedButton = "";
//     const createButtons = (selectedButton, disabled = false) => [
//       [
//         {
//           style:
//             selectedButton === "favColor"
//               ? Discord.ButtonStyle.Primary
//               : Discord.ButtonStyle.Secondary,
//           label: selectedButton === "favColor" ? "Cor" : "",
//           custom_id: `editProfile:favColor:${message.author.id}`,
//           emoji: "🎨",
//           disabled: disabled,
//         },
//         {
//           style:
//             selectedButton === "favBackground"
//               ? Discord.ButtonStyle.Primary
//               : Discord.ButtonStyle.Secondary,
//           label: selectedButton === "favBackground" ? "Fundo" : "",
//           custom_id: `editProfile:favBackground:${message.author.id}`,
//           emoji: "🖼️",
//           disabled: disabled,
//         },
//         {
//           style:
//             selectedButton === "medal"
//               ? Discord.ButtonStyle.Primary
//               : Discord.ButtonStyle.Secondary,
//           label: selectedButton === "medal" ? "Medalhas" : "",
//           custom_id: `editProfile:medal:${message.author.id}`,
//           emoji: "🥇",
//           disabled: disabled,
//         },
//       ],
//     ];

//     const favColorOptions = [
//       { label: "Padrão", value: "#DD5383" },
//       { label: "Vermelho", value: "#FF0000" },
//       { label: "Azul", value: "#0000FF" },
//       { label: "Verde", value: "#008000" },
//       { label: "Amarelo", value: "#FFFF00" },
//       { label: "Laranja", value: "#FFA500" },
//       { label: "Roxo", value: "#800080" },
//       { label: "Rosa", value: "#FFC0CB" },
//       { label: "Marrom", value: "#A52A2A" },
//       { label: "Cinza", value: "#808080" },
//       { label: "Preto", value: "#000000" },
//       { label: "Branco", value: "#FFFFFF" },
//     ];

//     function filterFavColorOptions(favColor) {
//       return favColorOptions.filter((option) => option.value !== favColor);
//     }
//     function favColorPicker() {
//       return new Discord.StringSelectMenuBuilder()
//         .setCustomId(`editProfile:favColorPicker:${message.author.id}`)
//         .setPlaceholder("Escolha uma cor")
//         .addOptions(filterFavColorOptions(USERPROFILE.favColor));
//     }

//     const favBackgroundOptions = Object.keys(
//       USERDATA.modules.backgroundInventory || {},
//     ).map((key) => ({
//       label: USERDATA.modules.backgroundInventory[key].name,
//       value: USERDATA.modules.backgroundInventory[key].code,
//     }));

//     function filterFavBackgroundOptions(favBackground) {
//       return favBackgroundOptions.filter(
//         (option) => option.value !== favBackground,
//       );
//     }
//     function favBackgroundPicker() {
//       return new Discord.StringSelectMenuBuilder()
//         .setCustomId(`editProfile:favBackgroundPicker:${message.author.id}`)
//         .setPlaceholder("Escolha um Fundo")
//         .addOptions(filterFavBackgroundOptions(USERPROFILE.background));
//     }

//     //console.log(medalMap());

//     let EMBED = new Discord.EmbedBuilder()
//       .setTitle("Editar perfil")
//       .addFields(
//         {
//           name: ":art: Cor favorita",
//           value: `\`${USERPROFILE.favColor}\``,
//           inline: true,
//         },
//         {
//           name: "✏️ Texto do perfil",
//           value: `\`Edite com ${Kanyon.prefix}ptxt\``,
//           inline: true,
//         },
//         {
//           name: "🥇 Medalhas",
//           value: `${medalString()}Edite as suas medalhas com \`${Kanyon.prefix}pedit medal\``,
//           inline: false,
//         },
//         {
//           name: ":frame_photo: Fundo",
//           value: `\`${findItem(itemDataSnapshot, { code: USERPROFILE.background }).name}\``,
//           inline: false,
//         },
//       )
//       .setFooter({
//         text: Target.tag,
//         iconURL: Target.displayAvatarURL(),
//       })
//       .setImage(
//         `${paths.CDN}/backdrops/${USERPROFILE.background}.png${USERPROFILE.background === USERPROFILE.id ? `?invalidate=${Date.now() / 1000 / 30}` : ""} `,
//       )
//       .setColor(USERPROFILE.favColor);

//     const msg = await message.reply({
//       embeds: [EMBED],
//       components: createButtons(selectedButton).map((row) =>
//         new Discord.ActionRowBuilder().addComponents(
//           row.map((button) => new Discord.ButtonBuilder(button)),
//         ),
//       ),
//       allowedMentions: { repliedUser: false },
//     });

//     const collector = msg.createMessageComponentCollector({
//       time: 60_000,
//     });
//     collector.on("collect", async (i) => {
//       if (i.user.id === message.author.id) {
//         const [_, type] = i.customId.split(":");

//         if (type === "favColorPicker") {
//           await Kanyon.databaseUpdateProfile(
//             Target.id,
//             "favColor",
//             i.values[0],
//           );
//           EMBED.setColor(i.values[0]);
//           EMBED.data.fields[0].value = `\`${i.values[0]}\``;
//           USERPROFILE.favColor = i.values[0];
//           selectedButton = "";
//           message.reply({
//             content: $t.responses.profile.favColorUpdate.replace(
//               "{{favColor}}",
//               `\`${i.values[0]}\``,
//             ),
//             allowedMentions: { repliedUser: false },
//           });
//         }
//         if (type === "favBackgroundPicker") {
//           await Kanyon.databaseUpdateProfile(
//             Target.id,
//             "favBackground",
//             i.values[0],
//           );
//           EMBED.data.fields[3].value = `\`${findItem(itemDataSnapshot, { code: i.values[0] }).name}\``;
//           EMBED.setImage(
//             `${paths.CDN}/backdrops/${i.values[0]}.png${USERPROFILE.background === USERPROFILE.id ? `?invalidate=${Date.now() / 1000 / 30}` : ""} `,
//           );
//           USERPROFILE.favBackground = i.values[0];
//           selectedButton = "";
//           message.reply({
//             content: $t.responses.profile.favBackgroundUpdate.replace(
//               "{{favBackground}}",
//               `\`${findItem(itemDataSnapshot, { code: i.values[0] }).name}\``,
//             ),
//             allowedMentions: { repliedUser: false },
//           });
//         }

//         let validSelections = ["favColor", "favBackground", "medal"];
//         if (selectedButton === type) return i.deferUpdate();
//         if (validSelections.includes(type)) selectedButton = type;

//         let toEdit = {
//           embeds: [EMBED],
//           allowedMentions: { repliedUser: false },
//           components: createButtons(selectedButton).map((row) =>
//             new Discord.ActionRowBuilder().addComponents(
//               row.map((button) => new Discord.ButtonBuilder(button)),
//             ),
//           ),
//         };

//         if (type === "favColor") {
//           toEdit.components.push(
//             new Discord.ActionRowBuilder().addComponents(favColorPicker()),
//           );
//         }

//         if (type === "favBackground") {
//           toEdit.components.push(
//             new Discord.ActionRowBuilder().addComponents(favBackgroundPicker()),
//           );
//         }

//         await msg.edit(toEdit);
//         i.deferUpdate();
//       } else {
//         await i.reply({
//           content: `These buttons aren't for you!`,
//           ephemeral: true,
//         });
//       }
//     });

//     collector.on("end", async (i) => {
//       msg.edit({
//         allowedMentions: { repliedUser: false },
//         components: createButtons(selectedButton, true).map((row) =>
//           new Discord.ActionRowBuilder().addComponents(
//             row.map((button) => new Discord.ButtonBuilder(button)),
//           ),
//         ),
//       });
//       return;
//     });
//   } catch (error) {
//     console.error(error);
//     await message.reply("Ocorreu um erro ao executar o comando.");
//   }
// };

// module.exports = {
//   pub: true,
//   slashable: true,
//   slashOptions: {
//     options: [
//       {
//         name: "private",
//         description: "Show this only to yourself",
//         type: 5,
//         required: false,
//       },
//     ],
//     guilds: ["789382326680551455"],
//     //global: true,
//   },
//   botPerms: ["EmbedLinks"],
//   aliases: ["pedit"],
//   name: "editprofile",
//   perms: 3,
//   init,
//   cat: "economy",
// };
