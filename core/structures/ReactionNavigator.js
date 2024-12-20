/**
 *
 * @param {object} m Message that will receive the reactions
 * @param {object} msg Original command messages
 * @param {function} pagefun Pagination function
 * @param {object} options
 * @param {number|10e3} options.time Timeout timer
 * @param {string} options.content Default content for the message
 * @param {object} options.embed Message embed or embed template
 * @param {boolean|false} options.avoidEdit Avoid automatic edit
 * @param {object} options.strings
 * @param {string} options.strings.timeout Timeout text
 * @param {number|1} options.page Starting Page
 * @param {number|1} options.tot_pages Total pages
 * @param {number|30} rec Maximum recursion, never larger than 30
 */

module.exports = async function ReactionNavigator(m, msg, pagefun, options = {}, rec = 0) {
  if (rec > 30) return msg.reply("`Navigation Limit Reached`");

  const time = options.time || 10000;
  const content = options.content || m.content?.[0] || "";
  const embed = options.embed || m.embeds?.[0] || false;
  const avoidEdit = options.avoidEdit || true;
  const strings = options.strings || {};
  strings.timeout = strings.timeout || "TIMEOUT";

  const page = options.page || 1;
  const totPages = options.tot_pages || 1;

  const isFirst = page === 1;
  const isLast = page === totPages;

  if (!isFirst) m.react("◀");
  if (!isLast) m.react("▶");

  const filter = (reaction, user) => ["◀", "▶"].includes(reaction.emoji.name) && user.id === msg.author.id;

  m.awaitReactions({ filter, max: 1, time: time })
    .then(async collected => {
      const reaction = collected.first();

      if (!reaction) {
        m.reactions.removeAll().catch(() => null);
        if (embed && !avoidEdit) {
          embed.setColor(16499716);
          embed.setFooter(strings.timeout);
          m.edit({ content, embed });
        }
        return;
      }

      m.reactions.removeAll().catch(() => null);

      if (!isFirst && reaction.emoji.name === "◀") {
        await pagefun(page - 1, m, rec + 1);
      }

      if (!isLast && reaction.emoji.name === "▶") {
        await pagefun(page + 1, m, rec + 1);
      }
    })
    .catch(() => {
      m.reactions.removeAll().catch(() => null);
    });
};
