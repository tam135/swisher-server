const functions = require('firebase-functions');
const admin = require('firebase-admin');  
const serviceAccount = require('./admin.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const express = require('express');
const app = express();
const firebase = require('firebase')


var config = {
  apiKey: "AIzaSyAyj0b1aa_5b6535LvrS8SzaCqwVjR72oQ",
  authDomain: "swisher-ce70b.firebaseapp.com",
  databaseURL: "https://swisher-ce70b.firebaseio.com",
  projectId: "swisher-ce70b",
  storageBucket: "swisher-ce70b.appspot.com",
  messagingSenderId: "26849947657",
  appId: "1:26849947657:web:5c645723ea6adb3202c8d8",
  measurementId: "G-5B18VESC3K"
};

firebase.initializeApp(config);

app.get('/swishes', (req, res) => {
    admin
      .firestore()
      .collection("swishes")
      .orderBy('createdAt', 'desc')
      .get()
      .then(data => {
        let swishes = [];
        data.forEach(doc => {
          swishes.push({
              swishId: doc.id,
              body: doc.data().body,
              userHandle: doc.data().userHandle,
              createdAt: doc.data().createdAt
          });
        });
        return res.json(swishes);
      })
      .catch(err => console.error(err));
})

app.post('/swish', (req, res) => {
    if(req.method !== 'POST') {
        return res.status(400).json({ error: 'Method not allowed' });
    }
  const newSwish = {
      body: req.body.body,
      userHandle: req.body.userHandle,
      createdAt: new Date().toISOString()
  };

  admin.firestore()
    .collection('swishes')
    .add(newSwish)
    .then(doc => {
        res.json({ message: `document ${doc.id} created successfully`});
    })
    .catch(err => {
        res.status(500).json({ error: 'something went wrong'})
        console.log(err)
    })
});

// Sign up route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };

    // TODO: validate data

    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then(data => {
            return res.status(201).json({ message: `user ${data.user.uid} signed up successfully` })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
})

exports.api = functions.https.onRequest(app);