const functions = require('firebase-functions');
const admin = require('firebase-admin');  
const serviceAccount = require('./admin.json')

admin.initializeApp( {
    credential: admin.credential.cert(serviceAccount)
});

const express = require('express');
const app = express();

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
      createdAt: admin.firestore.Timestamp.fromDate(new Date())
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

exports.api = functions.https.onRequest(app);