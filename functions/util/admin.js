const admin = require('firebase-admin');  
const serviceAccount = require("../admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://swisher-ce70b.appspot.com"

});


const db = admin.firestore()

module.exports = { admin, db };