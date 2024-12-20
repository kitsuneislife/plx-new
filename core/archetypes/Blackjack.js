const decks = new Map();
const games = {
  async set(playerID) {
    const key = `blackjack-ongoing:${playerID}`;
    await Kanyon.redis.set(key, 'true');
    await Kanyon.redis.expire(key, 30);
    return true
  },
  async has(playerID) {
    const value = await Kanyon.redis.get(`blackjack-ongoing:${playerID}`);
    return value !== null;
  },
  async delete(playerID) {
    return await Kanyon.redis.expire(`blackjack-ongoing:${playerID}`, 1);
    return true
  },
};

const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const SUITS = ["C", "D", "H", "S"];
const DECK_TEMPLATE = SUITS.map((suit) =>
  RANKS.concat(RANKS)
    .concat(RANKS)
    // .concat(RANKS)
    .map((rank) => rank + suit),
).reduce((array, arr) => array.concat(arr));

class Blackjack {
  constructor(msg, decks = 1) {
    this.guildID = msg.guild.id;
    this.playerID = msg.author.id;
    this.deck = [];
    this.deckAmount = decks;
    this.init();
  }

  async init() {
    await games.set(this.playerID);
  }

  getHand(options) {
    return this.hit(this.hit([]), options);
  }

  hit(hand, powerups) {
    if (this.deck.length === 0) {
      if ((decks.get(this.guildID)?.length || 0) !== 0)
        this.deck = decks.get(this.guildID);
      else {
        let iterations = this.deckAmount;
        this.deck = Blackjack._shuffle(DECK_TEMPLATE);
        while (iterations-- > 0)
          this.deck.concat(Blackjack._shuffle(DECK_TEMPLATE));
        decks.set(this.guildID, this.deck);
        //this.deck.push("JOKER-default");
        this.deck = Blackjack._shuffle(this.deck);
      }

      this.jokersLoaded = true;
      this.deck = Blackjack._shuffle(this.deck);
    }

    if (powerups?.jokers) {
      let jokers = powerups.jokers.length || 0;
      while (jokers-- > 0) {
        this.deck.push(powerups.jokers[jokers]);
        this.deck = Blackjack._shuffle(this.deck);
      }
    }

    if (powerups?.nojoker) {
      const incr = 0;
      while (this.deck[this.deck.length - 1].includes("JOKER")) {
        this.deck = Blackjack._shuffle(this.deck);
        if (incr > 5) break;
      }
    }
    hand.push(this.deck.pop());
    return hand;
  }

  async endGame() {
    return await games.delete(this.playerID);
  }

  cardsRemaining() {
    return decks.get(this.guildID)?.length || this.decks.length;
  }

  static async gameExists(playerID) {
    return await games.has(playerID);
  }

  static isSoft(hand) {
    if (hand.find((card) => card.startsWith("JOKER"))) return false;

    let value = 0;
    let aces = 0;
    hand.forEach((card) => {
      value += Blackjack._cardValue(card);
      if (Blackjack._cardValue(card) === 11) aces += 1;
    });
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    if (value === 21 && hand.length === 2) return false;
    return aces !== 0;
  }

  static handValue(hand) {
    let value = 0;
    let aces = 0;
    if (hand.find((card) => card && card?.startsWith("JOKER")))
      return hand.find((card) => card?.startsWith("JOKER"));

    hand.forEach((card) => {
      value += Blackjack._cardValue(card);
      if (Blackjack._cardValue(card) === 11) aces += 1;
    });
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    if (value === 21 && hand.length === 2) return "Blackjack";
    return value;
  }

  static _cardValue(card) {
    if (card === "JOKER") return 99;

    const index = RANKS.indexOf(card.slice(0, -1));
    if (index === 0) return 11;
    return index >= 10 ? 10 : index + 1;
  }

  static _shuffle(array) {
    const newArray = array.slice();
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = newArray[i];
      newArray[i] = newArray[j];
      newArray[j] = temp;
    }
    return newArray;
  }
}
module.exports = Blackjack;