module.exports = {
  calcIncomePerMinute: function(incomeBase, incomeLevel, growthRate, globalMultiplier, multiplier = 1) {
      return parseFloat((incomeBase * Math.pow(growthRate, incomeLevel - 1) * globalMultiplier * multiplier).toFixed(2));
  },

  calcStorage: function(capacityType, capacityLevel, baseGrowthRate, globalMultiplier, multiplier = 1) {
      return parseFloat((capacityType * Math.pow(baseGrowthRate, capacityLevel) * 10 * globalMultiplier * multiplier).toFixed(2));
  },

  calcUpgradePrice: function(upgradeType, upgradeLevel, baseCost, growthRate, globalMultiplier = 1, multiplier = 1) {
      return Math.round(baseCost * upgradeType * Math.pow(growthRate, upgradeLevel) * globalMultiplier * multiplier);
  },

}
