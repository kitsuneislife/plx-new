
const IdleUserModel = require("../../archetypes/IdleUserModel.js");
const achievements = require('./subject/Achievements')

const checkAchievements = async (Kanyon, user) => {
  for (const achievement of achievements) {
    if (
      !user.achievements.includes(achievement.name) &&
      achievement.condition(user)
    ) {
      user.achievements.push(achievement.name);

      if (achievement.reward.tokens) {
        user.tokens += achievement.reward.tokens;
      }
      if (achievement.reward.globalMultiplier) {
        user.globalMultiplier += achievement.reward.globalMultiplier;
      }

      await user.saveToDatabase();

      const achievementMessage = `🏆 **Conquista desbloqueada:** ${achievement.name} - ${achievement.description}`;
    }
  }
};

const viewAchievements = async (Kanyon, message, args) => {
  try {
    const Target = message.author;
    let USERDATA = await qdb.get(`Users.${Target.id}`);
    let IDLEUSER = new IdleUserModel(USERDATA, Target);

    let VIEW_EMBED = new Discord.EmbedBuilder()
      .setColor("#DD5383")
      .setTitle(":medal: Conquistas")
      .addFields({
        name: "Conquistas Desbloqueadas",
        value:
          IDLEUSER?.achievements?.length > 0
            ? IDLEUSER?.achievements?.join("\n")
            : "Nenhuma conquista desbloqueada ainda.",
      });

    message.reply({
      embeds: [VIEW_EMBED],
      allowedMentions: { repliedUser: false },
    });
  } catch (error) {
    console.error(error);
    await message.reply("Ocorreu um erro ao tentar visualizar as conquistas.");
  }
};

module.exports = {
  pub: true,
  slashable: true,
  slashOptions: {
    options: [
      {
        name: "private",
        description: "Show this only to yourself",
        type: 5,
        required: false,
      },
    ],
    guilds: ["789382326680551455"],
    //global: true,
  },
  botPerms: ["EmbedLinks"],
  aliases: ["idleconquistas", "idleaq"],
  name: "idleachievements",
  perms: 3,
  init: viewAchievements,
  cat: "idle",
};
