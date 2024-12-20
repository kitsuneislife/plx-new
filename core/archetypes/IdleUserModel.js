
const IdleCalc = require('../commands/idle/subject/IdleCalc.js')
const achievements = require('../commands/idle/subject/Achievements')

class IdleUserModel {
  constructor(USERDATA, User) {
    this.id = User.id;

    this.tokens = USERDATA?.idle?.tokens || 0;

    this.jadeIncomeLevel = USERDATA?.idle?.incomeLevel.jade || 1;
    this.rubineIncomeLevel = USERDATA?.idle?.incomeLevel.rubine || 1;
    this.sapphireIncomeLevel = USERDATA?.idle?.incomeLevel.sapphire || 1;

    this.storageLevel = USERDATA?.idle?.storageLevel || 1;

    this.rebirthCount = USERDATA.idle?.rebirthCount || 0;
    this.globalMultiplier = USERDATA.idle?.multipliers.global || 1;

    this.achievements = USERDATA.idle?.achievements || [];

    this.baseIncomes = {
      jade: 100, // Produção inicial de Jade
      rubine: 50, // Produção inicial de Rubine
      sapphire: 25, // Produção inicial de Sapphire
    };

    this.growthRates = {
      jade: 1.05,
      rubine: 1.07,
      sapphire: 1.09,
    };

    this.baseCosts = {
      jade: 100,
      rubine: 150,
      sapphire: 200,
    };

    this.storageBaseGrowthRate = 1.03;

    this.lastCheckTime = USERDATA?.idle?.lastCheckTime || Date.now(); // Tempo da última verificação em milissegundos

    this.resources = {
      jade: USERDATA?.idle?.resources.jade || 0,
      rubine: USERDATA?.idle?.resources.rubine || 0,
      sapphire: USERDATA?.idle?.resources.sapphire || 0,
    };
  }

  calcIncomePerMinute(resourceType) {
    const incomeLevel = this[`${resourceType}IncomeLevel`];
    const incomeBase = this.baseIncomes[resourceType];
    const growthRate = this.growthRates[resourceType];
    return IdleCalc.calcIncomePerMinute(
      incomeBase,
      incomeLevel,
      growthRate,
      this.globalMultiplier,
    );
  }

  calcStorage() {
    return IdleCalc.calcStorage(
      100,
      this.storageLevel,
      this.storageBaseGrowthRate,
      this.globalMultiplier,
    );
  }

  calcUpgradePrice(resourceType) {
    const incomeLevel = this[`${resourceType}IncomeLevel`];
    const baseCost = this.baseCosts[resourceType];
    return IdleCalc.calcUpgradePrice(
      100,
      incomeLevel,
      baseCost,
      1.07,
      this.globalMultiplier,
    );
  }

  calcStorageUpgradePrice() {
    const baseCost = 200;
    const growthRate = 1.07;
    return IdleCalc.calcUpgradePrice(
      baseCost,
      this.storageLevel,
      baseCost,
      growthRate,
      this.globalMultiplier,
    );
  }

  async calculateAccumulatedIncome(msg) {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - this.lastCheckTime) / 1000 / 60;
    this.lastCheckTime = currentTime;

    const incomeRates = {
      jade: this.calcIncomePerMinute("jade"),
      rubine: this.calcIncomePerMinute("rubine"),
      sapphire: this.calcIncomePerMinute("sapphire"),
    };

    const storageCapacity = this.calcStorage();

    let totalResources = Object.values(this.resources).reduce(
      (a, b) => a + b,
      0,
    );

    for (let resource in this.resources) {
      const income = incomeRates[resource] * elapsedTime;
      const newTotal = totalResources + income;

      if (newTotal > storageCapacity) {
        const maxIncome = storageCapacity - totalResources;
        this.resources[resource] += Math.min(income, maxIncome);
        totalResources = storageCapacity;
      } else {
        this.resources[resource] += income;
        totalResources = newTotal;
      }

      if (isNaN(this.resources[resource])) {
        console.error(`Erro ao calcular recurso ${resource}: valor NaN`);
        this.resources[resource] = 0;
      }
    }

    await this.checkAchievements(msg); 
    await this.saveToDatabase();
  }

  async checkAchievements(msg) {
    for (const achievement of achievements) {
      if (!this.achievements.includes(achievement.name) && achievement.condition(this)) {
        this.achievements.push(achievement.name);

        if (achievement.reward.tokens) {
          this.tokens += achievement.reward.tokens;
        }
        if (achievement.reward.globalMultiplier) {
          this.globalMultiplier += achievement.reward.globalMultiplier;
        }

        await this.saveToDatabase();

        const achievementMessage = `🏆 <@${msg.author.id}> **Conquista desbloqueada:** ${achievement.name} - ${achievement.description}`;
        msg.channel.send({
          content: achievementMessage,
          allowedMentions: { repliedUser: false }
        }); 
      }
    }
  }

  async saveToDatabase() {
    const userRef = `Users.${this.id}.idle`;
    const data = {
      tokens: parseFloat(this.tokens).toFixed(2),
      incomeLevel: {
        jade: parseInt(this.jadeIncomeLevel),
        rubine: parseInt(this.rubineIncomeLevel),
        sapphire: parseInt(this.sapphireIncomeLevel),
      },
      storageLevel: parseInt(this.storageLevel),
      multipliers: {
        global: parseFloat(this.globalMultiplier).toFixed(2),
      },
      lastCheckTime: parseFloat(this.lastCheckTime),
      resources: {
        jade: parseFloat(this.resources.jade).toFixed(2),
        rubine: parseFloat(this.resources.rubine).toFixed(2),
        sapphire: parseFloat(this.resources.sapphire).toFixed(2),
      },
      rebirthCount: parseInt(this.rebirthCount),
      achievements: this.achievements,
    };

    // Converter strings formatadas de volta para números antes de salvar
    data.tokens = parseFloat(data.tokens);
    data.incomeLevel.jade = parseInt(data.incomeLevel.jade);
    data.incomeLevel.rubine = parseInt(data.incomeLevel.rubine);
    data.incomeLevel.sapphire = parseInt(data.incomeLevel.sapphire);
    data.storageLevel = parseInt(data.storageLevel);
    data.multipliers.global = parseFloat(data.multipliers.global);
    data.lastCheckTime = parseFloat(data.lastCheckTime);
    data.resources.jade = parseFloat(data.resources.jade);
    data.resources.rubine = parseFloat(data.resources.rubine);
    data.resources.sapphire = parseFloat(data.resources.sapphire);
    data.rebirthCount = parseInt(data.rebirthCount);

    // Salvar no banco de dados
    await qdb.set(userRef, data);
  }
}

module.exports = IdleUserModel;
