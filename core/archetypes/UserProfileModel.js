const { ref, onValue } = require('@firebase/database');
const formatDistance = require('date-fns/formatDistance');

function XPercent(X, Lv, f = 0.0427899) {
  const toNEXT = Math.trunc(((Lv + 1) / f) ** 2);
  const toTHIS = Math.trunc((Lv / f) ** 2);
  const PACE = toNEXT - toTHIS;
  const PROGRESS = X - toTHIS;
  const percent = PROGRESS / PACE;
  return percent;
}

class UserProfileModel {
  constructor(userDBData, userDiscordData, database) {
    this.database = database;

    this.ID = userDiscordData.id;
    this.server = userDiscordData.guild?.id || 1027207847999709214;
    this.localName = userDiscordData.guild ? userDiscordData.nick || userDiscordData.user.username : userDiscordData.tag;
    this.avatar = userDiscordData.avatarURL({ extension: 'png' });
    this.bot = userDiscordData.bot;

    if (!userDBData || !userDBData.modules) {
      userDBData = { modules: {} };
      this.PARTIAL = true;
    }

    this.favColor = /^#[0-9,A-F,a-f]{6}$/.test(userDBData.modules.favColor) ? userDBData.modules.favColor : "#dd5383";
    this.tagline = userDBData.modules.tagLine || "";
    this.background = this.bot ? "IlyEEDBj0GLLlFl8n6boPLSkADNuBwke" : userDBData.modules.favBackground || "5zhr3HWlQB4OmyCBFyHbFuoIhxrZY6l6";
    this.personalText = userDBData.modules.persotext || "";
    this.exp = userDBData.modules.exp || 0;
    this.level = userDBData.modules.level || 0;
    this.percent = XPercent(this.exp, this.level) || 0;
    this.sticker = userDBData.modules.sticker || null;
    this.flair = userDBData.modules.flairTop || "default";
    this.rubines = userDBData.modules.RBN || 0;
    this.sapphires = userDBData.modules.SPH || 0;
    this.medals = Object.keys(userDBData.modules?.medals || {}) || [];
    console.log(this.medals)
    this.marriage = userDBData.marriageData || null;
    this.featMarriage = userDBData.featuredMarriage || null;
    this.commend = 0;
    const flagOverride = userDBData.switches?.flagOverride === "hidden" ? null : userDBData.switches?.flagOverride;
    this.countryFlag = flagOverride || userDBData.personal?.country || null;
    this.profileFrame = userDBData.switches?.profileFrame === true ? userDBData.donator : null;

    if (this.medals.length > 0) {
      const validMedals = this.medals.filter((mdl) => mdl && mdl !== "0").map((v) => this.medals.indexOf(v));
      const arrange = validMedals.length <= 4 ? validMedals.length : 9;
      this.medalsArrangement = { style: arrange, valid: validMedals };
    }
  }

  async getGlobalRank() {
    try {
      const snapshot = await onValue(ref(this.database, 'users'), { orderByChild: 'modules/exp', startAt: this.exp });
      const rank = snapshot.numChildren();
      this.rank = rank;
      return rank;
    } catch (error) {
      console.error('Error fetching global rank:', error);
      return null;
    }
  }

  async getCommends() {
    try {
      this.commend = 0;
      return this.commend;
    } catch (error) {
      console.error('Error fetching commends:', error);
      return null;
    }
  }

  async getLocalData() {
    try {
      if (!this.server) {
        this.thx = "---";
        this.localRank = "---";
        return false;
      }

      this.thx = 0;
      this.localRank = 0;
      return true;
    } catch (error) {
      console.error('Error fetching local data:', error);
      return false;
    }
  }

  async getWifeData() {
    try {
      if (this.wife) return this.wife;

      this.wife = null;
      return this.wife;
    } catch (error) {
      console.error('Error fetching wife data:', error);
      return null;
    }
  }
}

module.exports = UserProfileModel;
