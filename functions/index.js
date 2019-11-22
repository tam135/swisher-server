const functions = require('firebase-functions');
const admin = require('firebase-admin');  

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello world!");
 });

exports.getSwishes = functions.https.onRequest((request, res) => {
    admin.firestore().collection('swishes').get()
        .then((data) => {
            let swishes = []
            data.forEach(doc => {
                swishes.push(doc.data());
            })
            return res.json(swishes)
        })
        .catch((err) => console.error(err))
 })