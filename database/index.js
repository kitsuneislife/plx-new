const firebase                   = require('@firebase/app');
const { getDatabase }            = require('@firebase/database');
const { getFirestore }           = require('@firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.firebaseApiKey,
  authDomain: "fakekyde.firebaseapp.com",
  databaseURL: "https://fakekyde-default-rtdb.firebaseio.com",
  projectId: "fakekyde",
  storageBucket: "fakekyde.appspot.com",
  messagingSenderId: "486241215166",
  appId: "1:486241215166:web:c3ee4560340d9242ecf4ef",
  measurementId: "G-N38511HG81"
};

const app = firebase.initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);

module.exports = { database, firestore };