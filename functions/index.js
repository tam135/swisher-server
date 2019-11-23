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

const db = admin.firestore()

app.get('/swishes', (req, res) => {
    db
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
    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists) {
                return res.status(400).json({ handle: 'this handle is already taken'}) 
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)          
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(token => {
            token = token;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
            .then(() => {
                return res.status(201).json({ token });
            })
        .catch(err => {
            console.error(err);
            if (err.code === "auth/email-already-in-use") {
                return res.status(400).json({ email: 'Email is already in use' })
            } else {
                return res.status(500).json({ error: err.code });
            }
              
        })

    
})

exports.api = functions.https.onRequest(app);
//eyJhbGciOiJSUzI1NiIsImtpZCI6IjhhMzY5M2YxMzczZjgwYTI1M2NmYmUyMTVkMDJlZTMwNjhmZWJjMzYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc3dpc2hlci1jZTcwYiIsImF1ZCI6InN3aXNoZXItY2U3MGIiLCJhdXRoX3RpbWUiOjE1NzQ0ODczMDQsInVzZXJfaWQiOiJ2QzdvYXMyR2xPTkdiRE8zcjVuTEduaURqQzcyIiwic3ViIjoidkM3b2FzMkdsT05HYkRPM3I1bkxHbmlEakM3MiIsImlhdCI6MTU3NDQ4NzMwNCwiZXhwIjoxNTc0NDkwOTA0LCJlbWFpbCI6InVzZXIyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJ1c2VyMkBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.QkPsoh5iUumRy4u3NowTrE4WXqtEnLJbPywsglV2TuUibHTC7bMHa1hE_utNouiJghm0a-baMQO2b7H8TBuf5JvN9eFvsROCBP06Z-7p4VYbNMVt1wvd3lwPJ5AFGNMPI5-LMQdqX6mc7UFo4PxShAIMNlqmaeFEet-nS1nUHSH7x1asrfKNlVeoSzKAevfNhYVq6kQwkOy8PIYd3_R-b4aMzBGTmyau8dk-mZL_VBkyyo1u66rNcUQxqlA17-9nhwqgsthWBnn1tDptsXK13ozu2JZ8xmePX8GehRTPbJKVKyyo24ezuhW_7tkro9uNSKwos0BI-IzvTaRFO1ZR8Q