
// const Discord = require("discord.js");

// const initLeaderboard = async (Kanyon, message, args) => {
//   try {
//     let allUsersData = await qdb.get('Users');
//     let usersArray = Object.values(allUsersData);
//     let sortedUsers = usersArray.sort((a, b) => b.idle.tokens - a.idle.tokens);
//     let leaderboard = sortedUsers.slice(0, 10).map((user, index) => {
//       return `${index + 1}. ${user.username} - ${user.idle.tokens} tokens`;
//     }).join('\n');

//     let VIEW_EMBED = new Discord.EmbedBuilder()
//       .setColor("#DD5383")
//       .setTitle("Kanyon Idle - Leaderboard")
//       .setDescription(leaderboard);

//     message.reply({
//       embeds: [VIEW_EMBED],
//       allowedMentions: { repliedUser: false },
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
//     options: [],
//     guilds: ["789382326680551455"],
//   },
//   botPerms: ["EmbedLinks"],
//   aliases: ["idlelb"],
//   name: "idleleaderboard",
//   perms: 3,
//   init: initLeaderboard,
//   cat: "idle",
// };
