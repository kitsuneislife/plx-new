// Jest.js

const Fuse = require('fuse.js');
const { QuickDB, JSONDriver } = require("quick.db");
const { v4: uuidv4 } = require('uuid');
const { collection, addDoc, getDocs } = require('@firebase/firestore');

const jsonDriver = new JSONDriver();

const characterData = require("./json/cards.json");
const seriesData = require("./json/series.json");
const disambiguationData = require("./json/cardsDisambiguation.json");

const characterFuse = new Fuse(characterData, {
  keys: ['name', 'aliases', 'series'],
  threshold: 0.3
});
const seriesFuse = new Fuse(seriesData, {
  keys: ['name', 'aliases'],
  threshold: 0.3
});

function searchCharacter(query) {
  const character = characterData.find(char => char.id === query);
  if (character) return character;

  const result = characterFuse.search(query);
  return result.length > 0 ? result[0].item : null;
}
function searchSeries(query) {
  const result = seriesFuse.search(query);
  return result.length > 0 ? result[0].item : null;
}
function searchRandomCharacter(query = {}) {
  const filteredCharacters = characterData.filter(char =>
    (!query.series || char.series === query.series) &&
    (!query.exclusive || char.exclusive)
  );

  return filteredCharacters.length ?
    filteredCharacters[Math.floor(Math.random() * filteredCharacters.length)] :
    null;
}
function getCharacterImage(characterId) {
  const character = characterData.find(char => char.id === characterId);
  if (!character) return null;

  const disambiguationInfo = disambiguationData.find(item => item._id === characterId);
  return disambiguationInfo ? disambiguationInfo.image : null;
}

function registerCard() {
  const id = uuidv4();
  return id;
}

/*
Kanyon.firestore.queue.addTask(async() => {
  try {
    const docRef = await addDoc(collection(Kanyon.firestore, "users"), {
      first: "Ada",
      last: "Lovelace",
      born: 1815
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
})*/

module.exports.initialize = function() {
  global.Jest = {
    searchCharacter,
    searchSeries,
    searchRandomCharacter,
    getCharacterImage,
    registerCard
  };
  global.Jest.database = new QuickDB({ driver: jsonDriver });
};
